import { sql } from "../db/neon.js";

export async function createCalendarEvent(req, res) {
    try {
        const user_id = req.user.id;
        const calendar_data = req.body;
        if (!user_id || !calendar_data) {
            return res.status(400).json({ error: "user_id and calendar required" });
        }

        const query = `
            INSERT INTO user_calendars (user_id, calendar_data)
            VALUES ($1, $2)
            ON CONFLICT (user_id)
            DO UPDATE SET
                calendar_data = EXCLUDED.calendar_data,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const values = [user_id, JSON.stringify(calendar_data)];
        const result = await sql.query(query, values);
        res.status(200).json(result[0].calendar_data);
    } catch (err) {
        res.status(500).json({ error: `Failed to upsert calendar: ${err.message}` });
    }
}

export async function getUserEvents(req, res) {
    try{
        const user_id = req.user.id;
        if (!user_id){
            return res.status(400).json({ error: "user_id required" });
        }
        const query = `
            SELECT * FROM events
            WHERE event_host = $1;
        `
        const values = [user_id];
        const result = await sql.query(query, values);

        if (result.length === 0) {
            res.status(404).json({ error: "No events found for this user" });
        }
        res.status(200).json(result[0].calendar_data);
    } catch (err){
        res.status(500).json({ error: `Failed to get calendar: ${err.message}` });
    }
}