const API_URL = "http://localhost:3000"

export async function createTestUser() {
    const testUser = {
        id: '1', // auto generated so this isnt rlly used
        email: "bingbong@example.com",
        username: "binging",
        password: "bonging123"
    };

    const res = await fetch(`${API_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
    });

    if (!res.ok) throw new Error("Failed to create test user");

    return res.json();
}
