import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import { AiOutlineDashboard } from "react-icons/ai";
import { RiMapPin5Line } from "react-icons/ri";
import { cn } from "../lib/utils";

const navLinks = [
  { name: "Map View", path: "/map", Icon: RiMapPin5Line },
  { name: "Dashboard", path: "/dashboard", Icon: AiOutlineDashboard },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top NavBar */}
      <nav className="w-full bg-white shadow flex items-center px-4 py-2 z-30">
        <div className="flex-1 flex items-center gap-4">
          <span className="font-bold text-lg text-blue-700">MAPPER</span>
          {navLinks.map(({ name, path, Icon }) => (
            <Link
              key={name}
              to={path}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50 transition",
                location.pathname === path ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700"
              )}
            >
              <Icon className="w-5 h-5" />
              {name}
            </Link>
          ))}
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
