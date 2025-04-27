import { Search } from "lucide-react";
import { Input } from "@/app/[locale]/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";

type SearchType = "all" | "name" | "profile";

interface SubstanceSearchProps {
  searchQuery: string;
  searchType: SearchType;
  onSearchChange: (query: string) => void;
  onSearchTypeChange: (type: SearchType) => void;
}

export function SubstanceSearch({
  searchQuery,
  searchType,
  onSearchChange,
  onSearchTypeChange,
}: SubstanceSearchProps) {
  return (
    <div className="flex gap-2 w-full sm:w-96">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search substances..."
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
        </SelectContent>
      </Select>
    </div>
  );
}
