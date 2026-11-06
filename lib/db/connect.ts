import mongoose from 'mongoose'

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }

const globalForMongoose = globalThis as unknown as { __mongoose?: Cached }
const cached: Cached = globalForMongoose.__mongoose ?? { conn: null, promise: null }
globalForMongoose.__mongoose = cached

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn
  const uri = process.env.MONGODB_URI
  if (!uri)
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.')

  if (!cached.promise) {
    mongoose.set('strictQuery', true)
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    })
  }
  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    throw error
  }
  return cached.conn
}

let transactionsSupported: boolean | null = null

/**
 * Runs `work` inside a MongoDB transaction when the deployment supports it
 * (replica sets / Atlas). Standalone servers (common for local development)
 * do not support transactions, so we fall back to running without one.
 */
export async function withTransaction<T>(
  work: (session: mongoose.ClientSession | undefined) => Promise<T>,
): Promise<T> {
  const conn = await connectDB()
  if (transactionsSupported === null) {
    try {
      const hello = await conn.connection.db!.admin().command({ hello: 1 })
      transactionsSupported = Boolean(hello.setName || hello.msg === 'isdbgrid')
    } catch {
      transactionsSupported = false
    }
  }
  if (!transactionsSupported) return work(undefined)

  const session = await conn.startSession()
  try {
    let result!: T
    await session.withTransaction(async () => {
      result = await work(session)
    })
    return result
  } finally {
    await session.endSession()
  }
}
