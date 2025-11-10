import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});
