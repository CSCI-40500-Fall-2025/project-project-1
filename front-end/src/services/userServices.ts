const API_URL = "http://localhost:3000/api"

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

export async function loginUser(email: string, password: string) {
    const credentials = {
        email: email,
        password: password
    };

    const res = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include" // include cookies in the request
    });

    const data = await res.json();

    if (!res.ok) {
        throw data //new Error(data);
    }

    return data
}

export async function getUser(){ //for testing
    const res = await fetch(`${API_URL}/user`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}