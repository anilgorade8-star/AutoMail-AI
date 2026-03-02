import React, { useState } from "react";
import { themes, icons } from "../constants/constants";
import { uid, now } from "../utils/utils";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";

export const ContactsPage = ({ store }) => {
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
