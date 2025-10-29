import { useState } from "react";

// Компонент TabPanel для контента вкладки
export function TabPanel({ children, value, index, ...props }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...props}
    >
      {value === index && children}
    </div>
  );
}

// Основной компонент Tabs
export default function Tabs({
  tabs = [],
  defaultValue,
  value: controlledValue,
  onChange,
  className = "",
  tabClassName = "",
  activeTabClassName = "",
  inactiveTabClassName = "",
  orientation = "horizontal",
  size = "medium",
  variant = "default",
  disabled = false,
  loading = false,
  loadingText = "Загрузка...",
  error = null,
  fullWidth = false,
  children,
  ...props
}) {
  const [internalValue, setInternalValue] = useState(
    defaultValue || (tabs.length > 0 ? tabs[0].value : null)
  );

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : internalValue;

  const handleTabChange = (newValue) => {
    if (disabled || loading) return;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    if (onChange) {
      onChange(newValue);
    }
  };

  // Размеры
  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-3 py-2 text-sm",
    large: "px-4 py-3 text-base",
  };

  // Варианты стилей
  const variantClasses = {
    default: {
      active: "bg-blue-600 text-white",
      inactive: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    },
    outlined: {
      active: "border-blue-600 text-blue-600 bg-blue-50",
      inactive: "border-gray-300 text-gray-700 hover:border-gray-400",
    },
    underlined: {
      active: "border-b-2 border-blue-600 text-blue-600 bg-transparent",
      inactive:
        "border-b-2 border-transparent text-gray-700 hover:text-gray-900",
    },
  };

  const baseTabClasses = `
    font-medium cursor-pointer transition-all duration-200 
    flex items-center justify-center
    ${sizeClasses[size]}
    ${variant === "underlined" ? "" : "rounded-md"}
    ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
    ${fullWidth ? "flex-1" : ""}
  `.trim();

  const orientationClasses =
    orientation === "vertical" ? "flex flex-col space-y-1" : "flex space-x-2";

  return (
    <div className={`flex items-start ${className}`} {...props}>
      <div
        className={orientationClasses}
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map((tab, index) => {
          const isActive = activeValue === tab.value;
          const isDisabled = disabled || tab.disabled || loading;

          return (
            <button
              key={tab.value}
              role="tab"
              id={`tab-${index}`}
              aria-controls={`tabpanel-${index}`}
              aria-selected={isActive}
              disabled={isDisabled}
              onClick={() => handleTabChange(tab.value)}
              className={`
                ${baseTabClasses}
                ${
                  isActive
                    ? `${variantClasses[variant].active} ${activeTabClassName}`
                    : `${variantClasses[variant].inactive} ${inactiveTabClassName}`
                }
                ${tabClassName}
              `}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
              {tab.badge && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div
          className={`${
            orientation === "vertical" ? "mt-2" : "ml-3"
          } text-sm text-gray-500`}
        >
          {loadingText}
        </div>
      )}

      {error && (
        <div
          className={`${
            orientation === "vertical" ? "mt-2" : "ml-3"
          } text-sm text-red-600`}
        >
          {error}
        </div>
      )}

      {children && (
        <div className={orientation === "vertical" ? "mt-4" : "ml-4"}>
          {children}
        </div>
      )}
    </div>
  );
}
