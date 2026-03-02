import React from 'react';
import { themes, icons } from '../constants/constants';

export const Modal = ({ open, onClose, title, children, t }) => {
    const th = themes[t] || themes.dark;
    if (!open) return null;
    return (
        <div className="am-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="am-modal am-glass" style={{ background: th.surface, border: `1px solid ${th.border}` }}>
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${th.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 className="am-title" style={{ margin: 0, fontSize: 18, fontWeight: 600, color: th.text }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: th.textMuted, cursor: "pointer", padding: 4, borderRadius: 6, display: "flex" }}>
                        <span style={{ width: 20, height: 20, display: "flex" }}>{icons.x}</span>
                    </button>
                </div>
                <div style={{ padding: "24px" }}>{children}</div>
            </div>
        </div>
    );
};
