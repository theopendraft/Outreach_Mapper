import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "outline" | "default";
};

export const Button = ({ className = "", variant = "default", ...props }: ButtonProps) => {
  const variantClass =
    variant === "outline"
      ? "border border-gray-400 text-gray-700 bg-white hover:bg-gray-100"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button
      className={`px-4 py-2 rounded-md transition ${variantClass} ${className}`}
      {...props}
    />
  );
};
