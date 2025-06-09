import './index.css';

// File: src/App.tsx
import React, { useState } from "react";
import Map from "./components/Map";
import villagesData from "./data/villages.json";
import type { Village } from "./components/Map";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import UploadVillageData from "./components/UploadVillageData";

export default function App() {
  const allVillages: Village[] = villagesData as Village[];
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "visited" | "planned" | "not-visited">("all");

  const filteredVillages = allVillages.filter((village) => {
    const matchesSearch = village.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || village.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: allVillages.length,
    visited: allVillages.filter(v => v.status === "visited").length,
    planned: allVillages.filter(v => v.status === "planned").length,
    notVisited: allVillages.filter(v => v.status === "not-visited").length,
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">

      {/* Left Panel */}
      <div className="w-full md:w-[20rem] lg:w-[22rem] border-r p-4 space-y-4 bg-white overflow-y-auto">
        <h2 className="text-xl font-bold">📍 Village Dashboard</h2>

        {/* Stats */}
        <div className="space-y-1">
         <Badge variant="default">Visited: {stats.visited}</Badge>
         <Badge variant="default">Planned: {stats.planned}</Badge>
         <Badge variant="default">Not Visited: {stats.notVisited}</Badge>
        </div>

        {/* Search */}
        <Input
  type="text"
  placeholder="Search village..."
  value={search}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
/>


        {/* Filters */}
        <div className="space-x-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "visited" ? "default" : "outline"} onClick={() => setFilter("visited")}>Visited</Button>
          <Button variant={filter === "planned" ? "default" : "outline"} onClick={() => setFilter("planned")}>Planned</Button>
          <Button variant={filter === "not-visited" ? "default" : "outline"} onClick={() => setFilter("not-visited")}>Not Visited</Button>
        </div>

        {/* Results */}
        <ul className="space-y-1 text-sm pt-2">
          {filteredVillages.map((v) => (
            <li key={v.id} className="border p-2 rounded-md">
              <p className="font-semibold">{v.name}</p>
              <p className="text-xs text-muted-foreground">{v.tehsil} • Pop: {v.population}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Map */}
      <div className="flex-1">
        <Map />
      </div>
    </div>
  );
}
