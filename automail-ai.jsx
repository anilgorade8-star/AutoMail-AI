import { useState, useEffect, useCallback, useRef } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const storage = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

const hash = (s) => btoa(s + "automail_salt_2026");
const uid = () => Math.random().toString(36).slice(2);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
const now = () => new Date().toISOString();

// ─── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_AUTOMATIONS = [
  { id: "a1", name: "Follow-up Sequence", status: "active", trigger: "No reply in 3 days", action: "Send follow-up email", emails: 247, lastRun: "2026-02-28T10:30:00Z", created: "2026-01-15T08:00:00Z" },
  { id: "a2", name: "Meeting Scheduler", status: "active", trigger: "Calendar invite accepted", action: "Send confirmation + agenda", emails: 89, lastRun: "2026-02-28T14:15:00Z", created: "2026-01-20T09:00:00Z" },
  { id: "a3", name: "Onboarding Welcome", status: "paused", trigger: "New contact added", action: "Send welcome series", emails: 56, lastRun: "2026-02-25T11:00:00Z", created: "2026-02-01T10:00:00Z" },
  { id: "a4", name: "Lead Nurture", status: "active", trigger: "Link clicked", action: "Tag and queue drip", emails: 412, lastRun: "2026-02-28T16:45:00Z", created: "2026-01-10T07:00:00Z" },
];
const SEED_TEMPLATES = [
  { id: "t1", name: "Cold Outreach", subject: "Quick question about {{company}}", body: "Hi {{first_name}},\n\nI noticed {{company}} is doing great work in {{industry}}. I'd love to connect and share how we've helped similar teams.\n\nWould you have 15 minutes this week?\n\nBest,\n{{sender_name}}", tags: ["sales", "outreach"], uses: 134, created: "2026-01-05T08:00:00Z" },
  { id: "t2", name: "Meeting Follow-up", subject: "Great talking with you, {{first_name}}", body: "Hi {{first_name}},\n\nIt was great connecting earlier! As discussed:\n\n- {{action_item_1}}\n- {{action_item_2}}\n\nLooking forward to our next steps.\n\nBest,\n{{sender_name}}", tags: ["meetings", "follow-up"], uses: 89, created: "2026-01-12T09:00:00Z" },
  { id: "t3", name: "Proposal Send", subject: "Proposal for {{company}} – {{project_name}}", body: "Hi {{first_name}},\n\nPlease find attached the proposal for {{project_name}}. Key highlights:\n\n- Investment: {{price}}\n- Timeline: {{timeline}}\n- Deliverables: {{deliverables}}\n\nHappy to walk you through it. What time works for you?\n\nBest,\n{{sender_name}}", tags: ["sales", "proposal"], uses: 67, created: "2026-01-18T10:00:00Z" },
];
const SEED_CONTACTS = [
  { id: "c1", name: "Sarah Chen", email: "sarah@techcorp.io", company: "TechCorp", tags: ["lead", "enterprise"], lastContact: "2026-02-27T10:00:00Z", status: "active" },
  { id: "c2", name: "Marcus Williams", email: "marcus@startup.co", company: "StartupCo", tags: ["customer"], lastContact: "2026-02-28T14:00:00Z", status: "active" },
  { id: "c3", name: "Priya Sharma", email: "priya@innovate.com", company: "Innovate Inc", tags: ["prospect"], lastContact: "2026-02-20T09:00:00Z", status: "inactive" },
  { id: "c4", name: "Jordan Lee", email: "jordan@vennture.io", company: "Vennture", tags: ["lead", "smb"], lastContact: "2026-02-25T16:00:00Z", status: "active" },
  { id: "c5", name: "Aisha Okonkwo", email: "aisha@globalnet.org", company: "GlobalNet", tags: ["partner"], lastContact: "2026-02-26T11:00:00Z", status: "active" },
];
const SEED_ACTIVITY = [
  { id: "l1", type: "sent", message: "Follow-up email sent to Sarah Chen", time: "2026-02-28T16:50:00Z" },
  { id: "l2", type: "scheduled", message: "Meeting scheduled with Marcus Williams for Mar 3", time: "2026-02-28T15:30:00Z" },
  { id: "l3", type: "conflict", message: "Scheduling conflict detected – resolved automatically", time: "2026-02-28T14:10:00Z" },
  { id: "l4", type: "sent", message: "Proposal email sent to Jordan Lee", time: "2026-02-28T13:00:00Z" },
  { id: "l5", type: "analysis", message: "Thread analysis completed for 12 conversations", time: "2026-02-28T11:20:00Z" },
];

