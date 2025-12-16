import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
};

export const Input: React.FC<Props> = ({ label, hint, className = '', required, ...props }) => (
    <label className="input-label">
        {(label || hint) && (
            <span className="input-label__text">
                {label}
                {required && <span className="input-label__required">*</span>}
                {hint && <span className="input-label__hint">{hint}</span>}
            </span>
        )}
        <input
            {...props}
            required={required}
            className={`input ${className}`.trim()}
        />
    </label>
);
