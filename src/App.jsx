import React, { useState } from "react";
import { themes, icons } from "./constants/constants";
import { useStore } from "./hooks/useStore";
import { Sidebar } from "./components/Sidebar";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AutomationsPage } from "./pages/AutomationsPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { ContactsPage } from "./pages/ContactsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CalendarPage } from "./pages/CalendarPage";

export default function App() {
    const store = useStore();
    const { user, loading, logout, theme, switchTheme, page, setPage } = store;
    const [authMode, setAuthMode] = useState("signin");
    const [mobileOpen, setMobileOpen] = useState(false);
    const th = themes[theme] || themes.dark;

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1" }} className="am-spin" />
            </div>
        );
    }

    const storeWithTheme = { ...store, t: theme };

    if (!user) {
        return (
            <div className="am-root" style={{ background: th.bg }}>
                <AuthPage
                    mode={authMode}
                    onSwitch={() => setAuthMode(m => m === "signin" ? "signup" : "signin")}
                    onGoogleSignIn={store.signInWithGoogle}
                    t={theme}
                />
            </div>
        );
    }

    const pageComponents = {
        dashboard: <DashboardPage store={storeWithTheme} />,
        automations: <AutomationsPage store={storeWithTheme} />,
        calendar: <CalendarPage store={storeWithTheme} />,
        templates: <TemplatesPage store={storeWithTheme} />,
        contacts: <ContactsPage store={storeWithTheme} />,
        analytics: <AnalyticsPage store={storeWithTheme} />,
        settings: <SettingsPage store={storeWithTheme} />,
    };

    return (
        <div className="am-root" style={{ background: th.bg, minHeight: "100vh", display: "flex" }}>
            <div className="am-sidebar-desktop">
                <Sidebar page={page} setPage={setPage} user={user} logout={logout} theme={theme} switchTheme={switchTheme} t={theme} />
            </div>

            {mobileOpen && (
                <Sidebar page={page} setPage={setPage} user={user} logout={logout} theme={theme} switchTheme={switchTheme} t={theme} mobile onClose={() => setMobileOpen(false)} />
            )}

            <main className="am-main-content am-scrollbar" style={{ flex: 1, marginLeft: 240, minHeight: "100vh", overflowY: "auto" }}>
                <div style={{ position: "sticky", top: 0, zIndex: 50, background: th.bg + "ee", backdropFilter: "blur(12px)", borderBottom: `1px solid ${th.border}`, padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button className="am-mobile-menu" onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", color: th.text, cursor: "pointer", display: "flex", padding: 4 }}>
                        <span style={{ width: 22, height: 22, display: "flex" }}>{icons.menu}</span>
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="am-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: th.success }} />
                        <span style={{ fontSize: 13, color: th.textMuted }}>AI Active</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${th.border}`, background: th.surface, color: th.textMuted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <span style={{ width: 17, height: 17, display: "flex" }}>{icons.bell}</span>
                        </button>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${th.primary}, ${th.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                            {(user?.name || user?.email || "U")[0].toUpperCase()}
                        </div>
                    </div>
                </div>

                <div style={{ padding: "28px 28px 40px" }}>
                    {pageComponents[page] || pageComponents.dashboard}
                </div>
            </main>
        </div>
    );
}
