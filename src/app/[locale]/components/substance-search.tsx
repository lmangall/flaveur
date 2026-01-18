import { Search } from "lucide-react";
import { Input } from "@/app/[locale]/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";

type SearchType = "all" | "name" | "profile" | "cas_id" | "fema_number";

interface SubstanceSearchProps {
  searchQuery: string;
  searchType: SearchType;
  onSearchChange: (query: string) => void;
  onSearchTypeChange: (type: SearchType) => void;
  placeholder?: string;
}

export function SubstanceSearch({
  searchQuery,
  searchType,
  onSearchChange,
  onSearchTypeChange,
  placeholder = "Search substances...",
}: SubstanceSearchProps) {
  return (
    <div className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={searchType}
        onValueChange={(value) => onSearchTypeChange(value as SearchType)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Search type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Fields</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="profile">Profile</SelectItem>
          <SelectItem value="cas_id">CAS ID</SelectItem>
          <SelectItem value="fema_number">FEMA Number</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
