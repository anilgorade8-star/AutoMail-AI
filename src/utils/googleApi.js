/**
 * Google API Utilities for Colude AI
 */

export const fetchRecentEmails = async (token) => {
    try {
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!data.messages) return [];

        const emails = await Promise.all(data.messages.map(async (msg) => {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const detail = await detailRes.json();

            const subject = detail.payload.headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
            const from = detail.payload.headers.find(h => h.name === 'From')?.value || '(Unknown Sender)';

            // Basic body extraction (plain text)
            let body = "";
            if (detail.payload.parts) {
                const part = detail.payload.parts.find(p => p.mimeType === 'text/plain');
                if (part && part.body.data) {
                    body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                }
            } else if (detail.payload.body.data) {
                body = atob(detail.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }

            return { id: msg.id, from, subject, body, snippet: detail.snippet };
        }));

        return emails;
    } catch (error) {
        console.error("Gmail API Error:", error);
        throw error;
    }
};

export const createCalendarEvent = async (token, eventData) => {
    try {
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                summary: eventData.title,
                description: eventData.description,
                start: { dateTime: eventData.start, timeZone: 'UTC' },
                end: { dateTime: eventData.end, timeZone: 'UTC' },
                attendees: eventData.attendees || []
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Calendar API Error:", error);
        throw error;
    }
};
