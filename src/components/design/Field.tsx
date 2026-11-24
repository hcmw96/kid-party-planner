import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export const Field = ({ label, hint, id, className = "", ...props }: FieldProps) => {
  const fieldId = id ?? props.name;
  return (
    <label htmlFor={fieldId} className="block">
      <span className="field-label">{label}</span>
      <input id={fieldId} className={`field-input ${className}`} {...props} />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
};

interface AreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export const FieldArea = ({ label, hint, id, className = "", ...props }: AreaProps) => {
  const fieldId = id ?? props.name;
  return (
    <label htmlFor={fieldId} className="block">
      <span className="field-label">{label}</span>
      <textarea id={fieldId} className={`field-input field-area ${className}`} {...props} />
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
};

export const FieldError = ({ children }: { children: ReactNode }) => (
  <p className="text-center text-[13px] font-medium text-[#9B3A46]" role="alert">
    {children}
  </p>
);
