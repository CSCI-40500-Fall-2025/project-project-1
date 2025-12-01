"use client";
import { useState } from "react";
import { getLogs, logAction } from "./logger";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function LogViewer() {
    const [password, setPassword] = useState("");
    const [authorized, setAuthorized] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const correctPassword = "1234"; // change this

    const handleLogin = () => {
        if (password === correctPassword) {
            logAction('warn','log access', 'granted')
            setAuthorized(true);
            setLogs(getLogs());
        } else {
            alert("Wrong password!");
            logAction('warn','log access', 'denied')
        }
    };

    if (!authorized) {
        return (
            <div style={{ padding: 20 }}>
                <h2>Log Viewer</h2>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: 8 }}
                />
                <button onClick={handleLogin} style={{ padding: 8, marginLeft: 8 }}>
                    Unlock
                </button>
            </div>
        );
    }

    const stats = {
        error: logs.filter((l) => l.includes("[ERROR]")).length,
        warn: logs.filter((l) => l.includes("[WARN]")).length,
        info: logs.filter((l) => l.includes("[INFO]")).length,
        debug: logs.filter((l) => l.includes("[DEBUG]")).length,
        trace: logs.filter((l) => l.includes("[TRACE]")).length,
    };

    const chartData = Object.keys(stats).map((key) => ({
        level: key,
        count: (stats as any)[key],
    }));

    return (
        <div style={{ padding: 20 }}>
            <h2>Log Dashboard</h2>

            <h3>Log Statistics</h3>
            <LineChart width={600} height={300} data={chartData}>
                <CartesianGrid />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="blue" />
            </LineChart>

            <h3>Logs</h3>
            <div
                style={{
                    background: "#111",
                    color: "white",
                    padding: 12,
                    height: 300,
                    overflowY: "scroll",
                    borderRadius: 8,
                }}
            >
                {logs.map((log, i) => (
                    <pre key={i} style={{ margin: 0 }}>
                        {log}
                    </pre>
                ))}
            </div>
        </div>
    );
}
