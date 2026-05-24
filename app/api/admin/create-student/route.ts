import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    const adminAuth = getAdminAuth()!

    // Create the user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || "",
    })

    return NextResponse.json(
      { success: true, uid: userRecord.uid },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating student auth account:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to create user",
        debug: {
          has_service_account: !!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT,
          has_project_id: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
          has_client_email: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          has_private_key: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY
        }
      },
      { status: 500 }
    )
  }
}
