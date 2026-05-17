import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Check if Firebase is configured
const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
)

// Initialize Firebase (prevent multiple initializations)
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

function initializeFirebase() {
  // Skip initialization if not configured
  if (!isFirebaseConfigured) {
    console.warn(
      "Firebase not configured. Add your Firebase credentials to .env.local:\n" +
      "- NEXT_PUBLIC_FIREBASE_API_KEY\n" +
      "- NEXT_PUBLIC_FIREBASE_PROJECT_ID\n" +
      "See .env.example for all required variables."
    )
    return { app: null, auth: null, db: null, storage: null }
  }

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  
  return { app, auth, db, storage }
}

// Export initialized instances
const firebase = initializeFirebase()

export { firebase, firebaseConfig, isFirebaseConfigured }
export const firebaseApp = firebase.app
export { auth, db, storage }

// ===========================================
// USAGE EXAMPLES
// ===========================================

/*
// 1. Authentication - Sign in with email/password
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

// 2. Firestore - Add a document
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const addCertificate = async (certificateData: any) => {
  try {
    const docRef = await addDoc(collection(db, "certificates"), certificateData)
    return docRef.id
  } catch (error) {
    console.error("Error adding document:", error)
    throw error
  }
}

// 3. Firestore - Get documents
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

const getStudentCertificates = async (studentId: string) => {
  const q = query(
    collection(db, "certificates"),
    where("studentId", "==", studentId)
  )
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// 4. Storage - Upload a file
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"

const uploadCertificateTemplate = async (file: File, filename: string) => {
  const storageRef = ref(storage, `templates/${filename}`)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)
  return downloadURL
}
*/
