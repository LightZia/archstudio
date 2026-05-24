import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

import fs from 'fs'
import path from 'path'

// Firebase Admin SDK configuration (server-side only)
// Uses LAZY initialization — only initializes when first accessed at runtime,
// NOT at module import time. This prevents build failures on Netlify/Vercel
// where the service account file doesn't exist during static page generation.

// Try loading service account from file first
const serviceAccountPath = path.join(process.cwd(), 'serviceaccountkey.json')

// Runtime check for whether Firebase Admin can be configured
function isFirebaseAdminConfigured(): boolean {
  return fs.existsSync(serviceAccountPath) || Boolean(
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT ||
    (process.env.FIREBASE_ADMIN_PROJECT_ID &&
     process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
     process.env.FIREBASE_ADMIN_PRIVATE_KEY)
  )
}

let _adminApp: App | null = null
let _adminAuth: Auth | null = null
let _adminDb: Firestore | null = null
let _initialized = false

/**
 * Clean a PEM private key string:
 * - Remove carriage returns (\r)
 * - Replace literal escaped newlines (\\n as two chars) with actual newlines
 * - Ensure the key starts and ends with proper PEM markers
 */
function cleanPrivateKey(key: string): string {
  // Remove all carriage returns
  let cleaned = key.replace(/\r/g, "")

  // If the key contains literal backslash-n (two chars), replace with actual newlines
  // This happens when env vars store the key with escaped newlines
  if (cleaned.includes("\\n")) {
    cleaned = cleaned.replace(/\\n/g, "\n")
  }

  return cleaned.trim()
}

function doInitialize(): boolean {
  if (_initialized) return _adminApp !== null
  _initialized = true

  const hasServiceAccountFile = fs.existsSync(serviceAccountPath)

  // Check configuration at RUNTIME (not module-load time)
  const isConfigured = hasServiceAccountFile || Boolean(
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT ||
    (process.env.FIREBASE_ADMIN_PROJECT_ID &&
     process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
     process.env.FIREBASE_ADMIN_PRIVATE_KEY)
  )

  if (!isConfigured) {
    console.warn(
      "[Firebase Admin] Not configured. Set FIREBASE_ADMIN_SERVICE_ACCOUNT " +
      "or individual FIREBASE_ADMIN_* env vars. See .env.example for details."
    )
    return false
  }

  try {
    if (getApps().length > 0) {
      _adminApp = getApps()[0]
    } else if (hasServiceAccountFile) {
      // --- Option 1: Service account JSON file (local dev) ---
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
      if (serviceAccount.private_key) {
        serviceAccount.private_key = cleanPrivateKey(serviceAccount.private_key)
      }
      _adminApp = initializeApp({ credential: cert(serviceAccount) })
      console.log("[Firebase Admin] Initialized from serviceaccountkey.json")

    } else if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
      // --- Option 2: Whole service account JSON as env var (raw JSON or base64) ---
      let rawJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT.trim()

      // Strip enclosing quotes
      if ((rawJson.startsWith('"') && rawJson.endsWith('"')) ||
          (rawJson.startsWith("'") && rawJson.endsWith("'"))) {
        rawJson = rawJson.slice(1, -1).trim()
      }

      // Decode base64 if it doesn't look like JSON
      if (!rawJson.startsWith('{')) {
        rawJson = Buffer.from(rawJson, 'base64').toString('utf8').trim()
      }

      const serviceAccount = JSON.parse(rawJson)
      if (serviceAccount.private_key) {
        serviceAccount.private_key = cleanPrivateKey(serviceAccount.private_key)
      }
      _adminApp = initializeApp({ credential: cert(serviceAccount) })
      console.log("[Firebase Admin] Initialized from FIREBASE_ADMIN_SERVICE_ACCOUNT env var.")

    } else {
      // --- Option 3: Individual env vars ---
      const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!
      let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || ""

      privateKey = cleanPrivateKey(privateKey)

      // Strip enclosing quotes
      if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
          (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
        privateKey = privateKey.slice(1, -1).trim()
        privateKey = cleanPrivateKey(privateKey)
      }

      // Support base64-encoded private key
      if (!privateKey.startsWith('-----') && privateKey.length > 100) {
        const decoded = Buffer.from(privateKey, 'base64').toString('utf8').trim()
        if (decoded.includes('-----BEGIN PRIVATE KEY-----')) {
          privateKey = decoded
        }
      }

      _adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      })
      console.log("[Firebase Admin] Initialized from individual env vars.")
    }

    _adminAuth = getAuth(_adminApp!)
    _adminDb = getFirestore(_adminApp!)
    return true

  } catch (error) {
    console.error("[Firebase Admin] Initialization failed:", error)
    _adminApp = null
    _adminAuth = null
    _adminDb = null
    return false
  }
}

// --- Public API: Lazy getters ---
// These only trigger initialization when actually called at runtime.

export function getAdminAuth(): Auth | null {
  doInitialize()
  return _adminAuth
}

export function getAdminDb(): Firestore | null {
  doInitialize()
  return _adminDb
}

export function getAdminApp(): App | null {
  doInitialize()
  return _adminApp
}

// Legacy named exports (for existing imports) — these are lazy proxied via getters
export { isFirebaseAdminConfigured }

// IMPORTANT: These are initialized as null and populated lazily.
// Existing code that imports { adminAuth } will get null at import time.
// Use getAdminAuth() / getAdminDb() instead for guaranteed initialization.
// For backward compatibility we also export the raw variables.
export { _adminApp as adminApp, _adminAuth as adminAuth, _adminDb as adminDb }