// ─── App State Store ───────────────────────────────────────────────────────────
function useStore() {
  const [user, setUser] = useState(() => storage.get("automail_session"));
  const [theme, setTheme] = useState(() => storage.get("automail_theme") || "dark");
  const [page, setPage] = useState("dashboard");
  const [automations, setAutomations] = useState(() => storage.get("automail_automations") || SEED_AUTOMATIONS);
  const [templates, setTemplates] = useState(() => storage.get("automail_templates") || SEED_TEMPLATES);
  const [contacts, setContacts] = useState(() => storage.get("automail_contacts") || SEED_CONTACTS);
  const [activity, setActivity] = useState(() => storage.get("automail_activity") || SEED_ACTIVITY);

  const persist = (key, val) => storage.set(key, val);

  const login = (userData) => { setUser(userData); persist("automail_session", userData); };
  const logout = () => { setUser(null); storage.del("automail_session"); setPage("dashboard"); };

  const switchTheme = (t) => { setTheme(t); persist("automail_theme", t); };

  const addActivity = useCallback((type, message) => {
    const entry = { id: uid(), type, message, time: now() };
    setActivity(prev => { const next = [entry, ...prev].slice(0, 50); persist("automail_activity", next); return next; });
  }, []);

  const saveAutomations = (list) => { setAutomations(list); persist("automail_automations", list); };
  const saveTemplates = (list) => { setTemplates(list); persist("automail_templates", list); };
  const saveContacts = (list) => { setContacts(list); persist("automail_contacts", list); };

  return { user, login, logout, theme, switchTheme, page, setPage, automations, saveAutomations, templates, saveTemplates, contacts, saveContacts, activity, addActivity };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const icons = {
  mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  bot: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2m18 0h-2M9 18v2m6-2v2m-3-9h.01M15 13h.01"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  template: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg>,
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  sun: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  sparkle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  play: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
};

// ─── Theme Configs ─────────────────────────────────────────────────────────────
const themes = {
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

// ─── STYLES HELPER ─────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("automail-styles")) return;
  const s = document.createElement("style");
  s.id = "automail-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=Syne:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: 'DM Sans', sans-serif; }
    .am-root { min-height: 100vh; font-family: 'DM Sans', sans-serif; transition: background 0.3s; }
    .am-title { font-family: 'Syne', sans-serif; }
    input, textarea, select { font-family: 'DM Sans', sans-serif; outline: none; }
    button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
    .am-scrollbar::-webkit-scrollbar { width: 4px; }
    .am-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 2px; }
    .am-scrollbar::-webkit-scrollbar-track { background: transparent; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .am-fade { animation: fadeIn 0.3s ease forwards; }
    .am-pulse { animation: pulse 2s infinite; }
    .am-spin { animation: spin 1s linear infinite; }
    .am-shimmer {
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }
    .am-hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
    .am-hover-lift:hover { transform: translateY(-2px); }
    .am-glass { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
    .am-sidebar-link { transition: all 0.2s; border-radius: 10px; }
    .am-sidebar-link:hover { background: rgba(59,130,246,0.08); }
    .am-btn { transition: all 0.2s; }
    .am-btn:hover { filter: brightness(1.1); }
    .am-btn:active { transform: scale(0.97); }
    .am-tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .am-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); animation: fadeIn 0.2s; }
    .am-modal { width: 520px; max-width: calc(100vw - 40px); max-height: calc(100vh - 80px); overflow-y: auto; border-radius: 16px; animation: fadeIn 0.2s; }
    .am-stat-card { position: relative; overflow: hidden; }
    .am-stat-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 60%, rgba(59,130,246,0.05)); pointer-events: none; }
    input:focus, textarea:focus, select:focus { outline: none !important; }
    .am-mobile-menu { display: none; }
    @media (max-width: 768px) {
      .am-sidebar-desktop { display: none !important; }
      .am-mobile-menu { display: flex; }
      .am-main-content { margin-left: 0 !important; }
    }
  `;
  document.head.appendChild(s);
};

// ─── Component: Button ────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, style = {}, t }) => {
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

// ─── Component: Input ─────────────────────────────────────────────────────────
const Input = ({ label, value, onChange, type = "text", placeholder, t, required, style = {} }) => {
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

// ─── Component: Badge ─────────────────────────────────────────────────────────
const Badge = ({ label, color = "#3b82f6" }) => (
  <span className="am-tag" style={{ background: color + "20", color }}>
    {label}
  </span>
);

// ─── Component: Modal ─────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, t }) => {
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

// ─── Auth Pages ───────────────────────────────────────────────────────────────
const AuthPage = ({ mode, onSwitch, onLogin, t }) => {
  const th = themes[t] || themes.dark;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError("");
    if (!email || !password) return setError("Email and password are required.");
    if (mode === "signup" && !name) return setError("Name is required.");
    setLoading(true);
    setTimeout(() => {
      const users = storage.get("automail_users") || {};
      if (mode === "signup") {
        if (users[email]) { setLoading(false); return setError("Account already exists. Please sign in."); }
        const newUser = { id: uid(), email, name, company, password: hash(password) };
        users[email] = newUser;
        storage.set("automail_users", users);
        onLogin({ id: newUser.id, email, name, company });
      } else {
        const user = users[email];
        if (!user || user.password !== hash(password)) { setLoading(false); return setError("Invalid email or password."); }
        onLogin({ id: user.id, email, name: user.name, company: user.company });
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: th.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${th.primary}15 0%, transparent 70%)`, top: -100, right: -100, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${th.accent}10 0%, transparent 70%)`, bottom: -50, left: -50, pointerEvents: "none" }} />

      <div className="am-fade am-glass" style={{ width: "100%", maxWidth: 420, background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20, padding: "40px 36px", boxShadow: `0 20px 60px ${th.glow}` }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${th.primary}, ${th.accent})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: 22, height: 22, color: "#fff", display: "flex" }}>{icons.bot}</span>
          </div>
          <span className="am-title" style={{ fontSize: 22, fontWeight: 700, color: th.text }}>AutoMail AI</span>
        </div>

        <h2 className="am-title" style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700, color: th.text }}>
          {mode === "signup" ? "Create account" : "Welcome back"}
        </h2>
        <p style={{ margin: "0 0 28px", color: th.textMuted, fontSize: 14 }}>
          {mode === "signup" ? "Start automating your emails today" : "Sign in to your workspace"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "signup" && (
            <Input label="Full Name" value={name} onChange={setName} placeholder="Jane Smith" t={t} required />
          )}
          {mode === "signup" && (
            <Input label="Company" value={company} onChange={setCompany} placeholder="Acme Corp (optional)" t={t} />
          )}
          <Input label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@company.com" t={t} required />
          <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" t={t} required />

          {error && (
            <div style={{ background: th.danger + "15", border: `1px solid ${th.danger}30`, borderRadius: 8, padding: "10px 14px", color: th.danger, fontSize: 13 }}>
              {error}
            </div>
          )}

          <Btn onClick={handleSubmit} disabled={loading} size="lg" t={t} style={{ justifyContent: "center", marginTop: 4 }}>
            {loading ? <span style={{ width: 16, height: 16, display: "flex", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} className="am-spin" /> : null}
            {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
          </Btn>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: th.textMuted }}>
          {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
          {" "}
          <button onClick={onSwitch} style={{ background: "none", border: "none", color: th.primary, cursor: "pointer", fontWeight: 500, fontSize: 14 }}>
            {mode === "signup" ? "Sign in" : "Sign up free"}
          </button>
        </p>

        {mode === "signin" && (
          <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: th.textMuted }}>
            Demo: create an account or use any email/password
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ page, setPage, user, logout, theme, switchTheme, t, mobile, onClose }) => {
  const th = themes[t] || themes.dark;
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: icons.home },
    { id: "automations", label: "Automations", icon: icons.zap },
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
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px", marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${th.primary}, ${th.accent})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ width: 18, height: 18, color: "#fff", display: "flex" }}>{icons.bot}</span>
            </div>
            <span className="am-title" style={{ fontWeight: 700, fontSize: 16, color: th.text }}>AutoMail AI</span>
          </div>

          {/* Nav */}
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

          {/* Theme switcher */}
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

          {/* User */}
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

// ─── Dashboard Page ───────────────────────────────────────────────────────────
const DashboardPage = ({ store }) => {
  const { automations, contacts, templates, activity, t } = store;
  const th = themes[t] || themes.dark;
  const active = automations.filter(a => a.status === "active").length;
  const totalEmails = automations.reduce((s, a) => s + a.emails, 0);

  const stats = [
    { label: "Active Automations", value: active, icon: icons.zap, color: th.primary, sub: `${automations.length} total` },
    { label: "Emails Sent", value: totalEmails.toLocaleString(), icon: icons.mail, color: th.accent, sub: "all time" },
    { label: "Contacts", value: contacts.length, icon: icons.users, color: th.success, sub: `${contacts.filter(c => c.status === "active").length} active` },
    { label: "Templates", value: templates.length, icon: icons.template, color: th.warning, sub: "ready to use" },
  ];

  const typeColors = { sent: th.success, scheduled: th.primary, conflict: th.warning, analysis: th.accent };
  const typeLabels = { sent: "Sent", scheduled: "Scheduled", conflict: "Resolved", analysis: "Analysis" };

  return (
    <div className="am-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 className="am-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: th.text }}>Dashboard</h1>
        <p style={{ margin: "6px 0 0", color: th.textMuted, fontSize: 14 }}>AI Command Center — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="am-hover-lift am-stat-card" style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, color: th.textMuted, marginBottom: 8 }}>{s.label}</div>
                <div className="am-title" style={{ fontSize: 32, fontWeight: 700, color: th.text, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: th.textMuted, marginTop: 6 }}>{s.sub}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 20, height: 20, color: s.color, display: "flex" }}>{s.icon}</span>
              </div>
            </div>
            <div style={{ marginTop: 14, height: 3, borderRadius: 2, background: th.border, overflow: "hidden" }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg, ${s.color}, ${s.color}80)`, width: "65%", borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Activity */}
        <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 className="am-title" style={{ margin: 0, fontSize: 16, fontWeight: 600, color: th.text }}>AI Activity Log</h3>
            <span className="am-tag am-pulse" style={{ background: th.success + "20", color: th.success }}>● Live</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activity.slice(0, 6).map(a => (
              <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: typeColors[a.type] || th.primary, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: th.text, lineHeight: 1.4 }}>{a.message}</div>
                  <div style={{ fontSize: 11, color: th.textMuted, marginTop: 2 }}>{fmtDate(a.time)} · {fmtTime(a.time)}</div>
                </div>
                <Badge label={typeLabels[a.type] || a.type} color={typeColors[a.type] || th.primary} />
              </div>
            ))}
          </div>
        </div>

        {/* Active automations */}
        <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 className="am-title" style={{ margin: 0, fontSize: 16, fontWeight: 600, color: th.text }}>Active Automations</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {automations.filter(a => a.status === "active").slice(0, 4).map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: th.surfaceAlt, borderRadius: 10, border: `1px solid ${th.border}` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: th.success }} className="am-pulse" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: th.text }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: th.textMuted }}>{a.emails} emails sent</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Automations Page ─────────────────────────────────────────────────────────
