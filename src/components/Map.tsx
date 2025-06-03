import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export default function Map() {
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [villages, setVillages] = useState<Village[]>(villagesData as Village[]);
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);

  const handleEditClick = (village: Village) => {
    console.log("Edit button clicked for village:", village.name);
    setEditingVillage(village);
  };

  const handleSaveVillage = (updatedVillage: Village) => {
    console.log("Saving updated village:", updatedVillage.name);
    setVillages((prev) =>
      prev.map((v) => (v.id === updatedVillage.id ? updatedVillage : v))
    );
    setSelectedVillage(updatedVillage); // Update popup if open
    setEditingVillage(null); // Close the modal after saving
  };

  const handleModalClose = () => {
    console.log("Modal closed");
    setEditingVillage(null);
  };

  return (
    <>
      <MapContainer
        center={[ 22.68411, 77.26887]}
        zoom={11}
        className="h-screen w-full" // Use Tailwind for full viewport height/width
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
    </>
  );
}

