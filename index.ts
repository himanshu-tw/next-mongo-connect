import mongoose from "mongoose"

type Cached = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseCache: Cached
}

const cached: Cached = global.mongooseCache || {
  conn: null,
  promise: null,
}

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function db(uri?: string) {
  const MONGO_URI = uri || process.env.MONGO_URI

  if (!MONGO_URI) {
    throw new Error("❌ Missing MONGO_URI in environment")
  }

  if (cached.conn) {
    if (process.env.NODE_ENV === "development") {
      console.log("⚡ Using cached Mongo connection")
    }
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    })
  }

  try {
    cached.conn = await cached.promise

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Mongo connected")
    }

    return cached.conn
  } catch (error) {
    cached.promise = null
    throw new Error("❌ Mongo connection failed")
  }
}
