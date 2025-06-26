import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { Input } from "./input";

export default function GlobalVillageSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    // Geocode via Nominatim API
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const [lat, lon] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        window.dispatchEvent(
          new CustomEvent("global-location", {
            detail: { coords: [lat, lon] },
          })
        );
      } else {
        alert("Location not found on OpenStreetMap.");
      }
    } catch (error) {
      alert("Failed to fetch location.");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xs mr-2">
      <Input
        type="text"
        placeholder="Search village or location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-10 text-sm"
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
        aria-label="Search"
        disabled={loading}
      >
        <FiSearch className="w-5 h-5" />
      </button>
    </form>
  );
}
