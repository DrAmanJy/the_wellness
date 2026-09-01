'use client';

import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  desc?: string;
}

interface DropdownFieldProps {
  label?: string;
  options: DropdownOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function DropdownField({
  label,
  options,
  selectedValue,
  onChange,
  placeholder = 'Select an option',
  required = false,
  className = '',
}: DropdownFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div ref={dropdownRef} className={`relative flex flex-col ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-wellness-navy uppercase tracking-wider mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-wellness-gray-200 focus:border-wellness-green focus:ring-2 focus:ring-wellness-green/20 outline-none bg-wellness-gray-100/50 hover:bg-wellness-gray-100/80 transition-all text-left text-xs font-semibold text-wellness-navy cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {selectedOption?.icon && (
            <span className="text-wellness-green shrink-0">{selectedOption.icon}</span>
          )}
          <span
            className={
              selectedOption
                ? 'text-wellness-navy font-semibold'
                : 'text-wellness-charcoal/40 font-semibold'
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-wellness-charcoal/50 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Hidden input to assist with native HTML form validation if required */}
      <input type="hidden" value={selectedValue} required={required} onChange={() => {}} />

      {/* Options Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-30 left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-md rounded-xl border border-wellness-gray-200 shadow-xl py-1.5 origin-top"
            style={{ top: '100%' }}
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-wellness-charcoal/40 font-semibold italic text-center">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full group flex items-start justify-between gap-4 px-4 py-2.5 hover:bg-wellness-green/5 cursor-pointer text-left transition-colors duration-200 ${
                      isSelected ? 'bg-wellness-green/[0.03]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {option.icon && (
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                            isSelected
                              ? 'bg-wellness-green text-white'
                              : 'bg-wellness-navy/5 text-wellness-navy group-hover:bg-wellness-green group-hover:text-white'
                          }`}
                        >
                          {option.icon}
                        </div>
                      )}
                      <div className="flex-1">
                        <span
                          className={`text-xs font-bold transition-colors ${
                            isSelected
                              ? 'text-wellness-green'
                              : 'text-wellness-navy group-hover:text-wellness-green'
                          }`}
                        >
                          {option.label}
                        </span>
                        {option.desc && (
                          <p className="text-[10px] text-wellness-charcoal/50 group-hover:text-wellness-charcoal/75 transition-colors mt-0.5 leading-relaxed">
                            {option.desc}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-wellness-green mt-0.5 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
