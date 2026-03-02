import React, { useState } from "react";
import { themes, icons } from "../constants/constants";
import { fmtDate, fmtTime } from "../utils/utils";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { NotificationToast } from "../components/NotificationToast";
import { fetchRecentEmails, createCalendarEvent } from "../utils/googleApi";
import { detectMeeting } from "../utils/openaiApi";

export const DashboardPage = ({ store }) => {
    const { user, googleToken, automations, contacts, templates, activity, calendarEvents, saveCalendar, addActivity, settings, t } = store;
    const th = themes[t] || themes.dark;
    const [toast, setToast] = useState({ show: false, message: "" });
    const [scanning, setScanning] = useState(false);
    const active = automations.filter(a => a.status === "active").length;
    const totalEmails = automations.reduce((s, a) => s + a.emails, 0);

    const scanEmails = async () => {
        if (!googleToken) return alert("Please sign in with Google to enable email scanning.");

        setScanning(true);
        let found = 0;
        const newEvents = [...calendarEvents];

        try {
            const emails = await fetchRecentEmails(googleToken);

            for (const email of emails) {
                const detection = await detectMeeting(email.body);

                if (detection.isMeeting) {
                    const eventDate = `${detection.date}T${detection.time}:00Z`;

                    // Check if event already exists
                    if (!calendarEvents.some(e => e.date === eventDate)) {
                        const eventData = {
                            id: email.id,
                            title: detection.title || "AI Detected Meeting",
                            from: email.from,
                            date: eventDate,
                            description: detection.description || email.snippet,
                            status: "scheduled"
                        };

                        // 1. Add to local state
                        newEvents.push(eventData);
                        found++;

                        // 2. Add to Google Calendar
                        await createCalendarEvent(googleToken, {
                            title: eventData.title,
                            description: eventData.description,
                            start: eventDate,
                            end: new Date(new Date(eventDate).getTime() + 3600000).toISOString() // Default 1hr
                        });

                        addActivity("scheduled", `Auto-scheduled: ${eventData.title} with ${eventData.from}`);
                    }
                }
            }

            if (found > 0) {
                saveCalendar(newEvents);
                setToast({ show: true, message: `AI Analysis Complete: Found and scheduled ${found} new meetings.` });
            } else {
                alert("AI Analysis Complete: No new meetings found.");
            }
        } catch (error) {
            console.error("Scanning Error:", error);
            alert("Error scanning emails. Please check console for details.");
        } finally {
            setScanning(false);
        }
    };

    const stats = [
        { label: "Active Automations", value: active, icon: icons.zap, color: th.primary, sub: `${automations.length} total` },
        { label: "Emails Sent", value: totalEmails.toLocaleString(), icon: icons.mail, color: th.accent, sub: "all time" },
        { label: "Contacts", value: contacts.length, icon: icons.users, color: th.success, sub: `${contacts.filter(c => c.status === "active").length} active` },
        { label: "Upcoming Meetings", value: calendarEvents.length, icon: icons.mail, color: th.warning, sub: "next 7 days" },
    ];

    const typeColors = { sent: th.success, scheduled: th.primary, conflict: th.warning, analysis: th.accent };
    const typeLabels = { sent: "Sent", scheduled: "Scheduled", conflict: "Resolved", analysis: "Analysis" };

    return (
        <div className="am-fade">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                    <h1 className="am-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: th.text }}>Dashboard</h1>
                    <p style={{ margin: "6px 0 0", color: th.textMuted, fontSize: 14 }}>AI Command Center — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <Btn onClick={scanEmails} disabled={scanning} t={t}>
                    <span style={{ width: 16, height: 16, display: "flex", alignItems: "center" }}>
                        {scanning ? <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} className="am-spin" /> : icons.bot}
                    </span>
                    {scanning ? "Analyzing..." : "Scan for Meetings"}
                </Btn>
            </div>

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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 16 }}>
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

                <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <h3 className="am-title" style={{ margin: 0, fontSize: 16, fontWeight: 600, color: th.text }}>Upcoming Meetings</h3>
                        <span onClick={() => store.setPage("calendar")} style={{ fontSize: 12, color: th.primary, cursor: "pointer", fontWeight: 500 }}>View Calendar</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {calendarEvents.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "20px 0", color: th.textMuted, fontSize: 13 }}>No meetings scheduled.</div>
                        ) : (
                            calendarEvents.slice(0, 4).sort((a, b) => new Date(a.date) - new Date(b.date)).map(ev => (
                                <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: th.surfaceAlt, borderRadius: 10, border: `1px solid ${th.border}` }}>
                                    <div style={{ minWidth: 40, textAlign: "center", borderRight: `1px solid ${th.border}`, marginRight: 4 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: th.primary }}>{new Date(ev.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: th.text }}>{new Date(ev.date).getDate()}</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: th.text }}>{ev.title}</div>
                                        <div style={{ fontSize: 11, color: th.textMuted }}>{fmtTime(ev.date)} with {ev.from}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

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

            <NotificationToast
                show={toast.show}
                title="AI Scheduler"
                message={toast.message}
                mobile={settings.mobile}
                t={t}
                onClose={() => setToast({ show: false, message: "" })}
            />
        </div>
    );
};
