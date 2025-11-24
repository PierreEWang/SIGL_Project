// sigl_frontend/src/components/ToggleSwitch.jsx
import React from "react";

const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  const baseClasses =
    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500";

  const enabledClasses = checked
    ? "bg-primary-600"
    : "bg-gray-200";

  const knobClasses =
    "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (!disabled && typeof onChange === "function") {
          onChange();
        }
      }}
      className={`${baseClasses} ${enabledClasses} ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span
        className={`${knobClasses} ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;