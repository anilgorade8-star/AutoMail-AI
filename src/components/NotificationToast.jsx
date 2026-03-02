import React, { useEffect, useState } from "react";
import { themes, icons } from "../constants/constants";

export const NotificationToast = ({ show, title, message, mobile, t, onClose }) => {
    const th = themes[t] || themes.dark;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300);
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [show, onClose]);

    if (!show && !visible) return null;

    return (
        <div style={{
            position: "fixed", top: 20, right: 20, zIndex: 1000,
            width: 340, maxWidth: "calc(100vw - 40px)",
            transform: visible ? "translateX(0)" : "translateX(400px)",
            opacity: visible ? 1 : 0,
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            pointerEvents: visible ? "auto" : "none"
        }}>
            <div style={{
                background: "rgba(17, 24, 39, 0.85)", backdropFilter: "blur(16px)",
                border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 16,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                padding: "12px 16px", overflow: "hidden"
            }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `linear-gradient(135deg, ${th.primary}, ${th.accent})`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                        <span style={{ width: 18, height: 18, color: "#fff", display: "flex" }}>{icons.mail}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{title || "AutoMail AI"}</span>
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>now</span>
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{message}</div>
                        {mobile && (
                            <div style={{ fontSize: 11, color: th.primary, fontWeight: 600, marginTop: 4 }}>
                                Sent to {mobile}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setVisible(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0 }}>
                        <span style={{ width: 14, height: 14, display: "flex" }}>{icons.x}</span>
                    </button>
                </div>
                <div style={{
                    position: "absolute", bottom: 0, left: 0, height: 2, background: th.primary,
                    width: visible ? "100%" : "0%", transition: show ? "width 5s linear" : "none"
                }} />
            </div>
        </div>
    );
};
