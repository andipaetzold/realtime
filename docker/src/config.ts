import path from "node:path";

interface Config {
  port: number;
  dataFile: string;
  corsOrigin: string[];
  authToken: string | undefined;
  adminUI:
    | {
        username: string;
        password: string;
      }
    | undefined;
}

const port = +(process.env["PORT"] ?? "");
if (typeof port !== "number" || Number.isNaN(port)) {
  throw new Error("Invalid port");
}

const dataFile = path.resolve(
  process.env["REALTIME_DATA_DIR"] ?? "",
  "data.json"
);
const corsOrigin = process.env["REALTIME_CORS_ORIGIN"]?.split(",") ?? [];
const authToken = process.env["REALTIME_TOKEN"];

const adminUIUsername = process.env["REALTIME_ADMIN_UI_USERNAME"];
const adminUIPassword = process.env["REALTIME_ADMIN_UI_PASSWORD"];

export const config: Config = {
  port,
  dataFile,
  corsOrigin,
  authToken,
  adminUI:
    adminUIUsername && adminUIPassword
      ? { username: adminUIUsername, password: adminUIPassword }
      : undefined,
};
