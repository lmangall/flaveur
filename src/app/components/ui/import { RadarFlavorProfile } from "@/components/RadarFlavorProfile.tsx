"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type FlavorProfileData = {
  attribute: string;
  value: number;
};

type RadarFlavorProfileProps = {
  initialData?: FlavorProfileData[];
  onSave?: (data: FlavorProfileData[]) => void;
  className?: string;
};

export function RadarFlavorProfile({
  initialData = [
    { attribute: "Sweetness", value: 50 },
    { attribute: "Sourness", value: 50 },
    { attribute: "Bitterness", value: 50 },
    { attribute: "Umami", value: 50 },
    { attribute: "Saltiness", value: 50 },
  ],
  onSave,
  className = "",
}: RadarFlavorProfileProps) {
  const [chartData, setChartData] = useState<FlavorProfileData[]>(initialData);
  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (index: number, newValue: number) => {
    setChartData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value: newValue } : item))
    );
    setIsChanged(true);
  };

  const handleSaveButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (onSave) {
      onSave(chartData);
    }
    setIsChanged(false);
  };

  const chartConfig = {
    value: {
      label: "Intensity",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Radar Chart */}
      <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
        <RadarChart data={chartData}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <PolarGrid />
          <PolarAngleAxis dataKey="attribute" />
          <Radar
            dataKey="value"
            fill="blue"
            fillOpacity={0.6}
            dot={{ r: 4, fillOpacity: 1 }}
          />
        </RadarChart>
      </ChartContainer>

      {/* Adjusters */}
      <div className="flex flex-col gap-1 text-xs w-1/2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            {/* Label */}
            <label className="w-3/5 text-right">{item.attribute}</label>

            {/* Editable Text */}
            <span
              contentEditable
              suppressContentEditableWarning
              className="w-12 px-1 py-0.5 text-center border rounded bg-muted/50"
              onBlur={(e) => handleChange(index, Number(e.target.textContent))}
            >
              {item.value}
            </span>
          </div>
        ))}
        {isChanged && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 self-end text-xs px-2 py-1"
            onClick={handleSaveButton}
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
}
