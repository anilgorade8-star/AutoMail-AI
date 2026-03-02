import React from "react";
import { themes, icons } from "../constants/constants";

export const Sidebar = ({ page, setPage, user, logout, theme, switchTheme, t, mobile, onClose }) => {
    const th = themes[t] || themes.dark;
    const nav = [
        { id: "dashboard", label: "Dashboard", icon: icons.home },
        { id: "automations", label: "Automations", icon: icons.zap },
        { id: "calendar", label: "Calendar", icon: icons.mail },
        { id: "templates", label: "Templates", icon: icons.template },
        { id: "contacts", label: "Contacts", icon: icons.users },
        { id: "analytics", label: "Analytics", icon: icons.chart },
        { id: "settings", label: "Settings", icon: icons.settings },
    ];
    const themeOptions = [{ id: "dark", icon: icons.moon }, { id: "light", icon: icons.sun }, { id: "glass", icon: icons.sparkle }];

    const sidebarStyle = mobile ? {
        position: "fixed", inset: 0, zIndex: 200, display: "flex",
    } : {
        width: 240, flexShrink: 0, position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
    };

    return (
        <>
            {mobile && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 199 }} />}
            <aside style={{ ...sidebarStyle, ...(mobile ? { width: 240 } : {}) }}>
                <div className="am-glass am-scrollbar" style={{
                    width: 240, height: "100%", background: th.sidebar, borderRight: `1px solid ${th.border}`,
                    display: "flex", flexDirection: "column", padding: "24px 16px", gap: 4, overflowY: "auto",
                    position: mobile ? "relative" : "fixed", left: 0, top: 0, bottom: 0, zIndex: mobile ? 200 : undefined,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px", marginBottom: 24 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${th.primary}, ${th.accent})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ width: 18, height: 18, color: "#fff", display: "flex" }}>{icons.bot}</span>
                        </div>
                        <span className="am-title" style={{ fontWeight: 700, fontSize: 16, color: th.text }}>AutoMail AI</span>
                    </div>

                    {nav.map(item => (
                        <button key={item.id} className="am-sidebar-link" onClick={() => { setPage(item.id); mobile && onClose(); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: page === item.id ? th.primary + "20" : "transparent",
                                border: page === item.id ? `1px solid ${th.primary}30` : "1px solid transparent",
                                color: page === item.id ? th.primary : th.textMuted, fontWeight: page === item.id ? 600 : 400,
                                fontSize: 14, width: "100%", cursor: "pointer",
                            }}>
                            <span style={{ width: 18, height: 18, display: "flex", flexShrink: 0 }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}

                    <div style={{ flex: 1 }} />

                    <div style={{ background: th.surfaceAlt, borderRadius: 10, padding: "6px", display: "flex", gap: 4, marginBottom: 12 }}>
                        {themeOptions.map(opt => (
                            <button key={opt.id} onClick={() => switchTheme(opt.id)}
                                style={{
                                    flex: 1, padding: "6px", border: "none", borderRadius: 7, background: theme === opt.id ? th.primary : "transparent",
                                    color: theme === opt.id ? "#fff" : th.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                                }}>
                                <span style={{ width: 16, height: 16, display: "flex" }}>{opt.icon}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: th.surfaceAlt, borderRadius: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${th.primary}, ${th.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                            {(user?.name || user?.email || "U")[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: th.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "User"}</div>
                            <div style={{ fontSize: 11, color: th.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                        </div>
                        <button onClick={logout} style={{ background: "none", border: "none", color: th.textMuted, cursor: "pointer", padding: 4, display: "flex", borderRadius: 6 }} title="Sign out">
                            <span style={{ width: 16, height: 16, display: "flex" }}>{icons.logout}</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
