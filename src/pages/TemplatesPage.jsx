import React, { useState } from "react";
import { themes, icons } from "../constants/constants";
import { uid, now } from "../utils/utils";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";

export const TemplatesPage = ({ store }) => {
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

            <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Template" : "New Template"} t={t}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Input label="Template Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Cold Outreach" t={t} required />
                    <Input label="Subject Line" value={form.subject} onChange={v => setForm(f => ({ ...f, subject: v }))} placeholder="e.g. Quick question about {{company}}" t={t} required />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: th.textMuted }}>Body</label>
                        <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Email body. Use {{variable}} for placeholders." rows={6}
                            style={{ background: th.surfaceAlt, border: `1px solid ${th.border}`, borderRadius: 8, padding: "10px 14px", color: th.text, fontSize: 13, resize: "vertical" }}
                        />
                    </div>
                    <Input label="Tags (comma-separated)" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="sales, outreach, follow-up" t={t} />
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                        <Btn onClick={() => setShowModal(false)} variant="secondary" t={t}>Cancel</Btn>
                        <Btn onClick={save} t={t}>{editing ? "Save Changes" : "Create Template"}</Btn>
                    </div>
                </div>
            </Modal>

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
};
