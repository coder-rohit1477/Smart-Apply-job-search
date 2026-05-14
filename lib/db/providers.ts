import { MongoClient } from "mongodb";
import { Client as PostgresClient } from "pg";

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function connectPostgres() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }

  const client = new PostgresClient({ connectionString });
  await client.connect();
  return client;
}

export async function getDatabaseInfo() {
  const provider = process.env.DB_PROVIDER || "memory";
  return {
    provider,
    mongoConfigured: Boolean(process.env.MONGODB_URI),
    postgresConfigured: Boolean(process.env.POSTGRES_URL),
  };
}
