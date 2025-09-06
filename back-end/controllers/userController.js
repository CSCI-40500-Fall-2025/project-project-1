import { db } from "../services/firebase.js";
import { doc, setDoc, getDoc, addDoc, collection } from "firebase/firestore";

export const createUser = async (req, res) => {
  const { id, email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "Email, username and password are required" });
  }

  try {
    let docRef;
    if (id){
        docRef = await setDoc(doc(db, "users", id), { email, username, password });
        return res.json({ message: `User ${username} created`, id })
    }else{
        docRef = await addDoc(collection(db, "users"), { email, username, password });
        return res.json({ message: `User ${username} created`, id: docRef.id });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};