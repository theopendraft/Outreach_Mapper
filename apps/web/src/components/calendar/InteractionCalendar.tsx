import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FiCalendar, FiX } from "react-icons/fi";
import { db } from "../../lib/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { format } from "date-fns";
import { Village } from "../../data/types/village";
import { toast } from "react-toastify";

interface InteractionCalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InteractionCalendar({ isOpen, onClose }: InteractionCalendarProps) {
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // 🔁 Live sync villages from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "villages"), (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Village[];
      setVillages(list);
    });
    return unsub;
  }, []);

  // ⛔ Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        onClose();
        setSelectedVillage(null);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // 📍 On date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const iso = format(date, "yyyy-MM-dd");
    const match = villages.find(
      (v) => v.lastVisit === iso || v.nextVisitTarget === iso
    );
    setSelectedVillage(match || null);
  };

  // ✏️ Update Firestore date
  const updateInteraction = async (
    field: "lastVisit" | "nextVisitTarget",
    value: string
  ) => {
    if (!selectedVillage) return;
    await updateDoc(doc(db, "villages", selectedVillage.id), {
      [field]: value,
    });
    toast.success(`${field} updated`);
    setSelectedVillage(null);
  };

  const markedDates = villages.flatMap((v) =>
    [v.lastVisit, v.nextVisitTarget].filter(Boolean)
  );

  return (
    <>
      {/* 📅 Floating Calendar Button */}
      {/* Removed button here because open/close is controlled externally */}

      {/* 🧩 Calendar Popup */}
      <div
        ref={calendarRef}
        className={`fixed z-50 bottom-20 right-3 bg-white border border-gray-300 rounded-xl shadow-xl transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75 pointer-events-none"
        }`}
        style={{
          minWidth: isOpen ? "600px" : "3.5rem",
          maxWidth: isOpen ? "200px" : "3.5rem",
          minHeight: isOpen ? "360px" : "3.5rem",
          //userSelect: isResizing.current ? 'none' : 'auto',
          //display: "flex",
        }}
      >
        <div className="flex justify-between items-center px-4 pt-2">
          <h2 className="text-base font-semibold text-gray-700">
            Interaction Calendar
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={({ date }) =>
              markedDates.includes(format(date, "yyyy-MM-dd"))
                ? "bg-blue-100 text-blue-800 font-semibold rounded-full"
                : ""
            }
            className="w-full"
          />

          {/* Details */}
          {selectedVillage && (
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <h3 className="text-base font-semibold text-gray-800">
                {selectedVillage.name}
              </h3>
              <p className="text-sm text-gray-600">
                Last Visit: {selectedVillage.lastVisit || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Next Visit: {selectedVillage.nextVisitTarget || "N/A"}
              </p>

              {/* Date editor */}
              <input
                type="date"
                className="w-full mt-2 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  updateInteraction("nextVisitTarget", e.target.value)
                }
              />
              <button
                onClick={() => updateInteraction("nextVisitTarget", "")}
                className="text-xs text-red-500 mt-1 underline hover:text-red-700"
              >
                Clear Date
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
