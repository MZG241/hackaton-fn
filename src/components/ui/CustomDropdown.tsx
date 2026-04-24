"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomIcon from "./CustomIcon";

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
  className?: string;
}

const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  icon,
  className = "",
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 flex items-center bg-surface-container-low border border-outline-variant/5 rounded-2xl transition-all duration-300 hover:bg-white hover:border-primary/20 ${
          isOpen ? "ring-2 ring-primary/10 border-primary/20 bg-white" : ""
        }`}
      >
        <div className="flex items-center w-full h-full pr-4 overflow-hidden">
          {icon && (
            <div className="w-12 h-full flex items-center justify-center text-on-surface-variant/30 transition-colors shrink-0">
              <CustomIcon name={icon} size={18} />
            </div>
          )}
          <span className={`text-[11px] font-bold truncate lowercase flex-1 text-left ${icon ? "" : "pl-4"} ${selectedOption ? "text-on-surface" : "text-on-surface-variant/40"}`}>
            {selectedOption ? selectedOption.label.toLowerCase() : placeholder.toLowerCase()}
          </span>
          <div className={`transition-transform duration-300 shrink-0 text-on-surface-variant/20 ml-2 ${isOpen ? "rotate-180 text-primary" : ""}`}>
            <CustomIcon name="arrow-down-1" size={16} />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-100 w-full mt-2 bg-white rounded-2xl border border-outline-variant/10 shadow-2xl shadow-primary/5 overflow-hidden origin-top"
          >
            <div className="max-h-[240px] overflow-y-auto p-2 custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 lowercase flex items-center justify-between group ${
                    value === option.value
                      ? "bg-primary/5 text-primary"
                      : "text-on-surface-variant/60 hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  {option.label.toLowerCase()}
                  {value === option.value && (
                    <CustomIcon name="verify" size={14} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
