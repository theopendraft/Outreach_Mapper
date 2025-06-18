// src/components/ui/Drawer.tsx
import React from "react";

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex justify-end">
      <div>
        {children}
      </div>
    </div>
  );
}
