"use client";

import React, { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Field label */
  label?: string;
  /** Error message string */
  error?: string;
  /** Helper hint message below input */
  helperText?: string;
  /** Left icon element */
  leftIcon?: ReactNode;
  /** Right icon element */
  rightIcon?: ReactNode;
  /** Fixed text prefix, e.g. "NSUK/SR-FT/" or "NSUK/SR/" */
  prefixText?: string;
  /** Container CSS classes */
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      prefixText,
      id,
      name,
      className = "",
      containerClassName = "",
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 select-none"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div
          className={`relative flex items-center rounded-xl border bg-slate-50/50 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-700 ${
            error
              ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-200"
              : "border-slate-200 focus-within:border-emerald-700"
          } ${disabled ? "opacity-60 bg-slate-100 cursor-not-allowed" : ""}`}
        >
          {leftIcon && (
            <div className="pointer-events-none flex items-center pl-3.5 text-slate-400 shrink-0">
              {leftIcon}
            </div>
          )}

          {prefixText && (
            <span className="pl-3 pr-1 text-xs sm:text-sm font-bold text-emerald-900 select-none shrink-0 font-mono bg-emerald-50/80 py-1.5 px-2 rounded-lg border border-emerald-800/15 ml-2">
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            disabled={disabled}
            required={required}
            className={`w-full bg-transparent py-2.5 sm:py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed ${
              leftIcon ? "pl-2" : prefixText ? "pl-2" : "pl-3.5"
            } ${rightIcon ? "pr-2" : "pr-3.5"} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="flex items-center pr-3.5 text-slate-400 shrink-0">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 animate-in fade-in duration-150">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!error && helperText && (
          <p className="text-[11px] text-slate-500 leading-normal">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
