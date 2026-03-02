import React, { useState } from "react";
import { themes, icons } from "../constants/constants";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";

export const AuthPage = ({ mode, onSwitch, onGoogleSignIn, t }) => {
    const th = themes[t] || themes.dark;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError("");
        if (!email || !password) return setError("Email and password are required.");
        if (mode === "signup" && !name) return setError("Please enter your name.");
        setLoading(true);

        try {
            if (mode === "signup") {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(cred.user, { displayName: name });
                await setDoc(doc(db, "users", cred.user.uid), {
                    name, company, email,
                    joinedAt: new Date().toISOString()
                }, { merge: true });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            const msg = err.code?.split("/")[1]?.replace(/-/g, " ") || err.message;
            setError(msg.charAt(0).toUpperCase() + msg.slice(1));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: th.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${th.primary}15 0%, transparent 70%)`, top: -100, right: -100, pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${th.accent}10 0%, transparent 70%)`, bottom: -50, left: -50, pointerEvents: "none" }} />

            <div className="am-fade am-glass" style={{ width: "100%", maxWidth: 420, background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20, padding: "40px 36px", boxShadow: `0 20px 60px ${th.glow}` }}>
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

                    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
                        <div style={{ flex: 1, height: 1, background: th.border }} />
                        <span style={{ fontSize: 12, color: th.textMuted }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: th.border }} />
                    </div>

                    <button
                        onClick={() => { setError(""); onGoogleSignIn().catch(err => setError(err.message)); }}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                            padding: "12px", borderRadius: 10, border: `1px solid ${th.border}`,
                            background: th.surfaceAlt, color: th.text, cursor: "pointer",
                            fontSize: 14, fontWeight: 500, transition: "all 0.2s"
                        }}
                        className="am-hover-lift"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: th.textMuted }}>
                    {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
                    {" "}
                    <button onClick={onSwitch} style={{ background: "none", border: "none", color: th.primary, cursor: "pointer", fontWeight: 500, fontSize: 14 }}>
                        {mode === "signup" ? "Sign in" : "Sign up free"}
                    </button>
                </p>
            </div>
        </div>
    );
};
