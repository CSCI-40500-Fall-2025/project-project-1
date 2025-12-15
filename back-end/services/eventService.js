import { sql } from "../db/neon.js";
import { pool } from "../db/pgPool.js";

export async function getAllEvents() {
  const query = `SELECT * FROM events`;
  const rows = await sql.query(query);
  return rows;
}
export async function getEventById(event_id) {
  const query = `
    SELECT * FROM events
    WHERE event_id = $1
  `;
  const rows = await sql.query(query, [event_id]);
  return rows[0] || null;
}

export async function getAllEventsForUser(user_id) {
  const query = `
  SELECT DISTINCT e.*
  FROM events e
  LEFT JOIN event_participants ep
    ON e.event_id = ep.event_id
  WHERE e.event_host = $1
    OR ep.user_id = $1`;
  try {
    const rows = await sql.query(query, [user_id]);
    return rows || null;
  } catch (err) {
    console.error("Error fetching events for user:", err);
    throw err;
  }
}

export async function getAllEventsForGroup(group_id) {
  try {
    const result = await sql`
      SELECT * FROM events
      WHERE group_id = ${group_id}
      ORDER BY event_datetime ASC
    `;
    return result || [];
  } catch (err) {
    console.error("Error fetching events for group:", err);
    throw err;
  }
}

export async function getEventParticipantsWithUsernames(eventIds) {
  try {
    if (!eventIds || eventIds.length === 0) {
      return {};
    }

    const result = await sql`
      SELECT
        ep.event_id,
        ep.user_id,
        u.username
      FROM event_participants ep
      INNER JOIN users u ON ep.user_id = u.id
      WHERE ep.event_id = ANY(${eventIds})
      ORDER BY ep.event_id, u.username
    `;

    // Group participants by event_id
    const participantsByEvent = {};
    result.forEach((row) => {
      if (!participantsByEvent[row.event_id]) {
        participantsByEvent[row.event_id] = [];
      }
      participantsByEvent[row.event_id].push({
        user_id: row.user_id,
        username: row.username,
      });
    });

    return participantsByEvent;
  } catch (err) {
    console.error("Error fetching event participants with usernames:", err);
    return {};
  }
}

export async function getAllMembersEventsForGroup(group_id) {
  try {
    // Get all events for all group members (hosted or participating)
    // Return events with username but without detailed event info
    // Exclude events that are already group events (group_id matches)
    const result = await sql`
      SELECT DISTINCT
        e.event_id,
        e.start_time,
        e.end_time,
        e.event_datetime,
        u.id as user_id,
        u.username
      FROM events e
      INNER JOIN event_participants ep ON e.event_id = ep.event_id
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN group_users gu ON u.id = gu.user_id
      WHERE gu.group_id = ${group_id}
        AND (e.group_id IS NULL OR e.group_id != ${group_id})

      UNION

      SELECT DISTINCT
        e.event_id,
        e.start_time,
        e.end_time,
        e.event_datetime,
        u.id as user_id,
        u.username
      FROM events e
      INNER JOIN users u ON e.event_host = u.id
      INNER JOIN group_users gu ON u.id = gu.user_id
      WHERE gu.group_id = ${group_id}
        AND (e.group_id IS NULL OR e.group_id != ${group_id})

      ORDER BY start_time ASC
    `;
    return result || [];
  } catch (err) {
    console.error("Error fetching members events for group:", err);
    throw err;
  }
}

export async function getEventAndParticipantsById(event_id) {
  const query = `
    SELECT
      e.*,
      COALESCE(
        json_agg(
          json_build_object(
            'participant_id', p.participant_id,
            'user_id', p.user_id
          )
        ) FILTER (WHERE p.event_id IS NOT NULL),
        '[]'
      ) AS participants
    FROM
      events e
    LEFT JOIN
      event_participants p ON e.event_id = p.event_id
    WHERE
      e.event_id = $1
    GROUP BY
      e.event_id;
  `;

  const result = await sql.query(query, [event_id]);
  const event = result[0];

  return event || null;
}

export async function createEventAndEventParticipants(eventData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const eventResult = await client.query(
      `INSERT INTO events
      (group_id, event_title, event_description, event_datetime, location, event_host, attendees, start_time, end_time, rrule)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;`,
      [
        eventData.group_id,
        eventData.event_title,
        eventData.event_description,
        eventData.event_datetime,
        eventData.location,
        eventData.event_host,
        eventData.attendees,
        eventData.start_time,
        eventData.end_time,
        eventData.rrule,
      ]
    );

    const event = eventResult.rows[0];

    await client.query(
      `INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2)`,
      [event.event_id, eventData.event_host]
    );

    await client.query("COMMIT");

    return event;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function createEvent({
  group_id,
  event_title,
  event_description,
  event_datetime,
  location,
  event_host,
  attendees,
  start_time,
  end_time,
  rrule,
}) {
  const query = `
    INSERT INTO events
      (group_id, event_title, event_description, event_datetime, location, event_host, attendees, start_time, end_time, rrule)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
    start_time,
    end_time,
    rrule,
  ];

  const rows = await sql.query(query, values);
  return rows[0];
}

export async function deleteEvent(event_id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`DELETE FROM event_participants WHERE event_id = $1`, [
      event_id,
    ]);

    const result = await client.query(
      `DELETE FROM events WHERE event_id = $1 RETURNING *`,
      [event_id]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateEvent(event_id, updateData) {
  const allowedFields = [
    "event_title",
    "event_description",
    "event_datetime",
    "location",
    "event_host",
    "attendees",
    "start_time",
    "end_time",
    "rrule",
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

export async function increaseAttendees(event_id, attendeeCount) {
  const query = `
      UPDATE events
      SET attendees = COALESCE(attendees, 0) + $1
      WHERE event_id = $2
      RETURNING *;
    `;
  const rows = await sql.query(query, [attendeeCount, event_id]);

  return rows[0] || null;
}
