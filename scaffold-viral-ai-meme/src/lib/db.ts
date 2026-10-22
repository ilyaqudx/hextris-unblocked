import { MongoClient, Db } from 'mongodb';
import { Pool } from 'pg';
import { put, list } from '@vercel/blob';

function hasBlobStorage(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export interface UserEventRecord {
  eventName: string;
  eventType: 'view' | 'click' | 'interaction' | 'conversion';
  visitorId?: string;
  sessionId?: string;
  url?: string;
  path?: string;
  referrer?: string;
  ip?: string;
  country?: string;
  region?: string;
  city?: string;
  userAgent?: string;
  deviceType?: string;
  buttonText?: string;
  elementId?: string;
  payload?: Record<string, any>;
  clientTime?: string;
  createdAt?: Date;
}

// Global cached connections for Serverless functions
let cachedMongoClient: MongoClient | null = null;
let cachedMongoDb: Db | null = null;
let cachedPgPool: Pool | null = null;
let pgTableInitialized = false;

/**
 * Connect to MongoDB if MONGODB_URI is provided
 */
async function getMongoDb(): Promise<Db | null> {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUri) return null;

  try {
    if (!cachedMongoClient) {
      cachedMongoClient = new MongoClient(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 4000,
      });
      await cachedMongoClient.connect();
    }
    if (!cachedMongoDb) {
      const dbName = process.env.MONGODB_DB_NAME || 'hittheroaddude';
      cachedMongoDb = cachedMongoClient.db(dbName);
    }
    return cachedMongoDb;
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error);
    return null;
  }
}

/**
 * Connect to PostgreSQL / Supabase if POSTGRES_URL is provided
 */
