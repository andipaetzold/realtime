import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { config } from "./config.js";

export async function readData(): Promise<any> {
  try {
    const rawData = await readFile(config.dataFile, { encoding: "utf-8" });
    const parsedData = JSON.parse(rawData);
    console.log(`[Server] Data read (${Math.round(rawData.length / 1024)} kB)`);
    return parsedData;
  } catch (error) {
    console.error("[Server] Error reading data", error);
    return {};
  }
}

export async function saveData(data: any): Promise<void> {
  const dataJSON = JSON.stringify(data);
  try {
    await mkdir(dirname(config.dataFile), { recursive: true });
    await writeFile(config.dataFile, dataJSON, { encoding: "utf-8" });

    console.log(`[Server] Data saved (${Math.round(dataJSON.length / 1024)} kB)`);
  } catch (error) {
    console.error("[Server] Error saving data", error);
  }
}