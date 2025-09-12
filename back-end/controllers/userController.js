// // Remove later if not using firebase
// import { db } from "../services/firebase.js";
// import { doc, setDoc, getDoc, addDoc, collection } from "firebase/firestore";

// export const createUser = async (req, res) => {
//   const { id, email, username, password } = req.body;

//   if (!email || !username || !password) {
//     return res.status(400).json({ error: "Email, username and password are required" });
//   }

//   try {
//     let docRef;
//     if (id){
//         docRef = await setDoc(doc(db, "users", id), { email, username, password });
//         return res.json({ message: `User ${username} created`, id })
//     }else{
//         docRef = await addDoc(collection(db, "users"), { email, username, password });
//         return res.json({ message: `User ${username} created`, id: docRef.id });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

import { sql } from "../services/neon.js";
import bcrypt from "bcrypt";

export async function getUsers(req, res) {
  try {
    const users = await sql`SELECT username FROM users`;
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function createUser(req, res) {
  try {
    const { email, username, password } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: "Username, email and password required" });
    }

    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (email, username, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email
    `
    const values = [email, username, hashedPassword];
    const result = await sql.query(query, values);
    console.log(result[0]);
    res.status(201).json(result[0]);
  } catch (err) {
    console.log("Error creating user: ", err.message);
    if (err.code === '23505') { // duplicate key value violates unique constraint "users_email_key"
      res.status(400).json({ error: "Email already in use" });
    }
    else res.status(500).json({ error: `Failed to create user: ${err.message}` });
  }
}