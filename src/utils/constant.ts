import * as dotenv from "dotenv";
import { dbType } from "./types";
import { DataSourceOptions } from "typeorm";

dotenv.config();
const ENV = process.env;
export const PORT = ENV.PORT || 5001;

export const TOKEN_SECRET = ENV.TOKEN_SECRET || "PMS_TOKEN";
export const REFRESH_TOKEN_SECRET =
  ENV.REFRESH_TOKEN_SECRET || "PMS_REFRESH_TOKEN";

export const tokenSecretExpire = "10d";
export const refreshTokenSecretExpire = "30d";

let configDB = {
  type: ENV.DB_TYPE,
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
};

if (ENV.USE_DB === "LOCAL") {
  configDB = {
    type: ENV.LOCAL_DB_TYPE,
    host: ENV.LOCAL_DB_HOST,
    port: ENV.LOCAL_DB_PORT,
    username: ENV.LOCAL_DB_USERNAME,
    password: ENV.LOCAL_DB_PASSWORD,
    database: ENV.LOCAL_DB_NAME,
  };
} else if (ENV.USE_DB === "REMOTE") {
  configDB = {
    type: ENV.REMOTE_DB_TYPE,
    host: ENV.REMOTE_DB_HOST,
    port: ENV.REMOTE_DB_PORT,
    username: ENV.REMOTE_DB_USERNAME,
    password: ENV.REMOTE_DB_PASSWORD,
    database: ENV.REMOTE_DB_NAME,
  };
}
export const config: DataSourceOptions = {
  type: configDB.type as dbType,
  host: configDB.host as string,
  port: +(configDB.port as string),
  username: configDB.username,
  password: configDB.password,
  database: configDB.database,
  entities: [],
  synchronize: ENV.SYNC_DB === "true",
  logging: ENV.LOGENABLE === "true",
};

export const getLocalIpAddress = () => {
  const { networkInterfaces } = require("os");

  const nets = networkInterfaces();
  let ip = "localhost";
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
      if (net.family === familyV4Value && !net.internal) {
        results.push(net);
      }
    }
  }

  ip = results.length ? results[0].address : ip;
  return `http://${ip}:${PORT}`;
};
export const SERVER_URL = `http://localhost:${PORT}/`;
