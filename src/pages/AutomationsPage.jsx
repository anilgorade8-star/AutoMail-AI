import React, { useState } from "react";
import { themes, icons } from "../constants/constants";
import { uid, now } from "../utils/utils";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";

export const AutomationsPage = ({ store }) => {
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
