import React from 'react';
import { themes } from '../constants/constants';

export const Input = ({ label, value, onChange, type = "text", placeholder, t, required, style = {} }) => {
    const th = themes[t] || themes.dark;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {label && <label style={{ fontSize: 13, fontWeight: 500, color: th.textMuted }}>{label}{required && <span style={{ color: th.danger }}> *</span>}</label>}
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    background: th.surfaceAlt,
                    border: `1px solid ${th.border}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: th.text,
                    fontSize: 14,
                    transition: "border 0.2s",
                    ...style,
                }}
                onFocus={e => e.target.style.borderColor = th.primary}
                onBlur={e => e.target.style.borderColor = th.border}
            />
        </div>
    );
};
