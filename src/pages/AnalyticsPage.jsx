import React from "react";
import { themes } from "../constants/constants";

export const AnalyticsPage = ({ store }) => {
    const { automations, contacts, t } = store;
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
