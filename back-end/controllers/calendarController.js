import { sql } from "../services/neon.js";
import dotenv from "dotenv";

dotenv.config();

export async function upsertCalendar(req, res) {
    try {
        const { user_id, calendar_data } = req.body;
        console.log(user_id, calendar_data );
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

        res.status(200).json(result[0]);
    } catch (err) {
        res.status(500).json({ error: `Failed to upsert calendar: ${err.message}` });
    }
}

export async function getCalendar(req, res) {
    try{
        const {user_id} = req.body;
        if (!user_id){
            return res.status(400).json({ error: "user_id required" });
        }
        const query = `
            SELECT calendar_data FROM user_calendars
            WHERE user_id = $1;
        `
        const values = [user_id];
        const result = await sql.query(query, values);
        if (result.length === 0) {
            res.status(404).json({ error: "No calendars found for this user" });
        }
        res.status(200).json(result[0]);
    } catch (err){
        res.status(500).json({ error: `Failed to get calendar: ${err.message}` });
    }
}