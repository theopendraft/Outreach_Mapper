// src/components/Dashboard.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  filters: {
    visited: boolean;
    planned: boolean;
    notVisited: boolean;
  };
  setFilters: (filters: Props["filters"]) => void;
  search: string;
  setSearch: (search: string) => void;
  stats: {
    total: number;
    visited: number;
    planned: number;
    notVisited: number;
  };
};

export default function Dashboard({
  filters,
  setFilters,
  search,
  setSearch,
  stats,
}: Props) {
  return (
    <div className="w-full max-w-full md:max-w-xs md:w-80 p-4 bg-white border-r shadow-md space-y-6 h-auto md:h-screen overflow-y-auto">
      <h2 className="text-xl font-semibold">Village Tracker Dashboard</h2>

      {/* 📊 Stats */}
      <Card>
        <CardContent className="p-4 space-y-1">
          <p>Total Villages: {stats.total}</p>
          <p className="text-green-600">Visited: {stats.visited}</p>
          <p className="text-yellow-600">Planned: {stats.planned}</p>
          <p className="text-red-600">Not Visited: {stats.notVisited}</p>
        </CardContent>
      </Card>

      {/* 🔍 Search */}
      <div>
        <Label htmlFor="search">Search by Name</Label>
        <Input
          id="search"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Enter village name"
        />
      </div>

      {/* ✅ Filters */}
      <div>
        <h4 className="font-medium mb-2">Filter by Status</h4>
        <div className="flex flex-row items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.visited}
              onCheckedChange={(val: boolean | "indeterminate") => setFilters({ ...filters, visited: !!val })}
            />
            <Label>Visited</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.planned}
              onCheckedChange={(val: boolean | "indeterminate") => setFilters({ ...filters, planned: !!val })}
            />
            <Label>Planned</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.notVisited}
              onCheckedChange={(val: boolean | "indeterminate") => setFilters({ ...filters, notVisited: !!val })}
            />
            <Label>Not Visited</Label>
          </div>
        </div>
      </div>
      
    </div>
  );
}
