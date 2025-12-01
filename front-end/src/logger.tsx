import log from "loglevel";

log.setLevel("trace");

const LOG_KEY = "app_logs";

export const logAction = (
  level: "error" | "warn" | "info" | "debug" | "trace",
  action: string,
  details?: string
) => {
  const time = new Date().toISOString();
  const message = `[${time}] [${level.toUpperCase()}] ${action}${
    details ? `: ${details}` : ""
  }`;

  // Normal console/loglevel output
  log[level](message);

  // Save to localStorage
  const oldLogs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  oldLogs.push(message);
  localStorage.setItem(LOG_KEY, JSON.stringify(oldLogs));
};

export const getLogs = () => {
  return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
};

export const clearLogs = () => {
  localStorage.setItem(LOG_KEY, "[]");
};


export default {
  logAction,
  getLogs,
  clearLogs,
};