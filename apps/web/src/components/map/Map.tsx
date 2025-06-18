// src/components/Map.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap } from "react-leaflet";
import L from "leaflet";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { EditVillageModal } from "../../components/modals/EditVillageModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiPlus } from "react-icons/fi";
import InteractionCalendar from "../../components/calendar/InteractionCalendar";
import { FiCalendar } from "react-icons/fi";

// Types
export type Parent = {
  name: string;
  contact: string;
};

type MyComponentProps = {
  isOpen: boolean;
  onClose: () => void;
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
  external: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
};

function createIcon(status: string) {
  return new L.Icon({
    iconUrl: iconUrls[status as keyof typeof iconUrls] || iconUrls["not-visited"],
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
}

interface Props {
  villages: Village[];
  search: string;
  filter: 'all' | 'visited' | 'planned' | 'not-visited';
}

function FlyToMarker({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 13);
  }, [coords]);
  return null;
}

export default function Map({ villages, search, filter }: Props) {
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [addingVillage, setAddingVillage] = useState(false);
  const [newVillageCoords, setNewVillageCoords] = useState<[number, number] | null>(null);
  const [villagesState, setVillagesState] = useState<Village[]>([]);
  const [externalSearchMarker, setExternalSearchMarker] = useState<[number, number] | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  

  // Firestore live sync
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "villages"), (snapshot) => {
      const villages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVillagesState(villages as Village[]);
    });
    return () => unsubscribe();
  }, []);

  // External search if village not found
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search.trim()) return setExternalSearchMarker(null);

      const foundInLocal = villagesState.some(v =>
        v.name.toLowerCase() === search.toLowerCase()
      );
      if (foundInLocal) {
        setExternalSearchMarker(null);
        return;
      }

      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            setExternalSearchMarker([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
            setExternalSearchMarker(null);
          }
        });
    }, 500);
    return () => clearTimeout(timeout);
  }, [search, villagesState]);

  const displayVillages = villagesState.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || v.status === filter;
    return matchSearch && matchFilter;
  });

  const handleEditClick = (village: Village) => {
    setEditingVillage(village);
    setSelectedVillage(null);
  };

  const handleSaveVillage = async (updatedVillage: Village) => {
    await setDoc(doc(db, "villages", updatedVillage.id.toString()), updatedVillage);
    setEditingVillage(null);
    setSelectedVillage(updatedVillage);
    toast.success("Village updated successfully");
  };

  const handleModalClose = () => {
    setEditingVillage(null);
  };

  const handleDeleteVillage = async (villageId: string | number) => {
    await deleteDoc(doc(db, "villages", villageId.toString()));
    setSelectedVillage(null);
    toast.success("Village deleted successfully");
  };

  function AddVillageOnMap({ onSelect }: { onSelect: (coords: [number, number]) => void }) {
    useMapEvent("click", (e) => {
      if (addingVillage) {
        onSelect([e.latlng.lat, e.latlng.lng]);
      }
    });
    return null;
  }

  return (
    <>
      <button
        className="fixed bottom-24 md:bottom-6 right-3 z-50 flex items-center bg-green-600 text-white rounded-full shadow-lg px-4 py-4 transition-all duration-300 group hover:pr-8 hover:rounded-full"
        onClick={() => {
          setAddingVillage(true);
          setNewVillageCoords(null);
        }}
        style={{ minWidth: 56, minHeight: 56 }}
      >
        <span className="flex items-center justify-center w-6 h-6 text-2xl">
          <FiPlus />
        </span>
        <span className="overflow-hidden max-w-0 group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 whitespace-nowrap">
          Add New Village
        </span>
      </button>

      <button
        onClick={() => setShowCalendar(true)}
        className="fixed bottom-40 md:bottom-[86px] right-3 z-50 bg-blue-600 text-white px-4 py-4 rounded-full shadow hover:bg-blue-700"
      >
        <FiCalendar className="flex items-center justify-center w-6 h-6 text-2xl" />
      </button>

      <InteractionCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />

      {/* <InteractionCalendar isOpen={showCalendar} onClose={() => setShowCalendar(false)} /> */}

      <MapContainer
        style={{ height: "100vh", width: "100%", zIndex: 0 }}
        center={[22.68411, 77.26887]}
        zoom={11}
        className="relative z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
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

        {displayVillages.map((village) => (
          <Marker
            key={village.id}
            position={village.coords}
            icon={createIcon(village.status)}
            eventHandlers={{
              click: () => {
                setSelectedVillage(village);
                setEditingVillage(null);
              },
            }}
          >
            {selectedVillage && selectedVillage.id === village.id && (
              <Popup
                position={village.coords}
                eventHandlers={{ remove: () => setSelectedVillage(null) }}
              >
                <div className="bg-white rounded-lg shadow-md p-6 w-72">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {village.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Status:{" "}
                    <span className="font-medium">{village.status}</span>
                  </p>
                  <p className="text-gray-600 mt-1">
                    Last Interaction:{" "}
                    <span className="font-medium">
                      {village.lastInteraction || "N/A"}
                    </span>
                  </p>
                  <h4 className="font-semibold mt-4 text-gray-800">Parents:</h4>
                  {village.parents.length ? (
                    <ul className="list-disc ml-5 text-gray-600">
                      {village.parents.map((p, i) => (
                        <li key={i} className="mt-1">
                          {p.name} - {p.contact}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No parent data available</p>
                  )}
                  <div className="mt-4 flex justify-between">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                      onClick={() => handleEditClick(village)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this village?"
                          )
                        ) {
                          handleDeleteVillage(village.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}

        {externalSearchMarker && (
          <>
            <Marker
              position={externalSearchMarker}
              icon={createIcon("external")}
            >
              <Popup>
                <strong>{search}</strong>
                <br />
                Searched globally.
              </Popup>
            </Marker>
            <FlyToMarker coords={externalSearchMarker} />
          </>
        )}
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
            status: "not-visited",
            parents: [],
            notes: "",
          }}
          onClose={() => {
            setAddingVillage(false);
            setNewVillageCoords(null);
          }}
          onSave={async (newVillage) => {
            await setDoc(
              doc(db, "villages", newVillage.id.toString()),
              newVillage
            );
            setAddingVillage(false);
            setNewVillageCoords(null);
          }}
        />
      )}
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}
