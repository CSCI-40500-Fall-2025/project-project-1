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

export async function getUsers(req, res) {
  try {
    const users = await sql`SELECT * FROM users`;
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function createUser(req, res) {
  try {
    const { id, email, username, password} = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: "Username, email and password required" });
    }
    const user = await sql`
      INSERT INTO users (email, username, password) 
      VALUES (${email}, ${username}, ${password}) 
      RETURNING *
    `;
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
}