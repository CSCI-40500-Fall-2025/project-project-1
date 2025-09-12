const API_URL = "http://localhost:3000"

export async function createUser(email: string, username: string, password: string) {
    const user = {
        email: email,
        username: username,
        password: password
    };

    const res = await fetch(`${API_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });

    const data = await res.json();
    if (!res.ok) {
        throw data //new Error(data);
    }

    return data
}



export async function getUser(){
    const res = await fetch(`${API_URL}/user`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}