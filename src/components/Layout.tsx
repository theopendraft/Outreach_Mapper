import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { RiMapPin5Line } from "react-icons/ri";
import { cn } from "../lib/utils";

const navLinks = [
  { name: "Map View", path: "/map", Icon: RiMapPin5Line },
  { name: "Dashboard", path: "/dashboard", Icon: AiOutlineDashboard },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<false | "login" | "signup">(false);
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative z-[99999]">
      {/* Top NavBar */}
      <nav className="w-full bg-white shadow flex items-center px-4 py-2 z-[99999] fixed top-0 left-0 right-0">
        <span className="font-bold text-lg text-blue-700">MAPPER</span>
        <div className="flex-1" />
        {/* Desktop Nav Links */}
        <div className="hidden sm:flex items-center gap-2">
          {navLinks.map(({ name, path, Icon }) => (
            <Link
              key={name}
              to={path}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50 transition",
                location.pathname === path
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700"
              )}
            >
              <Icon className="w-5 h-5" />
              {name}
            </Link>
          ))}
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={() => setOpen("login")}
          >
            Login
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-blue-700 hover:bg-gray-300 transition"
            onClick={() => setOpen("signup")}
          >
            Signup
          </button>
        </div>
        {/* Mobile Auth Buttons */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={() => setOpen("login")}
          >
            Login
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-blue-700 hover:bg-gray-300 transition"
            onClick={() => setOpen("signup")}
          >
            Signup
          </button>
        </div>
      </nav>
      {/* Main Content (add pt-14 for navbar height spacing) */}
      <main className="flex-1 w-full pt-14 pb-12">{children}</main>
      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-[99999] bg-white border-t shadow flex sm:hidden justify-around py-2">
        {navLinks.map(({ name, path, Icon }) => (
          <Link
            key={name}
            to={path}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition text-xs",
              location.pathname === path
                ? "text-blue-700 font-semibold"
                : "text-gray-700"
            )}
          >
            <Icon className="w-6 h-6" />
            {name}
          </Link>
        ))}
      </nav>
      {/* Login Modal */}
      {open === "login" && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <input className="w-full mb-3 px-3 py-2 border rounded" placeholder="Email" />
            <input className="w-full mb-3 px-3 py-2 border rounded" placeholder="Password" type="password" />
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setOpen(false)}>Login</button>
              <button className="flex-1 px-3 py-2 bg-gray-200 rounded" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Signup Modal */}
      {open === "signup" && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Signup</h2>
            <input className="w-full mb-3 px-3 py-2 border rounded" placeholder="Email" />
            <input className="w-full mb-3 px-3 py-2 border rounded" placeholder="Password" type="password" />
            <input className="w-full mb-3 px-3 py-2 border rounded" placeholder="Confirm Password" type="password" />
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setOpen(false)}>Signup</button>
              <button className="flex-1 px-3 py-2 bg-gray-200 rounded" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
