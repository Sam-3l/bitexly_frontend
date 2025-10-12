import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  onClick,
}) {
  const baseStyles =
    "w-full py-3 rounded-xl font-semibold transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]";

  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 text-white shadow-md hover:shadow-lg hover:brightness-110 focus:ring-indigo-500",
    secondary:
      "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 focus:ring-gray-300",
    outline:
      "border border-indigo-500 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variants[variant],
        disabled || loading
          ? "opacity-60 cursor-not-allowed"
          : "hover:scale-[1.02]",
        className
      )}
    >
      {loading ? (
        <span className="flex items-center justify-center space-x-2">
          <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary", "outline"]),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};