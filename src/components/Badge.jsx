import React from 'react';

export const Badge = ({ label, color = "#3b82f6" }) => (
    <span className="am-tag" style={{ background: color + "20", color }}>
        {label}
    </span>
);