function getPgPool(): Pool | null {
  const pgUrl = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
  if (!pgUrl) return null;

  try {
    if (!cachedPgPool) {
      // Strip sslmode parameter from connection string because pg-connection-string
      // overrides ssl: { rejectUnauthorized: false } with an empty object if sslmode is present,
      // causing SELF_SIGNED_CERT_IN_CHAIN errors on Supabase.
      let cleanUrl = pgUrl;
      try {
        const u = new URL(pgUrl);
        u.searchParams.delete('sslmode');
        u.searchParams.delete('ssl');
        cleanUrl = u.toString();
      } catch {
        cleanUrl = pgUrl.replace(/([?&])sslmode=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');
      }

      cachedPgPool = new Pool({
        connectionString: cleanUrl,
        ssl: { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 5000,
      });
    }
    return cachedPgPool;
  } catch (error) {
    console.error('[DB] PostgreSQL pool error:', error);
    return null;
  }
}

/**
 * Ensure PostgreSQL user_events table exists
 */
async function ensurePgTable(pool: Pool) {
  if (pgTableInitialized) return;
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_events (
      id SERIAL PRIMARY KEY,
      event_name VARCHAR(100) NOT NULL,
      event_type VARCHAR(50) NOT NULL,
      visitor_id VARCHAR(100),
      session_id VARCHAR(100),
      url TEXT,
      path TEXT,
      referrer TEXT,
      ip VARCHAR(100),
      country VARCHAR(50),
      region VARCHAR(50),
      city VARCHAR(50),
      user_agent TEXT,
      device_type VARCHAR(50),
      button_text VARCHAR(200),
      element_id VARCHAR(100),
      payload JSONB,
      client_time TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_user_events_name ON user_events(event_name);
    CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at);

    CREATE TABLE IF NOT EXISTS waitlist_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      source VARCHAR(100),
      reserved_pack VARCHAR(100),
      ip VARCHAR(100),
      country VARCHAR(50),
      city VARCHAR(50),
      user_agent TEXT,
      referrer TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_subscribers(email);
    CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist_subscribers(created_at);
  `;
  try {
    await pool.query(createTableQuery);
    pgTableInitialized = true;
  } catch (err) {
    console.error('[DB] Failed to initialize PostgreSQL tables:', err);
  }
}

/**
 * Main Save Method: writes to Vercel Blob, MongoDB and/or PostgreSQL
 */
export async function saveUserEvent(event: UserEventRecord): Promise<{ success: boolean; mongo?: boolean; postgres?: boolean; blob?: boolean; error?: string }> {
  let savedToMongo = false;
  let savedToPg = false;
  let savedToBlob = false;
  const createdAt = new Date();

  // 1. Try Vercel Blob (native, zero-maintenance serverless store)
  try {
    if (hasBlobStorage()) {
      const eventId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const payloadString = JSON.stringify({ ...event, createdAt: createdAt.toISOString() });
      await put(`events/${eventId}.json`, payloadString, {
        access: 'private',
        contentType: 'application/json',
      });
      savedToBlob = true;
    }
  } catch (err) {
    console.error('[DB] Failed writing to Vercel Blob:', err);
  }

  // 2. Try MongoDB
  try {
    const mongoDb = await getMongoDb();
    if (mongoDb) {
      const collection = mongoDb.collection('user_events');
      await collection.insertOne({
        ...event,
        createdAt,
      });
      savedToMongo = true;
    }
  } catch (err) {
    console.error('[DB] Failed writing to MongoDB:', err);
  }

  // 3. Try PostgreSQL / Supabase
  try {
    const pool = getPgPool();
    if (pool) {
      await ensurePgTable(pool);
      const insertQuery = `
        INSERT INTO user_events (
          event_name, event_type, visitor_id, session_id,
          url, path, referrer, ip, country, region, city,
          user_agent, device_type, button_text, element_id,
          payload, client_time, created_at
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15,
          $16, $17, $18
        )
      `;
      const values = [
        event.eventName,
        event.eventType,
        event.visitorId || null,
        event.sessionId || null,
        event.url || null,
        event.path || null,
        event.referrer || null,
        event.ip || null,
        event.country || null,
        event.region || null,
        event.city || null,
        event.userAgent || null,
        event.deviceType || null,
        event.buttonText || null,
        event.elementId || null,
        event.payload ? JSON.stringify(event.payload) : null,
        event.clientTime ? new Date(event.clientTime) : createdAt,
        createdAt,
      ];
      await pool.query(insertQuery, values);
      savedToPg = true;
    }
  } catch (err) {
    console.error('[DB] Failed writing to PostgreSQL:', err);
  }

  // Fallback logging if no DB connected yet
  if (!savedToMongo && !savedToPg && !savedToBlob) {
    console.log('[TRACKER LOG BUFFER]', JSON.stringify({ ...event, createdAt }));
  }

  return {
    success: true,
    mongo: savedToMongo,
    postgres: savedToPg,
    blob: savedToBlob,
  };
}

/**
 * Query recent events for dashboard / verification
 */
export async function getRecentUserEvents(limit = 50) {
  // 1. Try Vercel Blob
  try {
    if (hasBlobStorage()) {
      const { blobs } = await list({ prefix: 'events/', limit: Math.min(limit * 2, 100) });
      if (blobs && blobs.length > 0) {
        const sorted = blobs
          .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
          .slice(0, limit);

        const token = process.env.BLOB_READ_WRITE_TOKEN;
        const events = await Promise.all(
          sorted.map(async (blob) => {
            try {
              const res = await fetch(blob.downloadUrl || blob.url, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              if (!res.ok) return null;
              return await res.json();
            } catch {
              return null;
            }
          })
        );
        const validEvents = events.filter(Boolean);
        return { source: 'vercel_blob', count: validEvents.length, events: validEvents };
      }
    }
  } catch (err) {
    console.error('[DB] Failed querying Vercel Blob:', err);
  }

  // 2. Try MongoDB
  try {
    const mongoDb = await getMongoDb();
    if (mongoDb) {
      const collection = mongoDb.collection('user_events');
      const docs = await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
      return { source: 'mongodb', count: docs.length, events: docs };
    }
  } catch (err) {
    console.error('[DB] Failed querying MongoDB:', err);
  }

  // 3. Try PostgreSQL
  try {
    const pool = getPgPool();
    if (pool) {
      await ensurePgTable(pool);
      const res = await pool.query('SELECT * FROM user_events ORDER BY created_at DESC LIMIT $1', [limit]);
      return { source: 'postgresql', count: res.rows.length, events: res.rows };
    }
  } catch (err) {
    console.error('[DB] Failed querying PostgreSQL:', err);
  }

  return { source: 'none', count: 0, events: [] };
}

export interface WaitlistSubscriberRecord {
  email: string;
  source?: string;
  reservedPack?: string;
  ip?: string;
  country?: string;
  city?: string;
  userAgent?: string;
  referrer?: string;
  createdAt?: Date;
}

/**
 * Save email subscriber to Vercel Blob, MongoDB and/or PostgreSQL
 */
export async function saveWaitlistSubscriber(subscriber: WaitlistSubscriberRecord): Promise<{ success: boolean; mongo?: boolean; postgres?: boolean; blob?: boolean; error?: string }> {
  let savedToMongo = false;
  let savedToPg = false;
  let savedToBlob = false;
  const normalizedEmail = subscriber.email.toLowerCase().trim();
  const createdAt = new Date();

  // 1. Try Vercel Blob
  try {
    if (hasBlobStorage()) {
      const key = `waitlist/${encodeURIComponent(normalizedEmail)}.json`;
      const record = { ...subscriber, email: normalizedEmail, createdAt: createdAt.toISOString() };
      await put(key, JSON.stringify(record), {
        access: 'private',
        contentType: 'application/json',
      });
      savedToBlob = true;
    }
  } catch (err) {
    console.error('[DB] Failed saving waitlist to Vercel Blob:', err);
  }

  // 2. Try MongoDB
  try {
    const mongoDb = await getMongoDb();
    if (mongoDb) {
      const collection = mongoDb.collection('waitlist_subscribers');
      await collection.updateOne(
        { email: normalizedEmail },
        {
          $setOnInsert: {
            ...subscriber,
            email: normalizedEmail,
            createdAt,
          },
          $set: {
            lastSeenAt: createdAt,
            source: subscriber.source || 'web_waitlist',
            reservedPack: subscriber.reservedPack || null,
          },
        },
        { upsert: true }
      );
      savedToMongo = true;
    }
  } catch (err) {
    console.error('[DB] Failed saving waitlist to MongoDB:', err);
  }

  // 3. Try PostgreSQL
  try {
    const pool = getPgPool();
    if (pool) {
      await ensurePgTable(pool);
      const query = `
        INSERT INTO waitlist_subscribers (
          email, source, reserved_pack, ip, country, city, user_agent, referrer, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        ON CONFLICT (email) DO UPDATE SET
          reserved_pack = COALESCE(EXCLUDED.reserved_pack, waitlist_subscribers.reserved_pack)
      `;
      const values = [
        normalizedEmail,
        subscriber.source || 'web_waitlist',
        subscriber.reservedPack || null,
        subscriber.ip || null,
        subscriber.country || null,
        subscriber.city || null,
        subscriber.userAgent || null,
        subscriber.referrer || null,
        createdAt,
      ];
      await pool.query(query, values);
      savedToPg = true;
    }
  } catch (err) {
    console.error('[DB] Failed saving waitlist to PostgreSQL:', err);
  }

  if (!savedToMongo && !savedToPg && !savedToBlob) {
    console.log('[WAITLIST LOG BUFFER]', JSON.stringify({ ...subscriber, email: normalizedEmail, createdAt }));
  }

  return {
    success: true,
    mongo: savedToMongo,
    postgres: savedToPg,
    blob: savedToBlob,
  };
}

/**
 * Get total waitlist subscriber count
 */
export async function getWaitlistCount(): Promise<number> {
  // 1. Try Vercel Blob
  try {
    if (hasBlobStorage()) {
      const { blobs } = await list({ prefix: 'waitlist/' });
      if (blobs && blobs.length > 0) {
        return blobs.length;
      }
    }
  } catch {}

  // 2. Try MongoDB
  try {
    const mongoDb = await getMongoDb();
    if (mongoDb) {
      return await mongoDb.collection('waitlist_subscribers').countDocuments();
    }
  } catch {}

  // 3. Try PostgreSQL
  try {
    const pool = getPgPool();
    if (pool) {
      await ensurePgTable(pool);
      const res = await pool.query('SELECT COUNT(*) FROM waitlist_subscribers');
      return parseInt(res.rows[0].count, 10) || 0;
    }
  } catch {}

  return 0;
}

/**
 * Get all waitlist subscribers with emails and metadata
 */
export async function getWaitlistSubscribers(limit = 100): Promise<WaitlistSubscriberRecord[]> {
  // 1. Try Vercel Blob
  try {
    if (hasBlobStorage()) {
      const { blobs } = await list({ prefix: 'waitlist/', limit });
      if (blobs && blobs.length > 0) {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        const subscribers = await Promise.all(
          blobs.map(async (blob) => {
            try {
              const res = await fetch(blob.downloadUrl || blob.url, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              if (!res.ok) return null;
              return await res.json();
            } catch {
              return null;
            }
          })
        );
        return subscribers.filter(Boolean);
      }
    }
  } catch (err) {
    console.error('[DB] Failed querying waitlist subscribers from Blob:', err);
  }

  // 2. Try MongoDB
  try {
    const mongoDb = await getMongoDb();
    if (mongoDb) {
      const docs = await mongoDb.collection('waitlist_subscribers').find({}).sort({ createdAt: -1 }).limit(limit).toArray();
      return docs.map(d => ({
        email: d.email,
        source: d.source,
        reservedPack: d.reservedPack,
        ip: d.ip,
        country: d.country,
        city: d.city,
        createdAt: d.createdAt,
      }));
    }
  } catch {}

  // 3. Try PostgreSQL
  try {
    const pool = getPgPool();
    if (pool) {
      await ensurePgTable(pool);
      const res = await pool.query('SELECT * FROM waitlist_subscribers ORDER BY created_at DESC LIMIT $1', [limit]);
      return res.rows.map(r => ({
        email: r.email,
        source: r.source,
        reservedPack: r.reserved_pack,
        ip: r.ip,
        country: r.country,
        city: r.city,
        createdAt: r.created_at,
      }));
    }
  } catch {}

  return [];
}

