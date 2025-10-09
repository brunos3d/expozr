/**
 * Example React Button component
 */

import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}) => {
  const style: React.CSSProperties = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: variant === "primary" ? "#007bff" : "#6c757d",
    color: "white",
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <button style={style} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

// Export both named and default for UMD compatibility
export default Button;
