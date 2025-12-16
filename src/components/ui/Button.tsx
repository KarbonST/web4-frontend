import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...rest }) => (
    <button {...rest} className={`button ${rest.className ?? ''}`}>{children}</button>
);