import React, { useEffect, useState, useMemo, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './../lib/firebase';
import type { Village } from './Map';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FiSearch, FiX, FiDownload, FiPlus, FiChevronRight, FiChevronLeft, FiMenu } from "react-icons/fi";

type Props = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  filter: 'all' | 'visited' | 'planned' | 'not-visited';
  setFilter: React.Dispatch<React.SetStateAction<'all' | 'visited' | 'planned' | 'not-visited'>>;
  onAddVillage?: () => void;
};

export default function MapSummaryPanel({ search, setSearch, filter, setFilter, onAddVillage }: Props) {
  const [villages, setVillages] = useState<Village[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true); // State to manage panel open/close

  // Width resize state & refs
  const panelRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'villages'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setVillages(data as Village[]);
      setLoading(false);
    });
    return () => {
      unsub();
      setLoading(false);
    };
  }, []);

  // Resize handlers
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isResizing.current || !panelRef.current) return;
      const dx = e.clientX - startX.current;
      const newWidth = Math.min(Math.max(startWidth.current + dx, 220), 600);
      panelRef.current.style.width = `${newWidth}px`;
    }
    function onMouseUp() {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    if (!panelRef.current) return;
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelRef.current.offsetWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }

  // Filtered villages
  const filteredVillages = useMemo(() => {
    return villages.filter(v =>
      v.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'all' || v.status === filter)
    );
  }, [villages, search, filter]);

  // Stats
  const stats = useMemo(() => ({
    total: villages.length,
    visited: villages.filter(v => v.status === 'visited').length,
    planned: villages.filter(v => v.status === 'planned').length,
    notVisited: villages.filter(v => v.status === 'not-visited').length,
  }), [villages]);

  // Export to CSV
  const handleExport = () => {
    const csvRows = [
      ['Name', 'Tehsil', 'Status', 'Population', 'Coords'],
      ...filteredVillages.map(v =>
        [v.name, v.tehsil || '', v.status.replace('-', ' '), v.population ?? '', v.coords ? v.coords.join(',') : '']
      ),
    ];
    const csvContent = csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'villages.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  function getStatusBadgeClasses(status: Village['status']) {
    return (
      "mt-1 sm:mt-0 inline-block px-2 py-0.5 rounded-full text-xs font-medium " +
      (status === "visited"
        ? "bg-green-100 text-green-700"
        : status === "planned"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700")
    );
  }

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside
      ref={panelRef}
      className={`
        bg-white
        border rounded-2xl
        shadow-md
        p-5
        flex
        flex-col
        gap-6
        overflow-y-auto
        h-screen
        sticky top-4
        z-30
        transition-all
        duration-300
        ${isOpen ? 'w-full md:w-[360px]' : 'w-16 overflow-hidden'}
      `}
      style={{
        minWidth: isOpen ? '220px' : '4rem',
        maxWidth: '600px',
        userSelect: isResizing.current ? 'none' : 'auto',
      }}
      aria-label="Map summary panel"
    >
      {/* Toggle Button */}
      <button
        className="absolute top-5 right-5 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        onClick={togglePanel}
        aria-label={isOpen ? "Close Summary Panel" : "Open Summary Panel"}
      >
        <FiMenu size={20} />
      </button>

      {isOpen && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight select-none">Map Summary</h2>
            <Button
              variant="outline"
              className="md:hidden"
              onClick={onAddVillage}
              title="Add Village"
              aria-label="Add Village"
            >
              <FiPlus />
            </Button>
          </div>

          {/* Search */}
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search villages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-10 bg-gray-50 placeholder-gray-400 text-gray-900 rounded-xl border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
              aria-label="Search villages"
              spellCheck={false}
              autoComplete="off"
            />
            {search ? (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <FiX size={18} />
              </button>
            ) : (
              <FiSearch
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Status Filter & Stats Combined */}
          <div className="flex flex-wrap gap-3" role="group" aria-label="Filter villages by status">
            {[
              { label: "All", value: "all", color: "bg-gray-200 text-gray-700", count: stats.total },
              { label: "Visited", value: "visited", color: "bg-green-100 text-green-700", count: stats.visited },
              { label: "Planned", value: "planned", color: "bg-yellow-100 text-yellow-700", count: stats.planned },
              { label: "Not Visited", value: "not-visited", color: "bg-red-100 text-red-700", count: stats.notVisited },
            ].map(opt => (
              <button
                key={opt.value}
                className={`
                  flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold transition select-none
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                  ${filter === opt.value
                    ? `${opt.color} ring-2 ring-blue-400 shadow-sm`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
                `}
                onClick={() => setFilter(opt.value as any)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setFilter(opt.value as any);
                  }
                }}
                tabIndex={0}
                aria-pressed={filter === opt.value}
                type="button"
              >
                {opt.label}
                <span className="ml-1 bg-white/70 text-xs px-2 py-0.5 rounded-full border border-gray-200">{opt.count}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 flex items-center justify-center gap-2"
              onClick={onAddVillage}
              variant="default"
              aria-label="Add a new village"
              type="button"
            >
              <FiPlus /> Add Village
            </Button>
            <Button
              className="flex-1 flex items-center justify-center gap-2"
              variant="outline"
              onClick={handleExport}
              aria-label="Export village list as CSV"
              type="button"
            >
              <FiDownload /> Export
            </Button>
          </div>

          {/* Filtered List Preview */}
          <div className="mt-4 flex flex-col flex-1 min-h-0">
            <div className="text-xs text-gray-500 mb-1 select-none">
              Showing <span className="font-semibold">{filteredVillages.length}</span> of <span className="font-semibold">{villages.length}</span> villages
            </div>

            <ul className="overflow-y-auto space-y-3 max-h-full flex-1 min-h-0">
              {loading ? (
                <li className="text-gray-400 text-center py-6 select-none" aria-live="polite" aria-busy="true">Loading villages...</li>
              ) : filteredVillages.length === 0 ? (
                <li className="text-gray-400 text-center py-6 select-none" aria-live="polite">
                  No villages found. Try adjusting your search or filters.
                </li>
              ) : (
                (showAll ? filteredVillages : filteredVillages.slice(0, 5)).map(v => (
                  <li
                    key={v.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow hover:bg-blue-50 transition select-text"
                    tabIndex={0}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-gray-900">{v.name}</div>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-3">
                        {v.tehsil && <span>Tehsil: {v.tehsil}</span>}
                        {typeof v.population === "number" && <span>Pop: {v.population.toLocaleString()}</span>}
                      </div>
                    </div>
                    <span className={getStatusBadgeClasses(v.status)} aria-label={`Status: ${v.status.replace("-", " ")}`}>
                      {v.status === "visited" ? "Visited" : v.status === "planned" ? "Planned" : "Not Visited"}
                    </span>
                  </li>
                ))
              )}
              {!loading && filteredVillages.length > 5 && !showAll && (
                <li className="text-center mt-3 select-none">
                  <button
                    className="text-blue-600 hover:underline text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                    onClick={() => setShowAll(true)}
                    type="button"
                    aria-label={`Show all ${filteredVillages.length} villages`}
                  >
                    Show all ({filteredVillages.length})
                  </button>
                </li>
              )}
              {!loading && showAll && filteredVillages.length > 5 && (
                <li className="text-center mt-3 select-none">
                  <button
                    className="text-blue-600 hover:underline text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                    onClick={() => setShowAll(false)}
                    type="button"
                    aria-label="Show less villages"
                  >
                    Show less
                  </button>
                </li>
              )}
            </ul>
          </div>
        </>
      )}

      {/* Drag Resizer */}
      {isOpen && (
        <div
          ref={resizerRef}
          onMouseDown={onMouseDown}
          className="absolute top-0 right-0 h-full w-1 cursor-ew-resize z-40"
          aria-hidden="true"
          title="Drag to resize panel width"
        />
      )}
    </aside>
  );
}
