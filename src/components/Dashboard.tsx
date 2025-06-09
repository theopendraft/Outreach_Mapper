// src/components/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Village = {
  id: string;
  name: string;
  tehsil: string;
  coords: [number, number];
  population: number;
  status: "visited" | "planned" | "not-visited";
  lastInteraction?: string;
  nextVisitTarget?: string;
  notes?: string;
  parents: { name: string; contact: string }[];
};

export default function Dashboard() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    visited: true,
    planned: true,
    notVisited: true,
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "villages"), (snapshot) => {
      const villages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Village[];
      setVillages(villages);
    });
    return () => unsubscribe();
  }, []);

  const filteredVillages = villages.filter((village) => {
    const matchesSearch = village.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      (filters.visited && village.status === "visited") ||
      (filters.planned && village.status === "planned") ||
      (filters.notVisited && village.status === "not-visited");
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: villages.length,
    visited: villages.filter((v) => v.status === "visited").length,
    planned: villages.filter((v) => v.status === "planned").length,
    notVisited: villages.filter((v) => v.status === "not-visited").length,
  };

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