const AutomationsPage = ({ store }) => {
  const { automations, saveAutomations, addActivity, t } = store;
  const th = themes[t] || themes.dark;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", trigger: "", action: "" });
  const [search, setSearch] = useState("");

  const filtered = automations.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.trigger.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setForm({ name: "", trigger: "", action: "" }); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); setForm({ name: a.name, trigger: a.trigger, action: a.action }); setShowModal(true); };

  const save = () => {
    if (!form.name || !form.trigger || !form.action) return;
    if (editing) {
      const updated = automations.map(a => a.id === editing.id ? { ...a, ...form } : a);
      saveAutomations(updated);
      addActivity("analysis", `Automation "${form.name}" updated`);
    } else {
      const newA = { id: uid(), ...form, status: "active", emails: 0, lastRun: now(), created: now() };
      saveAutomations([newA, ...automations]);
      addActivity("scheduled", `New automation "${form.name}" created`);
    }
    setShowModal(false);
  };

  const remove = (id) => {
    const a = automations.find(x => x.id === id);
    saveAutomations(automations.filter(x => x.id !== id));
    addActivity("analysis", `Automation "${a?.name}" deleted`);
  };

  const toggleStatus = (id) => {
    const updated = automations.map(a => a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a);
    saveAutomations(updated);
    const a = updated.find(x => x.id === id);
    addActivity(a.status === "active" ? "scheduled" : "analysis", `Automation "${a?.name}" ${a.status}`);
  };

  return (
    <div className="am-fade">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="am-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: th.text }}>Automations</h1>
          <p style={{ margin: "4px 0 0", color: th.textMuted, fontSize: 14 }}>{automations.filter(a => a.status === "active").length} active workflows</p>
        </div>
        <Btn onClick={openNew} t={t}><span style={{ width: 16, height: 16, display: "flex" }}>{icons.plus}</span>New Automation</Btn>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: th.textMuted, display: "flex" }}>{icons.search}</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search automations…"
          style={{ width: "100%", background: th.surface, border: `1px solid ${th.border}`, borderRadius: 10, padding: "10px 14px 10px 38px", color: th.text, fontSize: 14 }}
          onFocus={e => e.target.style.borderColor = th.primary}
          onBlur={e => e.target.style.borderColor = th.border}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(a => (
          <div key={a.id} className="am-hover-lift" style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.status === "active" ? th.success : th.textMuted, flexShrink: 0 }} className={a.status === "active" ? "am-pulse" : ""} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: th.text }}>{a.name}</div>
              <div style={{ fontSize: 13, color: th.textMuted, marginTop: 3 }}>
                <span style={{ color: th.accent }}>Trigger:</span> {a.trigger} → <span style={{ color: th.primary }}>Action:</span> {a.action}
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ textAlign: "right" }}>
                <div className="am-title" style={{ fontSize: 18, fontWeight: 700, color: th.text }}>{a.emails.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: th.textMuted }}>emails sent</div>
              </div>
              <Badge label={a.status} color={a.status === "active" ? th.success : th.textMuted} />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => toggleStatus(a.id)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${th.border}`, background: th.surfaceAlt, color: a.status === "active" ? th.warning : th.success, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title={a.status === "active" ? "Pause" : "Resume"}>
                  <span style={{ width: 14, height: 14, display: "flex" }}>{a.status === "active" ? icons.pause : icons.play}</span>
                </button>
                <button onClick={() => openEdit(a)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${th.border}`, background: th.surfaceAlt, color: th.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 14, height: 14, display: "flex" }}>{icons.edit}</span>
                </button>
                <button onClick={() => remove(a.id)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${th.border}`, background: th.surfaceAlt, color: th.danger, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 14, height: 14, display: "flex" }}>{icons.trash}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: th.textMuted }}>
            <span style={{ width: 48, height: 48, display: "block", margin: "0 auto 16px", color: th.border }}>{icons.zap}</span>
            No automations found. Create your first one!
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Automation" : "New Automation"} t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Automation Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Follow-up Sequence" t={t} required />
          <Input label="Trigger Condition" value={form.trigger} onChange={v => setForm(f => ({ ...f, trigger: v }))} placeholder="e.g. No reply in 3 days" t={t} required />
          <Input label="Action" value={form.action} onChange={v => setForm(f => ({ ...f, action: v }))} placeholder="e.g. Send follow-up email" t={t} required />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn onClick={() => setShowModal(false)} variant="secondary" t={t}>Cancel</Btn>
            <Btn onClick={save} t={t}>{editing ? "Save Changes" : "Create Automation"}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Templates Page ───────────────────────────────────────────────────────────
const TemplatesPage = ({ store }) => {
  const { templates, saveTemplates, addActivity, t } = store;
  const th = themes[t] || themes.dark;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", subject: "", body: "", tags: "" });
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setForm({ name: "", subject: "", body: "", tags: "" }); setShowModal(true); };
  const openEdit = (tmpl) => { setEditing(tmpl); setForm({ name: tmpl.name, subject: tmpl.subject, body: tmpl.body, tags: tmpl.tags.join(", ") }); setShowModal(true); };

  const save = () => {
    if (!form.name || !form.subject) return;
    const tags = form.tags.split(",").map(s => s.trim()).filter(Boolean);
    if (editing) {
      saveTemplates(templates.map(t => t.id === editing.id ? { ...t, ...form, tags } : t));
      addActivity("analysis", `Template "${form.name}" updated`);
    } else {
      saveTemplates([{ id: uid(), ...form, tags, uses: 0, created: now() }, ...templates]);
      addActivity("analysis", `New template "${form.name}" created`);
    }
    setShowModal(false);
  };

  const remove = (id) => {
    const tmpl = templates.find(x => x.id === id);
    saveTemplates(templates.filter(x => x.id !== id));
    addActivity("analysis", `Template "${tmpl?.name}" deleted`);
  };

  const tagColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];
  const tagColor = (tag) => tagColors[Math.abs(tag.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % tagColors.length];

  return (
    <div className="am-fade">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="am-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: th.text }}>Templates</h1>
          <p style={{ margin: "4px 0 0", color: th.textMuted, fontSize: 14 }}>{templates.length} email templates</p>
        </div>
        <Btn onClick={openNew} t={t}><span style={{ width: 16, height: 16, display: "flex" }}>{icons.plus}</span>New Template</Btn>
      </div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: th.textMuted, display: "flex" }}>{icons.search}</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates…"
          style={{ width: "100%", background: th.surface, border: `1px solid ${th.border}`, borderRadius: 10, padding: "10px 14px 10px 38px", color: th.text, fontSize: 14 }}
          onFocus={e => e.target.style.borderColor = th.primary}
          onBlur={e => e.target.style.borderColor = th.border}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {filtered.map(tmpl => (
          <div key={tmpl.id} className="am-hover-lift" style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: th.text, marginBottom: 6 }}>{tmpl.name}</div>
              <div style={{ fontSize: 13, color: th.textMuted, fontStyle: "italic" }}>{tmpl.subject}</div>
            </div>
            <div style={{ fontSize: 13, color: th.textMuted, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {tmpl.body}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tmpl.tags.map(tag => <Badge key={tag} label={tag} color={tagColor(tag)} />)}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
              <span style={{ fontSize: 12, color: th.textMuted }}>{tmpl.uses} uses</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setPreview(tmpl)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${th.border}`, background: th.surfaceAlt, color: th.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 14, height: 14, display: "flex" }}>{icons.eye}</span>
                </button>
                <button onClick={() => openEdit(tmpl)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${th.border}`, background: th.surfaceAlt, color: th.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 14, height: 14, display: "flex" }}>{icons.edit}</span>
                </button>
                <button onClick={() => remove(tmpl.id)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${th.border}`, background: th.surfaceAlt, color: th.danger, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 14, height: 14, display: "flex" }}>{icons.trash}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/New Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Template" : "New Template"} t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Template Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Cold Outreach" t={t} required />
          <Input label="Subject Line" value={form.subject} onChange={v => setForm(f => ({ ...f, subject: v }))} placeholder="e.g. Quick question about {{company}}" t={t} required />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: th.textMuted }}>Body</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Email body. Use {{variable}} for placeholders." rows={6}
              style={{ background: th.surfaceAlt, border: `1px solid ${th.border}`, borderRadius: 8, padding: "10px 14px", color: th.text, fontSize: 13, resize: "vertical" }}
              onFocus={e => e.target.style.borderColor = th.primary}
              onBlur={e => e.target.style.borderColor = th.border}
            />
          </div>
          <Input label="Tags (comma-separated)" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="sales, outreach, follow-up" t={t} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn onClick={() => setShowModal(false)} variant="secondary" t={t}>Cancel</Btn>
            <Btn onClick={save} t={t}>{editing ? "Save Changes" : "Create Template"}</Btn>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Template Preview" t={t}>
        {preview && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: th.surfaceAlt, borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: th.textMuted, marginBottom: 4 }}>SUBJECT</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: th.text }}>{preview.subject}</div>
            </div>
            <div style={{ background: th.surfaceAlt, borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: th.textMuted, marginBottom: 8 }}>BODY</div>
              <pre style={{ margin: 0, fontSize: 13, color: th.text, whiteSpace: "pre-wrap", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{preview.body}</pre>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {preview.tags.map(tag => <Badge key={tag} label={tag} color={tagColor(tag)} />)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  function tagColor(tag) {
    const tagColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];
    return tagColors[Math.abs(tag.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % tagColors.length];
  }
};

// ─── Contacts Page ────────────────────────────────────────────────────────────
const ContactsPage = ({ store }) => {
  const { contacts, saveContacts, addActivity, t } = store;
  const th = themes[t] || themes.dark;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", company: "", tags: "" });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const openNew = () => { setEditing(null); setForm({ name: "", email: "", company: "", tags: "" }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email, company: c.company, tags: c.tags.join(", ") }); setShowModal(true); };

  const save = () => {
    if (!form.name || !form.email) return;
    const tags = form.tags.split(",").map(s => s.trim()).filter(Boolean);
    if (editing) {
      saveContacts(contacts.map(c => c.id === editing.id ? { ...c, ...form, tags } : c));
      addActivity("analysis", `Contact "${form.name}" updated`);
    } else {
      saveContacts([{ id: uid(), ...form, tags, status: "active", lastContact: now() }, ...contacts]);
      addActivity("sent", `New contact "${form.name}" added`);
    }
    setShowModal(false);
  };

  const remove = (id) => {
    const c = contacts.find(x => x.id === id);
    saveContacts(contacts.filter(x => x.id !== id));
    addActivity("analysis", `Contact "${c?.name}" removed`);
  };

  const toggleStatus = (id) => {
    saveContacts(contacts.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
  };

  const tagColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];
  const tc = (tag) => tagColors[Math.abs(tag.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % tagColors.length];

  return (
    <div className="am-fade">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="am-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: th.text }}>Contacts</h1>
          <p style={{ margin: "4px 0 0", color: th.textMuted, fontSize: 14 }}>{contacts.length} total · {contacts.filter(c => c.status === "active").length} active</p>
        </div>
        <Btn onClick={openNew} t={t}><span style={{ width: 16, height: 16, display: "flex" }}>{icons.plus}</span>Add Contact</Btn>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: th.textMuted, display: "flex" }}>{icons.search}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
            style={{ width: "100%", background: th.surface, border: `1px solid ${th.border}`, borderRadius: 10, padding: "10px 14px 10px 38px", color: th.text, fontSize: 14 }}
            onFocus={e => e.target.style.borderColor = th.primary}
            onBlur={e => e.target.style.borderColor = th.border}
          />
        </div>
        {["all", "active", "inactive"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "9px 16px", borderRadius: 10, border: `1px solid ${filter === f ? th.primary : th.border}`, background: filter === f ? th.primary + "20" : th.surface, color: filter === f ? th.primary : th.textMuted, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${th.border}`, fontSize: 12, fontWeight: 600, color: th.textMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          <span>Name</span><span>Email</span><span>Company</span><span>Status</span><span>Actions</span>
        </div>
        {filtered.map((c, i) => (
          <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 12, padding: "14px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${th.border}` : "none", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: th.text }}>{c.name}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                {c.tags.map(tag => <Badge key={tag} label={tag} color={tc(tag)} />)}
              </div>
            </div>
            <div style={{ fontSize: 13, color: th.textMuted }}>{c.email}</div>
            <div style={{ fontSize: 13, color: th.text }}>{c.company}</div>
            <div>
              <button onClick={() => toggleStatus(c.id)}
                style={{ padding: "4px 10px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer", background: c.status === "active" ? th.success + "20" : th.textMuted + "20", color: c.status === "active" ? th.success : th.textMuted }}>
                ● {c.status}
              </button>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => openEdit(c)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${th.border}`, background: th.surfaceAlt, color: th.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 14, height: 14, display: "flex" }}>{icons.edit}</span>
              </button>
              <button onClick={() => remove(c.id)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${th.border}`, background: th.surfaceAlt, color: th.danger, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 14, height: 14, display: "flex" }}>{icons.trash}</span>
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: th.textMuted }}>
            No contacts found.
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Contact" : "Add Contact"} t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Jane Smith" t={t} required />
          <Input label="Email Address" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" placeholder="jane@company.com" t={t} required />
          <Input label="Company" value={form.company} onChange={v => setForm(f => ({ ...f, company: v }))} placeholder="Acme Corp" t={t} />
          <Input label="Tags (comma-separated)" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="lead, enterprise, prospect" t={t} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn onClick={() => setShowModal(false)} variant="secondary" t={t}>Cancel</Btn>
            <Btn onClick={save} t={t}>{editing ? "Save Changes" : "Add Contact"}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Analytics Page ───────────────────────────────────────────────────────────
