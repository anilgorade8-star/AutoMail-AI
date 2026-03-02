import { useState, useCallback, useEffect } from "react";
import { storage, uid, now } from "../utils/utils";
import { SEED_AUTOMATIONS, SEED_TEMPLATES, SEED_CONTACTS, SEED_ACTIVITY } from "../constants/constants";
import { auth, db, googleProvider } from "../firebase";
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export function useStore() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(() => storage.get("automail_theme") || "dark");
    const [page, setPage] = useState("dashboard");
    const [googleToken, setGoogleToken] = useState(() => storage.get("google_token") || null);

    const [automations, setAutomations] = useState(SEED_AUTOMATIONS);
    const [templates, setTemplates] = useState(SEED_TEMPLATES);
    const [contacts, setContacts] = useState(SEED_CONTACTS);
    const [activity, setActivity] = useState(SEED_ACTIVITY);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [settings, setSettings] = useState({ mobile: "", notifyOnSchedule: true });

    const persist = (key, val) => storage.set(key, val);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser({ uid: u.uid, email: u.email, name: u.displayName || u.email.split('@')[0] });
            } else {
                setUser(null);
                setGoogleToken(null);
                storage.del("google_token");
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.automations) setAutomations(data.automations);
                if (data.templates) setTemplates(data.templates);
                if (data.contacts) setContacts(data.contacts);
                if (data.activity) setActivity(data.activity);
                if (data.calendar) setCalendarEvents(data.calendar);
                if (data.settings) setSettings(data.settings);
            }
        });
        return unsub;
    }, [user]);

    const logout = () => {
        signOut(auth);
        setGoogleToken(null);
        storage.del("google_token");
        setPage("dashboard");
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            setGoogleToken(token);
            persist("google_token", token);
            return result.user;
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    };

    const switchTheme = (t) => { setTheme(t); persist("automail_theme", t); };

    const syncToCloud = async (key, val) => {
        if (!user) return;
        try {
            await setDoc(doc(db, "users", user.uid), { [key]: val }, { merge: true });
        } catch (e) {
            console.error("Firebase Sync Error:", e);
        }
    };

    const addActivity = useCallback((type, message) => {
        const entry = { id: uid(), type, message, time: now() };
        setActivity(prev => {
            const next = [entry, ...prev].slice(0, 50);
            syncToCloud("activity", next);
            return next;
        });
    }, [user]);

    const saveAutomations = (list) => { setAutomations(list); syncToCloud("automations", list); };
    const saveTemplates = (list) => { setTemplates(list); syncToCloud("templates", list); };
    const saveContacts = (list) => { setContacts(list); syncToCloud("contacts", list); };
    const saveCalendar = (list) => { setCalendarEvents(list); syncToCloud("calendar", list); };
    const updateSettings = (s) => { setSettings(s); syncToCloud("settings", s); };

    return { user, logout, signInWithGoogle, googleToken, theme, switchTheme, page, setPage, automations, saveAutomations, templates, saveTemplates, contacts, saveContacts, activity, addActivity, calendarEvents, saveCalendar, settings, updateSettings, loading };
}
