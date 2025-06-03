import React, { useState, useEffect, useRef } from "react";
import { Village } from "./Map";

export function EditVillageModal({
  village,
  onClose,
  onSave,
}: {
  village: Village;
  onClose: () => void;
  onSave: (updatedVillage: Village) => void;
}) {
  const [villageName, setVillageName] = useState(village.name);
  const [status, setStatus] = useState(village.status);
  const [notes, setNotes] = useState(village.notes || "");
  const [lastInteraction, setLastInteraction] = useState(village.lastInteraction || "");
  const [nextVisitTarget, setNextVisitTarget] = useState(village.nextVisitTarget || "");
  const [touched, setTouched] = useState({ villageName: false, status: false });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Close modal when clicking outside content
  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const isValidVillageName = villageName.trim().length > 0;
  const isValidStatus = !!status;

  const canSave = isValidVillageName && isValidStatus;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ villageName: true, status: true });

    if (!canSave) return;

    const updatedVillage: Village = {
      ...village,
      name: villageName.trim(),
      status,
      notes,
      lastInteraction,
      nextVisitTarget,
    };
    onSave(updatedVillage);
    onClose();
  };

  return (
    <div
      ref={modalRef}
      onClick={onOverlayClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "400px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
          border: "2px solid red", // Remove this border when done debugging
        }}
      >
        <h2 className="text-xl font-semibold mb-4">Edit Village</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Village Name */}
          <div>
            <label htmlFor="village-name" className="block font-medium mb-1">
              Village Name<span className="text-red-600">*</span>
            </label>
            <input
              id="village-name"
              type="text"
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, villageName: true }))}
              className={`border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touched.villageName && !isValidVillageName ? "border-red-600" : "border-gray-300"
              }`}
              autoComplete="address-level2"
              required
            />
            {touched.villageName && !isValidVillageName && (
              <p className="text-red-600 text-sm mt-1">Village name is required.</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block font-medium mb-1">
              Status<span className="text-red-600">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, status: true }))}
              className={`border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touched.status && !isValidStatus ? "border-red-600" : "border-gray-300"
              }`}
              required
            >
              <option value="">Select status</option>
              <option value="visited">Visited</option>
              <option value="planned">Planned</option>
              <option value="not-visited">Not Visited</option>
            </select>
            {touched.status && !isValidStatus && (
              <p className="text-red-600 text-sm mt-1">Status is required.</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block font-medium mb-1">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              rows={3}
            />
          </div>

          {/* Last Interaction */}
          <div>
            <label htmlFor="lastInteraction" className="block font-medium mb-1">
              Last Interaction
            </label>
            <input
              type="date"
              id="lastInteraction"
              value={lastInteraction}
              onChange={(e) => setLastInteraction(e.target.value)}
              className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
          </div>

          {/* Next Visit Target */}
          <div>
            <label htmlFor="nextVisitTarget" className="block font-medium mb-1">
              Next Visit Target
            </label>
            <input
              type="date"
              id="nextVisitTarget"
              value={nextVisitTarget}
              onChange={(e) => setNextVisitTarget(e.target.value)}
              className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className={`px-4 py-2 rounded text-white ${
                canSave ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
