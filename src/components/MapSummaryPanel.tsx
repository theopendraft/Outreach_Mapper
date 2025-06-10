// src/components/MapSummaryPanel.tsx
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './../lib/firebase';
import type { Village } from './Map'; // existing Village type
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function MapSummaryPanel({
  search,
  setSearch,
  filter,
  setFilter,
}: {
  search: string;
  setSearch: (v: string) => void;
  filter: 'all' | 'visited' | 'planned' | 'not-visited';
  setFilter: (v: 'all' | 'visited' | 'planned' | 'not-visited') => void;
}) {
  const [villages, setVillages] = useState<Village[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'villages'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setVillages(data); // cast as Village[]
    });
    return () => unsub();
  }, []);

  const stats = {
    total: villages.length,
    visited: villages.filter(v => v.status === 'visited').length,
    planned: villages.filter(v => v.status === 'planned').length,
    notVisited: villages.filter(v => v.status === 'not-visited').length,
  };

  return (
    <div className="w-[20rem] p-4 border-r bg-white overflow-y-auto space-y-4">
      <h2 className="text-xl font-semibold">Village Summary</h2>

      <div className="space-y-1">
        <Badge variant="default">Total: {stats.total}</Badge>
        <Badge variant="default">Visited: {stats.visited}</Badge>
        <Badge variant="default">Planned: {stats.planned}</Badge>
        <Badge variant="default">Not Visited: {stats.notVisited}</Badge>
      </div>

      <Input
        placeholder="Search villages..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-x-2">
        {['all', 'visited', 'planned', 'not-visited'].map(status => (
          <Button key={status} variant={filter === status ? 'default' : 'outline'} onClick={() => setFilter(status as any)}>
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
}
