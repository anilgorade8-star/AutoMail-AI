import React, { useState } from "react";
import { themes, icons, SEED_AUTOMATIONS, SEED_TEMPLATES, SEED_CONTACTS } from "../constants/constants";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";

export const SettingsPage = ({ store }) => {
    const { user, t, switchTheme, theme, saveAutomations, saveContacts, saveTemplates, addActivity, settings, updateSettings } = store;
    const th = themes[t] || themes.dark;
    const [profile, setProfile] = useState({ name: user?.name || "", company: user?.company || "", email: user?.email || "" });
    const [saved, setSaved] = useState(false);

    const saveProfile = async () => {
        if (!user) return;
        try {
            await setDoc(doc(db, "users", user.uid), {
                name: profile.name,
                company: profile.company
            }, { merge: true });
            await updateProfile(auth.currentUser, { displayName: profile.name });
            addActivity("analysis", "Profile settings updated");
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleSetting = (key) => {
        updateSettings({ ...settings, [key]: !settings[key] });
    };

    const resetData = async () => {
        if (!confirm("Reset all data to defaults? This can't be undone.")) return;
        await saveAutomations(SEED_AUTOMATIONS);
        await saveContacts(SEED_CONTACTS);
        await saveTemplates(SEED_TEMPLATES);
        addActivity("analysis", "Data reset to defaults");
    };

    const Section = ({ title, children }) => (
        <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 16 }}>
            <h3 className="am-title" style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 600, color: th.text }}>{title}</h3>
            {children}
        </div>
    );

    const Toggle = ({ label, desc, k }) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${th.border}` }}>
            <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: th.text }}>{label}</div>
                {desc && <div style={{ fontSize: 12, color: th.textMuted, marginTop: 3 }}>{desc}</div>}
            </div>
            <button onClick={() => toggleSetting(k)} style={{
                width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative",
                background: settings[k] ? th.primary : th.border, transition: "background 0.2s",
            }}>
                <span style={{
                    position: "absolute", top: 3, left: settings[k] ? 23 : 3, width: 18, height: 18, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s", display: "block",
                }} />
            </button>
        </div>
    );

    return (
        <div className="am-fade">
            <div style={{ marginBottom: 28 }}>
                <h1 className="am-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: th.text }}>Settings</h1>
                <p style={{ margin: "4px 0 0", color: th.textMuted, fontSize: 14 }}>Manage your account and preferences</p>
            </div>

            <Section title="Profile">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <Input label="Full Name" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} t={t} />
                        <Input label="Company" value={profile.company} onChange={v => setProfile(p => ({ ...p, company: v }))} t={t} />
                    </div>
                    <Input label="Email Address" value={profile.email} onChange={() => { }} t={t} style={{ opacity: 0.6 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Btn onClick={saveProfile} t={t}>{saved ? <span style={{ width: 16, height: 16, display: "flex" }}>{icons.check}</span> : null}{saved ? "Saved!" : "Save Profile"}</Btn>
                    </div>
                </div>
            </Section>

            <Section title="Appearance">
                <div style={{ display: "flex", gap: 10 }}>
                    {[["dark", "Dark", icons.moon], ["light", "Light", icons.sun], ["glass", "Glass", icons.sparkle]].map(([id, label, icon]) => (
                        <button key={id} onClick={() => switchTheme(id)}
                            style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: `2px solid ${theme === id ? th.primary : th.border}`, background: theme === id ? th.primary + "15" : th.surfaceAlt, color: theme === id ? th.primary : th.textMuted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, transition: "all 0.2s" }}>
                            <span style={{ width: 20, height: 20, display: "flex" }}>{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>
            </Section>

            <Section title="Preferences">
                <Toggle label="Email Notifications" desc="Get notified about automation activity" k="notifications" />
                <Toggle label="AI Auto-Resolve Conflicts" desc="Let AI automatically resolve scheduling conflicts" k="aiAutoResolve" />
                <Toggle label="Weekly Report" desc="Receive weekly performance summary" k="weeklyReport" />
                <Toggle label="Gmail Sync" desc="Enable real-time Gmail synchronization" k="gmailSync" />
            </Section>

            <Section title="Mobile Notifications">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <Input label="Mobile Number" value={settings.mobile || ""} onChange={v => updateSettings({ ...settings, mobile: v })} placeholder="+1 (555) 000-0000" t={t} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: th.text }}>Notify on Auto-Schedule</div>
                            <div style={{ fontSize: 12, color: th.textMuted, marginTop: 3 }}>Send an SMS when AI adds a meeting to your calendar</div>
                        </div>
                        <button onClick={() => updateSettings({ ...settings, notifyOnSchedule: !settings.notifyOnSchedule })} style={{
                            width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative",
                            background: settings.notifyOnSchedule ? th.primary : th.border, transition: "background 0.2s",
                        }}>
                            <span style={{
                                position: "absolute", top: 3, left: settings.notifyOnSchedule ? 23 : 3, width: 18, height: 18, borderRadius: "50%",
                                background: "#fff", transition: "left 0.2s", display: "block",
                            }} />
                        </button>
                    </div>
                </div>
            </Section>

            <Section title="Data Management">
                <p style={{ margin: "0 0 14px", fontSize: 14, color: th.textMuted }}>Reset all sample data back to defaults. Your account will remain active.</p>
                <Btn onClick={resetData} variant="danger" t={t}>Reset to Default Data</Btn>
            </Section>
        </div>
    );
};
