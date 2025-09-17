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
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config(); 

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
    // console.log(result[0]);
    res.status(201).json(result[0]);
  } catch (err) {
    console.log("Error creating user: ", err.message);
    if (err.code === '23505') { // duplicate key value violates unique constraint "users_email_key"
      res.status(400).json({ error: "Email already in use" });
    }
    else res.status(500).json({ error: `Failed to create user: ${err.message}` });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const query = `
      SELECT id, username, email, password
      FROM users
      WHERE email = $1
    `
    const values = [email];
    const result = await sql.query(query, values);
    if (result.length === 0) {
      console.log("Invalid email");
      return res.status(400).json({ error: "Invalid email or password" }); //invalid email
    }
    const user = result[0];
    // console.log(user)
    if (!await bcrypt.compare(password, user.password)) {
      console.log("Invalid password");
      return res.status(400).json({ error: "Invalid email or password" }); //invalid password
    }

    //jwt token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // if true, needs to be https. Set to false for local testing (http)
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.json({ message: "Login successful", id: user.id, username: user.username, email: user.email });
  } catch (err) {
    console.log("Error logging in user: ", err.message);
  }
}

export async function logoutUser(req, res) {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0), // expire immediately
  });
  res.json({ message: "Logged out successfully" });
}