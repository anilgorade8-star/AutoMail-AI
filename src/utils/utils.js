export const storage = {
    get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
    del: (k) => { try { localStorage.removeItem(k); } catch { } },
};

export const hash = (s) => btoa(s + "automail_salt_2026");
export const uid = () => Math.random().toString(36).slice(2);
export const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const fmtTime = (d) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
export const now = () => new Date().toISOString();
