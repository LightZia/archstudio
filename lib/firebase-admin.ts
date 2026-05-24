import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

import fs from 'fs'
import path from 'path'

// Firebase Admin SDK configuration (server-side only)
// Used for server actions, API routes, and admin operations

// Try loading service account from file first
const serviceAccountPath = path.join(process.cwd(), 'serviceaccountkey.json')
const hasServiceAccountFile = fs.existsSync(serviceAccountPath)

// Check if Firebase Admin is configured
const isFirebaseAdminConfigured = hasServiceAccountFile || Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY
)

let adminApp: App | null = null
let adminAuth: Auth | null = null
let adminDb: Firestore | null = null

function initializeFirebaseAdmin() {
  // Skip initialization if not configured
  if (!isFirebaseAdminConfigured) {
    console.warn(
      "Firebase Admin SDK not configured. Add your credentials to .env.local:\n" +
      "- FIREBASE_ADMIN_PROJECT_ID\n" +
      "- FIREBASE_ADMIN_CLIENT_EMAIL\n" +
      "- FIREBASE_ADMIN_PRIVATE_KEY\n" +
      "See .env.example for details."
    )
    return { adminApp: null, adminAuth: null, adminDb: null }
  }

  if (getApps().length === 0) {
    if (hasServiceAccountFile) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      })
    } else {
      const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!
      let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!

      // Remove enclosing quotes if present (double or single quotes)
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1)
      } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
        privateKey = privateKey.slice(1, -1)
      }

      privateKey = privateKey.replace(/\\n/g, "\n")

      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    }
  } else {
    adminApp = getApps()[0]
  }

  adminAuth = getAuth(adminApp)
  adminDb = getFirestore(adminApp)

  return { adminApp, adminAuth, adminDb }
}

// Initialize and export
const firebaseAdmin = initializeFirebaseAdmin()

export { firebaseAdmin, isFirebaseAdminConfigured }
export { adminApp, adminAuth, adminDb }

// ===========================================
// USAGE EXAMPLES (Server-side only)
// ===========================================

/*
// 1. Verify ID Token (in API routes or server actions)
import { adminAuth } from "@/lib/firebase-admin"

export async function verifyToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// 2. Create custom claims for admin users
import { adminAuth } from "@/lib/firebase-admin"

export async function setAdminClaim(uid: string) {
  await adminAuth.setCustomUserClaims(uid, { admin: true })
}

// 3. Server-side Firestore operations
import { adminDb } from "@/lib/firebase-admin"

export async function getAllCertificates() {
  const snapshot = await adminDb.collection("certificates").get()
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// 4. Batch operations
import { adminDb } from "@/lib/firebase-admin"

export async function batchUpdateCertificates(updates: { id: string; data: any }[]) {
  const batch = adminDb.batch()
  
  updates.forEach(({ id, data }) => {
    const ref = adminDb.collection("certificates").doc(id)
    batch.update(ref, data)
  })
  
  await batch.commit()
}
*/
