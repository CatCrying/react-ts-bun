import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

// Module-level cache: survives across invocations on a warm Lambda
// container, so we don't reopen a new connection on every request.
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, { maxPoolSize: 5 });
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db();
  return cachedDb;
}
