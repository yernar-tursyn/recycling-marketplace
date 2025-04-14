export interface AdminLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
}

const ADMIN_LOGS_KEY = "eco_market_admin_logs";

const getAdminLogs = (): AdminLogEntry[] => {
  const logs = localStorage.getItem(ADMIN_LOGS_KEY);
  return logs ? JSON.parse(logs) : [];
};

const saveAdminLogs = (logs: AdminLogEntry[]) => {
  localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(logs));
};

export const addAdminLog = async (
  logData: Omit<AdminLogEntry, "id" | "timestamp">
) => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const logs = getAdminLogs();

  const newLog: AdminLogEntry = {
    ...logData,
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  saveAdminLogs([newLog, ...logs]);

  return newLog;
};

export const getAdminLogsHistory = async (limit = 100) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const logs = getAdminLogs();
  return logs.slice(0, limit);
};

export const getUserAdminLogs = async (userId: string, limit = 50) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const logs = getAdminLogs();
  return logs.filter((log) => log.userId === userId).slice(0, limit);
};

export const clearAdminLogs = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  saveAdminLogs([]);

  return { success: true };
};
