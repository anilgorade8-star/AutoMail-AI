import React, { useState } from "react";
import { themes, icons } from "../constants/constants";
import { fmtDate, fmtTime } from "../utils/utils";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";

export const CalendarPage = ({ store }) => {
    const { calendarEvents, saveCalendar, addActivity, settings, t } = store;
    const th = themes[t] || themes.dark;
    const [view, setView] = useState("list");

    const sortedEvents = [...calendarEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

    const removeEvent = (id) => {
        const ev = calendarEvents.find(x => x.id === id);
        saveCalendar(calendarEvents.filter(x => x.id !== id));
        addActivity("analysis", `Calendar event "${ev?.title}" removed`);
    };

    return (
        <div className="am-fade">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 className="am-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: th.text }}>Calendar</h1>
                    <p style={{ margin: "4px 0 0", color: th.textMuted, fontSize: 14 }}>{calendarEvents.length} scheduled events</p>
                </div>
                <div style={{ display: "flex", background: th.surfaceAlt, borderRadius: 10, padding: 4 }}>
                    <button onClick={() => setView("list")} style={{ padding: "6px 12px", border: "none", borderRadius: 7, background: view === "list" ? th.primary : "transparent", color: view === "list" ? "#fff" : th.textMuted, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>List</button>
                    <button onClick={() => setView("month")} style={{ padding: "6px 12px", border: "none", borderRadius: 7, background: view === "month" ? th.primary : "transparent", color: view === "month" ? "#fff" : th.textMuted, cursor: "not-allowed", fontSize: 13, fontWeight: 500, opacity: 0.5 }}>Month</button>
                </div>
            </div>

            {calendarEvents.length === 0 ? (
                <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: th.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                        <span style={{ width: 30, height: 30, color: th.textMuted }}>{icons.home}</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: th.text }}>No events scheduled</div>
                    <p style={{ color: th.textMuted, maxWidth: 300, margin: "8px auto 0", fontSize: 14 }}>Automated events will appear here once detected in your emails.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {sortedEvents.map(ev => (
                        <div key={ev.id} className="am-hover-lift" style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 20 }}>
                            <div style={{ textAlign: "center", minWidth: 60, paddingRight: 20, borderRight: `1px solid ${th.border}` }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: th.primary, textTransform: "uppercase" }}>{new Date(ev.date).toLocaleDateString("en-US", { month: "short" })}</div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: th.text }}>{new Date(ev.date).getDate()}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 16, fontWeight: 600, color: th.text }}>{ev.title}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                    <span style={{ width: 14, height: 14, color: th.textMuted }}>{icons.users}</span>
                                    <span style={{ fontSize: 13, color: th.textMuted }}>{ev.from}</span>
                                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: th.border }} />
                                    <span style={{ fontSize: 13, color: th.textMuted }}>{fmtTime(ev.date)}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <Badge label="Auto-Added" color={th.success} />
                                <button onClick={() => removeEvent(ev.id)} style={{ background: "none", border: "none", color: th.textMuted, cursor: "pointer", padding: 4, display: "flex", borderRadius: 6 }} title="Remove">
                                    <span style={{ width: 18, height: 18, display: "flex" }}>{icons.trash}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {settings.mobile && calendarEvents.length > 0 && (
                <div style={{ marginTop: 24, background: th.primary + "10", border: `1px solid ${th.primary}30`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 18, height: 18, color: th.primary }}>{icons.zap}</span>
                    <span style={{ fontSize: 13, color: th.text }}>Notifications are being sent to <b>{settings.mobile}</b></span>
                </div>
            )}
        </div>
    );
};