const AnalyticsPage = ({ store }) => {
  const { automations, contacts, templates, t } = store;
  const th = themes[t] || themes.dark;

  const totalEmails = automations.reduce((s, a) => s + a.emails, 0);
  const activeRate = automations.length ? ((automations.filter(a => a.status === "active").length / automations.length) * 100).toFixed(0) : 0;
  const avgEmails = automations.length ? Math.round(totalEmails / automations.length) : 0;

  const barData = automations.map(a => ({ label: a.name.length > 14 ? a.name.slice(0, 14) + "…" : a.name, value: a.emails, max: Math.max(...automations.map(x => x.emails)) }));

  const metrics = [
    { label: "Total Emails Sent", value: totalEmails.toLocaleString(), change: "+12.4%", up: true },
    { label: "Automation Rate", value: activeRate + "%", change: "+5.1%", up: true },
    { label: "Avg Emails/Flow", value: avgEmails, change: "+8.7%", up: true },
    { label: "Contact Reach", value: contacts.filter(c => c.status === "active").length, change: "+3.2%", up: true },
  ];

  return (
    <div className="am-fade">
      <div style={{ marginBottom: 28 }}>
        <h1 className="am-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: th.text }}>Analytics</h1>
        <p style={{ margin: "4px 0 0", color: th.textMuted, fontSize: 14 }}>Performance overview — Last 30 days</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 13, color: th.textMuted, marginBottom: 8 }}>{m.label}</div>
            <div className="am-title" style={{ fontSize: 28, fontWeight: 700, color: th.text }}>{m.value}</div>
            <div style={{ fontSize: 12, color: m.up ? th.success : th.danger, marginTop: 6 }}>{m.change} vs last month</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 20 }}>
        <h3 className="am-title" style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: th.text }}>Emails per Automation</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {barData.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 140, fontSize: 13, color: th.textMuted, textAlign: "right", flexShrink: 0 }}>{d.label}</div>
              <div style={{ flex: 1, height: 24, background: th.surfaceAlt, borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${d.max ? (d.value / d.max) * 100 : 0}%`, background: `linear-gradient(90deg, ${th.primary}, ${th.accent})`, borderRadius: 6, transition: "width 1s ease", display: "flex", alignItems: "center", paddingRight: 8, justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>{d.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tag breakdown */}
      <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: "22px 24px" }}>
        <h3 className="am-title" style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: th.text }}>Contact Tag Distribution</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {(() => {
            const tagMap = {};
            contacts.forEach(c => c.tags.forEach(tag => { tagMap[tag] = (tagMap[tag] || 0) + 1; }));
            const tagColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];
            return Object.entries(tagMap).sort((a, b) => b[1] - a[1]).map(([tag, count], i) => (
              <div key={tag} style={{ display: "flex", alignItems: "center", gap: 8, background: th.surfaceAlt, border: `1px solid ${th.border}`, borderRadius: 8, padding: "8px 14px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: tagColors[i % tagColors.length] }} />
                <span style={{ fontSize: 13, color: th.text, fontWeight: 500 }}>{tag}</span>
                <span style={{ fontSize: 13, color: th.textMuted }}>{count}</span>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

// ─── Settings Page ─────────────────────────────────────────────────────────────
const SettingsPage = ({ store }) => {
  const { user, t, switchTheme, theme, automations, contacts, templates, saveAutomations, saveContacts, saveTemplates, addActivity } = store;
  const th = themes[t] || themes.dark;
  const [profile, setProfile] = useState({ name: user?.name || "", company: user?.company || "", email: user?.email || "" });
  const [prefs, setPrefs] = useState(() => storage.get("automail_prefs") || { notifications: true, aiAutoResolve: true, weeklyReport: false, gmailSync: false });
  const [saved, setSaved] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");

  const saveProfile = () => {
    const users = storage.get("automail_users") || {};
    if (users[user.email]) { users[user.email] = { ...users[user.email], name: profile.name, company: profile.company }; storage.set("automail_users", users); }
    const sess = storage.get("automail_session");
    storage.set("automail_session", { ...sess, name: profile.name, company: profile.company });
    addActivity("analysis", "Profile settings updated");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    storage.set("automail_prefs", next);
  };

  const changePassword = () => {
    const users = storage.get("automail_users") || {};
    const u = users[user.email];
    if (!u) return setPwMsg("User not found.");
    if (u.password !== hash(pw.current)) return setPwMsg("Current password is incorrect.");
    if (pw.next.length < 6) return setPwMsg("New password must be at least 6 characters.");
    if (pw.next !== pw.confirm) return setPwMsg("Passwords do not match.");
    users[user.email] = { ...u, password: hash(pw.next) };
    storage.set("automail_users", users);
    setPw({ current: "", next: "", confirm: "" });
    setPwMsg("Password updated successfully!");
    setTimeout(() => setPwMsg(""), 3000);
  };

  const resetData = () => {
    if (!confirm("Reset all data to defaults? This can't be undone.")) return;
    saveAutomations(SEED_AUTOMATIONS);
    saveContacts(SEED_CONTACTS);
    saveTemplates(SEED_TEMPLATES);
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
      <button onClick={() => togglePref(k)} style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative",
        background: prefs[k] ? th.primary : th.border, transition: "background 0.2s",
      }}>
        <span style={{
          position: "absolute", top: 3, left: prefs[k] ? 23 : 3, width: 18, height: 18, borderRadius: "50%",
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
          <Input label="Email Address" value={profile.email} onChange={() => {}} t={t} style={{ opacity: 0.6 }} />
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

      <Section title="Security">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Current Password" value={pw.current} onChange={v => setPw(p => ({ ...p, current: v }))} type="password" placeholder="••••••••" t={t} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="New Password" value={pw.next} onChange={v => setPw(p => ({ ...p, next: v }))} type="password" placeholder="••••••••" t={t} />
            <Input label="Confirm Password" value={pw.confirm} onChange={v => setPw(p => ({ ...p, confirm: v }))} type="password" placeholder="••••••••" t={t} />
          </div>
          {pwMsg && <div style={{ padding: "10px 14px", borderRadius: 8, background: pwMsg.includes("success") ? th.success + "15" : th.danger + "15", color: pwMsg.includes("success") ? th.success : th.danger, fontSize: 13 }}>{pwMsg}</div>}
          <Btn onClick={changePassword} t={t}>Update Password</Btn>
        </div>
      </Section>

      <Section title="Data Management">
        <p style={{ margin: "0 0 14px", fontSize: 14, color: th.textMuted }}>Reset all sample data back to defaults. Your account will remain active.</p>
        <Btn onClick={resetData} variant="danger" t={t}>Reset to Default Data</Btn>
      </Section>
    </div>
  );
};

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => { injectStyles(); }, []);
  const store = useStore();
  const { user, login, logout, theme, switchTheme, page, setPage, automations, saveAutomations, templates, saveTemplates, contacts, saveContacts, activity, addActivity } = store;
  const [authMode, setAuthMode] = useState("signin");
  const [mobileOpen, setMobileOpen] = useState(false);
  const th = themes[theme] || themes.dark;

  const storeWithTheme = { ...store, t: theme };

  if (!user) {
    return (
      <div className="am-root" style={{ background: th.bg }}>
        <AuthPage mode={authMode} onSwitch={() => setAuthMode(m => m === "signin" ? "signup" : "signin")} onLogin={login} t={theme} />
      </div>
    );
  }

  const pageComponents = {
    dashboard: <DashboardPage store={storeWithTheme} />,
    automations: <AutomationsPage store={storeWithTheme} />,
    templates: <TemplatesPage store={storeWithTheme} />,
    contacts: <ContactsPage store={storeWithTheme} />,
    analytics: <AnalyticsPage store={storeWithTheme} />,
    settings: <SettingsPage store={storeWithTheme} />,
  };

  return (
    <div className="am-root" style={{ background: th.bg, minHeight: "100vh", display: "flex" }}>
      {/* Desktop sidebar */}
      <div className="am-sidebar-desktop">
        <Sidebar page={page} setPage={setPage} user={user} logout={logout} theme={theme} switchTheme={switchTheme} t={theme} />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <Sidebar page={page} setPage={setPage} user={user} logout={logout} theme={theme} switchTheme={switchTheme} t={theme} mobile onClose={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <main className="am-main-content am-scrollbar" style={{ flex: 1, marginLeft: 240, minHeight: "100vh", overflowY: "auto" }}>
        {/* Top bar */}
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

        {/* Page content */}
        <div style={{ padding: "28px 28px 40px" }}>
          {pageComponents[page] || pageComponents.dashboard}
        </div>
      </main>
    </div>
  );
}
