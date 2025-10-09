/**
 * Example React Card component
 */

import React from "react";

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  variant?: "default" | "elevated";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  variant = "default",
  className = "",
}) => {
  const style: React.CSSProperties = {
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "white",
    border: variant === "default" ? "1px solid #e0e0e0" : "none",
    boxShadow: variant === "elevated" ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none",
    margin: "8px 0",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "12px",
    color: "#333",
  };

  return (
    <div style={style} className={className}>
      {title && <div style={titleStyle}>{title}</div>}
      {children}
    </div>
  );
};

// Export both named and default for UMD compatibility
export default Card;
