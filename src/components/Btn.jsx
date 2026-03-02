import React from 'react';
import { themes } from '../constants/constants';

export const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, style = {}, t }) => {
    const th = themes[t] || themes.dark;
    const base = { display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 8, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif" };
    const sizes = { sm: { padding: "6px 12px", fontSize: 13 }, md: { padding: "9px 16px", fontSize: 14 }, lg: { padding: "12px 22px", fontSize: 15 } };
    const variants = {
        primary: { background: th.primary, color: "#fff" },
        secondary: { background: th.surfaceAlt, color: th.text, border: `1px solid ${th.border}` },
        danger: { background: th.danger, color: "#fff" },
        ghost: { background: "transparent", color: th.primary, border: `1px solid ${th.border}` },
    };
    return (
        <button className="am-btn" onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
            {children}
        </button>
    );
};
