import { sql } from "./neon.js";

export async function getAllEvents() {
  const query = `SELECT * FROM events`;
  const { rows } = await sql.query(query);
  return rows;
}

export async function createEvent({
  group_id,
  event_title,
  event_description,
  event_datetime,
  location,
  event_host,
  attendees,
}) {
  const query = `
    INSERT INTO events
      (group_id, event_title, event_description, event_datetime, location, event_host, attendees)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    group_id,
    event_title,
    event_description,
    event_datetime,
    location,
    event_host,
    attendees,
  ];

  const { rows } = await sql.query(query, values);
  return rows[0];
}

export async function deleteEvent(event_id) {
  const query = `
    DELETE FROM events
    WHERE event_id = $1
  `;
  await sql.query(query, [event_id]);
}

export async function getEventById(event_id) {
  const query = `
    SELECT * FROM events
    WHERE event_id = $1
  `;
  const { rows } = await sql.query(query, [event_id]);
  return rows[0] || null;
}

export async function updateEvent(event_id, updateData) {
  const allowedFields = [
    "event_title",
    "event_description",
    "event_datetime",
    "location",
    "event_host",
    "attendees",
  ];

  const keys = Object.keys(updateData).filter(
    (key) => allowedFields.includes(key) && updateData[key] !== undefined
  );

  if (keys.length === 0) return null;

  const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
  const values = keys.map((key) => updateData[key]);
  values.push(event_id);

  const query = `
    UPDATE events
    SET ${setClause}
    WHERE event_id = $${values.length}
    RETURNING *;
  `;

  try {
    const rows = await sql.query(query, values);
    return rows[0] || null;
  } catch (err) {
    console.error("Error updating event:", err);
    throw err;
  }
}

// Update only the attendees count
export async function updateAttendees(event_id, newAttendeeCount) {
  const query = `
    UPDATE events
    SET attendees = $1
    WHERE event_id = $2
    RETURNING *;
  `;
  const { rows } = await sql.query(query, [newAttendeeCount, event_id]);
  return rows[0] || null;
}
