'use client'

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

/**
 * Form field wrapper.
 *
 * Renders a real `<label>` rather than a placeholder-as-label, and links the
 * error text with `aria-describedby` so a screen reader announces the problem
 * when focus lands on the field. Placeholder-only labelling disappears the moment
 * the user types, which is the most common form accessibility failure.
 */
export function Field({
  children,
  error,
  hint,
  id,
  label,
}: {
  children: React.ReactNode
  error?: string
  hint?: string
  id: string
  label: string
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>

      {children}

      {hint ? (
        <p className="text-muted-fore text-xs" id={hintId}>
          {hint}
        </p>
      ) : null}

      {/*
        role="alert" announces the message the moment it appears, rather than
        waiting for the field to receive focus.
      */}
      {error ? (
        <p className="text-danger text-xs font-medium" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Returns the aria attributes for a field given its id, hint and error.
 *
 * Extracted so Input, Textarea and Select cannot drift apart in how they report
 * errors.
 */
export function fieldA11y(id: string, hint?: string, error?: string): Record<string, string | undefined> {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean)

  return {
    'aria-describedby': ids.length > 0 ? ids.join(' ') : undefined,
    'aria-invalid': error ? 'true' : undefined,
  }
}

const CONTROL =
  'min-h-11 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text transition-colors placeholder:text-muted-fore/70 disabled:opacity-60'

export function Input({
  className,
  invalid,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(CONTROL, invalid ? 'border-danger' : 'border-border', className)}
      {...rest}
    />
  )
}

export function Textarea({
  className,
  invalid,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(CONTROL, 'min-h-28 py-2.5', invalid ? 'border-danger' : 'border-border', className)}
      {...rest}
    />
  )
}

export function Select({
  className,
  invalid,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cn(
        CONTROL,
        'cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10',
        invalid ? 'border-danger' : 'border-border',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...rest}
    />
  )
}
