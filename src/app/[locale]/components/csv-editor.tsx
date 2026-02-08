"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/app/[locale]/components/ui/input";
import { Button } from "@/app/[locale]/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface CSVEditorProps {
  value: string;
  onChange: (csv: string) => void;
  className?: string;
  editable?: boolean;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === "," || char === ";") && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(content: string): string[][] {
  const lines = content
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  return lines.map(parseCSVLine);
}

function escapeCSVCell(cell: string): string {
  if (
    cell.includes(",") ||
    cell.includes(";") ||
    cell.includes('"') ||
    cell.includes("\n")
  ) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

function rowsToCSV(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCSVCell).join(",")).join("\n");
}

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  isHeader?: boolean;
  onTab?: (shift: boolean) => void;
  editable?: boolean;
}

function EditableCell({
  value,
  onChange,
  isHeader,
  onTab,
  editable = true,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleBlur();
      onTab?.(e.shiftKey);
    }
  };

  if (!editable) {
    return (
      <div
        className={cn(
          "min-h-[28px] px-2 py-1",
          isHeader && "font-semibold",
          !value && "text-muted-foreground italic"
        )}
      >
        {value || "(empty)"}
      </div>
    );
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="border-primary h-7 px-2 py-1 text-sm"
      />
    );
  }

  return (
    <div
      onClick={() => {
        setEditValue(value);
        setIsEditing(true);
      }}
      className={cn(
        "hover:bg-muted/50 min-h-[28px] cursor-text rounded-sm px-2 py-1 transition-colors",
        isHeader && "font-semibold",
        !value && "text-muted-foreground italic"
      )}
    >
      {value || "(empty)"}
    </div>
  );
}

export function CSVEditor({
  value,
  onChange,
  className,
  editable = true,
}: CSVEditorProps) {
  const [rows, setRows] = useState(() => parseCSV(value));

  const updateCell = useCallback(
    (rowIdx: number, colIdx: number, newValue: string) => {
      setRows((prev) => {
        const newRows = prev.map((row, rIdx) => {
          if (rIdx !== rowIdx) return row;
          return row.map((cell, cIdx) => (cIdx === colIdx ? newValue : cell));
        });
        onChange(rowsToCSV(newRows));
        return newRows;
      });
    },
    [onChange]
  );

  const addRow = useCallback(() => {
    setRows((prev) => {
      const numCols = prev[0]?.length || 3;
      const newRows = [...prev, Array(numCols).fill("")];
      onChange(rowsToCSV(newRows));
      return newRows;
    });
  }, [onChange]);

  const addColumn = useCallback(() => {
    setRows((prev) => {
      const newRows = prev.map((row) => [...row, ""]);
      onChange(rowsToCSV(newRows));
      return newRows;
    });
  }, [onChange]);

  const deleteRow = useCallback(
    (rowIdx: number) => {
      if (rows.length <= 1) return;
      setRows((prev) => {
        const newRows = prev.filter((_, idx) => idx !== rowIdx);
        onChange(rowsToCSV(newRows));
        return newRows;
      });
    },
    [rows.length, onChange]
  );

  const deleteColumn = useCallback(
    (colIdx: number) => {
      if ((rows[0]?.length || 0) <= 1) return;
      setRows((prev) => {
        const newRows = prev.map((row) => row.filter((_, idx) => idx !== colIdx));
        onChange(rowsToCSV(newRows));
        return newRows;
      });
    },
    [rows, onChange]
  );

  const handleTab = useCallback(
    (rowIdx: number, colIdx: number, shift: boolean) => {
      const numCols = rows[0]?.length || 0;
      let newCol = colIdx + (shift ? -1 : 1);
      let newRow = rowIdx;

      if (newCol < 0) {
        newRow--;
        newCol = numCols - 1;
      } else if (newCol >= numCols) {
        newRow++;
        newCol = 0;
      }

      if (newRow >= 0 && newRow < rows.length) {
        const cellKey = `${newRow}-${newCol}`;
        const cell = document.querySelector(
          `[data-cell-key="${cellKey}"]`
        ) as HTMLElement;
        cell?.click();
      }
    },
    [rows]
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-sm">
          {rows.length > 0 && (
            <thead>
              <tr className="bg-muted/50">
                {rows[0].map((cell, colIdx) => (
                  <th
                    key={colIdx}
                    className="border-border border-b px-1 py-1 text-left"
                    data-cell-key={`0-${colIdx}`}
                  >
                    <div className="flex items-center gap-1">
                      <EditableCell
                        value={cell}
                        onChange={(v) => updateCell(0, colIdx, v)}
                        isHeader
                        onTab={(shift) => handleTab(0, colIdx, shift)}
                        editable={editable}
                      />
                      {editable && rows[0].length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                          onClick={() => deleteColumn(colIdx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </th>
                ))}
                {editable && <th className="w-8" />}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.slice(1).map((row, rowOffset) => {
              const rowIdx = rowOffset + 1;
              return (
                <tr key={rowIdx} className="group hover:bg-muted/30">
                  {row.map((cell, colIdx) => (
                    <td
                      key={colIdx}
                      className="border-border border-b px-1 py-1"
                      data-cell-key={`${rowIdx}-${colIdx}`}
                    >
                      <EditableCell
                        value={cell}
                        onChange={(v) => updateCell(rowIdx, colIdx, v)}
                        onTab={(shift) => handleTab(rowIdx, colIdx, shift)}
                        editable={editable}
                      />
                    </td>
                  ))}
                  {editable && (
                    <td className="w-8 px-1">
                      {rows.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => deleteRow(rowIdx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editable && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4 mr-1" />
            Add Row
          </Button>
          <Button variant="outline" size="sm" onClick={addColumn}>
            <Plus className="h-4 w-4 mr-1" />
            Add Column
          </Button>
        </div>
      )}
    </div>
  );
}
