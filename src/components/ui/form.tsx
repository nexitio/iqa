import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ fields */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  action,
  className,
  children,
}: {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor={htmlFor}
            className="text-[0.8125rem] font-semibold text-foreground"
          >
            {label}
            {required ? <span className="text-danger"> *</span> : null}
          </label>
          {action}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="text-[0.75rem] font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[0.75rem] leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

const controlBase =
  "w-full rounded-xl border border-border bg-surface px-3.5 text-[0.875rem] text-foreground placeholder:text-subtle-foreground transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:opacity-70";

const controlSizes = {
  sm: "h-9",
  md: "h-11",
  lg: "h-12",
};

export function Input({
  className,
  size = "md",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Visual height. Named distinctly from the native `size` attribute. */
  size?: keyof typeof controlSizes;
}) {
  return <input className={cn(controlBase, controlSizes[size], className)} {...props} />;
}

/** Search field with a leading icon, used across the library sections. */
export function SearchInput({
  icon: Icon,
  className,
  wrapperClassName,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ComponentType<{ className?: string }>;
  wrapperClassName?: string;
}) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      {Icon ? (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
      ) : null}
      <input className={cn(controlBase, "h-11", Icon && "pl-10", className)} {...props} />
    </div>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlBase, "min-h-28 resize-y py-3 leading-relaxed", className)} {...props} />;
}

/*
 * `Select` lives in its own file: unlike the text controls, it is a popover —
 * it owns open state, a portal and a search field — and the native control it
 * replaces could not be themed at all. See ./select.tsx.
 */

export function Checkbox({
  label,
  description,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-primary/35 has-checked:border-primary/45 has-checked:bg-primary-soft/45",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--primary)]"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-[0.875rem] font-medium leading-snug text-foreground">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

/** Radio card used for choosing a content type or a question's visibility. */
export function RadioCard({
  name,
  value,
  label,
  description,
  icon: Icon,
  defaultChecked,
  checked,
  onChange,
  className,
}: {
  name: string;
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  defaultChecked?: boolean;
  /** Supply `checked` + `onChange` to control the group and read its value. */
  checked?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 rounded-panel border border-border bg-surface p-4 transition-all hover:border-primary/35 has-checked:border-primary has-checked:bg-primary-soft/50 has-checked:shadow-card",
        checked && "border-primary bg-primary-soft/50 shadow-card",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        checked={checked}
        onChange={onChange ? () => onChange(value) : undefined}
        className="sr-only"
      />
      {Icon ? (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-3 text-muted-foreground transition-colors group-has-checked:bg-primary group-has-checked:text-primary-foreground">
          <Icon className="size-5" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[0.875rem] font-semibold text-foreground">{label}</span>
        {description ? (
          <span className="mt-1 block text-[0.75rem] leading-relaxed text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function Switch({
  label,
  description,
  checked,
  onChange,
  id,
  className,
}: {
  label: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  id?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-3.5",
        className,
      )}
    >
      <div className="min-w-0">
        <label htmlFor={id} className="block text-[0.875rem] font-medium text-foreground">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-[0.75rem] leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-border-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-[1.375rem]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
