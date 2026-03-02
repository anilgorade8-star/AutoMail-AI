import React from 'react';

// ─── Seed Data ─────────────────────────────────────────────────────────────────
export const SEED_AUTOMATIONS = [
    { id: "a1", name: "Follow-up Sequence", status: "active", trigger: "No reply in 3 days", action: "Send follow-up email", emails: 247, lastRun: "2026-02-28T10:30:00Z", created: "2026-01-15T08:00:00Z" },
    { id: "a2", name: "Meeting Scheduler", status: "active", trigger: "Calendar invite accepted", action: "Send confirmation + agenda", emails: 89, lastRun: "2026-02-28T14:15:00Z", created: "2026-01-20T09:00:00Z" },
    { id: "a3", name: "Onboarding Welcome", status: "paused", trigger: "New contact added", action: "Send welcome series", emails: 56, lastRun: "2026-02-25T11:00:00Z", created: "2026-02-01T10:00:00Z" },
    { id: "a4", name: "Lead Nurture", status: "active", trigger: "Link clicked", action: "Tag and queue drip", emails: 412, lastRun: "2026-02-28T16:45:00Z", created: "2026-01-10T07:00:00Z" },
];

export const SEED_TEMPLATES = [
    { id: "t1", name: "Cold Outreach", subject: "Quick question about {{company}}", body: "Hi {{first_name}},\n\nI noticed {{company}} is doing great work in {{industry}}. I'd love to connect and share how we've helped similar teams.\n\nWould you have 15 minutes this week?\n\nBest,\n{{sender_name}}", tags: ["sales", "outreach"], uses: 134, created: "2026-01-05T08:00:00Z" },
    { id: "t2", name: "Meeting Follow-up", subject: "Great talking with you, {{first_name}}", body: "Hi {{first_name}},\n\nIt was great connecting earlier! As discussed:\n\n- {{action_item_1}}\n- {{action_item_2}}\n\nLooking forward to our next steps.\n\nBest,\n{{sender_name}}", tags: ["meetings", "follow-up"], uses: 89, created: "2026-01-12T09:00:00Z" },
    { id: "t3", name: "Proposal Send", subject: "Proposal for {{company}} – {{project_name}}", body: "Hi {{first_name}},\n\nPlease find attached the proposal for {{project_name}}. Key highlights:\n\n- Investment: {{price}}\n- Timeline: {{timeline}}\n- Deliverables: {{deliverables}}\n\nHappy to walk you through it. What time works for you?\n\nBest,\n{{sender_name}}", tags: ["sales", "proposal"], uses: 67, created: "2026-01-18T10:00:00Z" },
];

export const SEED_CONTACTS = [
    { id: "c1", name: "Sarah Chen", email: "sarah@techcorp.io", company: "TechCorp", tags: ["lead", "enterprise"], lastContact: "2026-02-27T10:00:00Z", status: "active" },
    { id: "c2", name: "Marcus Williams", email: "marcus@startup.co", company: "StartupCo", tags: ["customer"], lastContact: "2026-02-28T14:00:00Z", status: "active" },
    { id: "c3", name: "Priya Sharma", email: "priya@innovate.com", company: "Innovate Inc", tags: ["prospect"], lastContact: "2026-02-20T09:00:00Z", status: "inactive" },
    { id: "c4", name: "Jordan Lee", email: "jordan@vennture.io", company: "Vennture", tags: ["lead", "smb"], lastContact: "2026-02-25T16:00:00Z", status: "active" },
    { id: "c5", name: "Aisha Okonkwo", email: "aisha@globalnet.org", company: "GlobalNet", tags: ["partner"], lastContact: "2026-02-26T11:00:00Z", status: "active" },
];

export const SEED_ACTIVITY = [
    { id: "l1", type: "sent", message: "Follow-up email sent to Sarah Chen", time: "2026-02-28T16:50:00Z" },
    { id: "l2", type: "scheduled", message: "Meeting scheduled with Marcus Williams for Mar 3", time: "2026-02-28T15:30:00Z" },
    { id: "l3", type: "conflict", message: "Scheduling conflict detected – resolved automatically", time: "2026-02-28T14:10:00Z" },
    { id: "l4", type: "sent", message: "Proposal email sent to Jordan Lee", time: "2026-02-28T13:00:00Z" },
    { id: "l5", type: "analysis", message: "Thread analysis completed for 12 conversations", time: "2026-02-28T11:20:00Z" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
export const icons = {
    mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
    bot: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2m18 0h-2M9 18v2m6-2v2m-3-9h.01M15 13h.01" /></svg>,
    zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
    template: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /></svg>,
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sparkle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>,
    logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    play: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
    pause: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
    menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
    send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
    bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    sparkle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>,
};

// ─── Theme Configs ─────────────────────────────────────────────────────────────
export const themes = {
    dark: {
        bg: "#0a0f1e",
        surface: "#111827",
        surfaceAlt: "#1a2235",
        border: "rgba(59,130,246,0.15)",
        text: "#e2e8f0",
        textMuted: "#64748b",
        primary: "#3b82f6",
        accent: "#06b6d4",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        sidebar: "#0d1424",
        card: "rgba(17,24,39,0.8)",
        glow: "rgba(59,130,246,0.3)",
    },
    light: {
        bg: "#f0f4ff",
        surface: "#ffffff",
        surfaceAlt: "#f8faff",
        border: "rgba(59,130,246,0.2)",
        text: "#1e293b",
        textMuted: "#64748b",
        primary: "#2563eb",
        accent: "#0891b2",
        success: "#059669",
        warning: "#d97706",
        danger: "#dc2626",
        sidebar: "#ffffff",
        card: "rgba(255,255,255,0.9)",
        glow: "rgba(59,130,246,0.15)",
    },
    glass: {
        bg: "#0f172a",
        surface: "rgba(255,255,255,0.05)",
        surfaceAlt: "rgba(255,255,255,0.08)",
        border: "rgba(255,255,255,0.12)",
        text: "#f1f5f9",
        textMuted: "#94a3b8",
        primary: "#60a5fa",
        accent: "#22d3ee",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
        sidebar: "rgba(255,255,255,0.03)",
        card: "rgba(255,255,255,0.04)",
        glow: "rgba(96,165,250,0.25)",
    },
};
