import mongoose from "mongoose";

const MONGODB_URI =
  process.env.DATABASE_URL ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/tecra_it";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<{
  isConnected: boolean;
  error?: string;
}> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return { isConnected: true };
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => m)
      .catch((err) => {
        cached.promise = null;
        console.warn(
          "[MongoDB] Connection skipped or failed, using local resilient fallback data:",
          err?.message || err
        );
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return { isConnected: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database connection failed";
    return { isConnected: false, error: message };
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
