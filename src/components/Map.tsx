import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
import L from "leaflet";
import villagesData from "../data/villages.json";
import { EditVillageModal } from "./EditVillageModal";

// Types
export type Parent = {
  name: string;
  contact: string;
};

export type Village = {
  id: string | number;
  name: string;
  tehsil: string;
  coords: [number, number];
  population: number;
  status: "visited" | "planned" | "not-visited" | string;
  lastInteraction?: string;
  nextVisitTarget?: string;
  notes?: string;
  parents: Parent[];
};

const iconUrls = {
  visited: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  planned: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  "not-visited": "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
};

function createIcon(status: string) {
  return new L.Icon({
    iconUrl: iconUrls[status as keyof typeof iconUrls] || iconUrls["not-visited"],
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
}

const LOCAL_STORAGE_KEY = "village-tracker-villages";

export default function Map() {
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [addingVillage, setAddingVillage] = useState(false);
  const [newVillageCoords, setNewVillageCoords] = useState<[number, number] | null>(null);

  // Load from localStorage or fallback to JSON
  useEffect(() => {
    const storedVillages = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedVillages) {
      try {
        setVillages(JSON.parse(storedVillages) as Village[]);
      } catch (e) {
        setVillages(villagesData as Village[]);
      }
    } else {
      setVillages(villagesData as Village[]);
    }
  }, []);

  // Save to localStorage utility
  const saveVillagesToLocalStorage = (villagesToSave: Village[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(villagesToSave));
    } catch (e) {
      console.error("Failed to save villages to localStorage:", e);
    }
  };

  const handleEditClick = (village: Village) => {
    console.log("Edit button clicked for village:", village.name);
    setEditingVillage(village);
  };

  // Save handler for add/edit
  const handleSaveVillage = (updatedVillage: Village) => {
    setVillages((prev) => {
      const updatedVillages = prev.some((v) => v.id === updatedVillage.id)
        ? prev.map((v) => (v.id === updatedVillage.id ? updatedVillage : v))
        : [...prev, updatedVillage];
      saveVillagesToLocalStorage(updatedVillages);
      return updatedVillages;
    });
    setSelectedVillage(updatedVillage);
    setEditingVillage(null);
    if (addingVillage) {
      setAddingVillage(false);
      setNewVillageCoords(null);
    }
  };

  const handleModalClose = () => {
    console.log("Modal closed");
    setEditingVillage(null);
  };

  return (
    <>
      <button
        className="fixed top-4 right-4 z-[1000] px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
        onClick={() => setAddingVillage(true)}
      >
        + Add New Village
      </button>
      <MapContainer
        center={[22.68411, 77.26887]}
        zoom={11}
        className={`h-screen w-full ${addingVillage && !newVillageCoords ? "cursor-pin" : ""}`}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Only enable map click when addingVillage and no coords yet */}
        {addingVillage && !newVillageCoords && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1001] bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow">
            Click on the map to select the new village location.
          </div>
        )}
        {addingVillage && !newVillageCoords && (
          <AddVillageOnMap onSelect={setNewVillageCoords} />
        )}

        {villages.map((village) => (
          <Marker
            key={village.id}
            position={village.coords}
            icon={createIcon(village.status)}
            eventHandlers={{
              click: () => setSelectedVillage(village),
            }}
          >
            {selectedVillage && selectedVillage.id === village.id && (
              <Popup
                position={village.coords}
                eventHandlers={{
                  remove: () => setSelectedVillage(null),
                }}
              >
                <div>
                  <h3 className="font-bold text-lg">{village.name}</h3>
                  <p>Status: {village.status}</p>
                  <p>Last Interaction: {village.lastInteraction || "N/A"}</p>
                  <h4 className="font-semibold mt-2">Parents:</h4>
                  {village.parents?.length > 0 ? (
                    <ul className="list-disc ml-5">
                      {village.parents.map((parent, idx) => (
                        <li key={idx}>
                          {parent.name} - {parent.contact}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No parent data available</p>
                  )}
                  <button
                    className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => handleEditClick(village)}
                  >
                    Edit Village
                  </button>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      {editingVillage && (
        <EditVillageModal
          village={editingVillage}
          onClose={handleModalClose}
          onSave={handleSaveVillage}
        />
      )}
      {addingVillage && newVillageCoords && (
        <EditVillageModal
          village={{
            id: Date.now(),
            name: "",
            tehsil: "",
            coords: newVillageCoords,
            population: 0,
            status: "",
            parents: [],
            notes: "",
          }}
          onClose={() => {
            setAddingVillage(false);
            setNewVillageCoords(null);
          }}
          onSave={(newVillage) => {
            setVillages((prev) => [...prev, newVillage]);
            setAddingVillage(false);
            setNewVillageCoords(null);
          }}
        />
      )}
    </>
  );
}

function AddVillageOnMap({ onSelect }: { onSelect: (coords: [number, number]) => void }) {
  useMapEvent("click", (e) => {
    onSelect([e.latlng.lat, e.latlng.lng]);
  });
  return null;
}

