import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
}

export function Button({
  children,
  variant = "primary",
  size = "medium",
  ...props
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
    cursor: props.disabled ? "not-allowed" : "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
    opacity: props.disabled ? 0.6 : 1,
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

  return (
    <button
      style={{
        ...baseStyles,
        ...variantStyles[variant],
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
