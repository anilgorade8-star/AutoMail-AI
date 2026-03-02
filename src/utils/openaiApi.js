/**
 * OpenAI API Utilities for Colude AI
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const detectMeeting = async (emailBody) => {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
        console.warn("OpenAI API Key not set. Returning mock detection.");
        return { isMeeting: false };
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an assistant that detects if an email is a request for a meeting or call. Respond ONLY in JSON format: { \"isMeeting\": boolean, \"title\": string, \"date\": string (YYYY-MM-DD), \"time\": string (HH:MM), \"confidence\": number (0-1), \"description\": string }."
                    },
                    {
                        role: "user",
                        content: `Analyze this email body for a meeting request: \n\n ${emailBody}`
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return { isMeeting: false, error: error.message };
    }
};
