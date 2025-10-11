import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
}: ButtonProps) {
  const baseStyles = {
    padding:
      size === "small"
        ? "8px 16px"
        : size === "large"
          ? "16px 32px"
          : "12px 24px",
    fontSize: size === "small" ? "14px" : size === "large" ? "18px" : "16px",
    border: "none",
    borderRadius: "6px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
    opacity: disabled ? 0.6 : 1,
  };

  const variantStyles = {
    primary: {
      backgroundColor: "#007bff",
      color: "white",
    },
    secondary: {
      backgroundColor: "#6c757d",
      color: "white",
    },
    danger: {
      backgroundColor: "#dc3545",
      color: "white",
    },
  };

  const hoverStyles = !disabled
    ? {
        transform: "translateY(-1px)",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      }
    : {};

  return (
    <button
      style={{
        ...baseStyles,
        ...variantStyles[variant],
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {children}
    </button>
  );
}
