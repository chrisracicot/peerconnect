// filepath: c:/peerconnect/peerconnect/components/ui/badge.tsx
import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "secondary" | "primary";
}

const Badge: React.FC<BadgeProps> = ({ variant = "primary", className, ...props }) => (
  <span
    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${variant === "secondary" ? "bg-gray-200 text-gray-800" : "bg-blue-500 text-white"} ${className ?? ""}`}
    {...props}
  />
);

export default Badge;