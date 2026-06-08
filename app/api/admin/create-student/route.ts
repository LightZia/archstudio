import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase-admin"

function inspectKey(key: string | undefined): any {
  if (!key) return "undefined/empty"
  return {
    length: key.length,
    startsWith: key.slice(0, 35),
    endsWith: key.slice(-30),
    numNewlines: (key.match(/\n/g) || []).length,
    numBackslashN: (key.match(/\\n/g) || []).length,
    numSpaces: (key.match(/ /g) || []).length,
  }
}

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
    
    // Retrieve env vars to inspect their format
    const serviceAccountEnv = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
    const privateKeyEnv = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    
    let serviceAccountKeyDetails = null
    if (serviceAccountEnv) {
      try {
        let rawJson = serviceAccountEnv.trim()
        if ((rawJson.startsWith('"') && rawJson.endsWith('"')) ||
            (rawJson.startsWith("'") && rawJson.endsWith("'"))) {
          rawJson = rawJson.slice(1, -1).trim()
        }
        if (!rawJson.startsWith('{')) {
          rawJson = Buffer.from(rawJson, 'base64').toString('utf8').trim()
        }
        const serviceAccount = JSON.parse(rawJson)
        serviceAccountKeyDetails = inspectKey(serviceAccount.private_key)
      } catch (jsonErr: any) {
        serviceAccountKeyDetails = { error: `Failed to parse JSON: ${jsonErr.message}` }
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to create user",
        debug: {
          has_service_account: !!serviceAccountEnv,
          has_project_id: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
          has_client_email: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          has_private_key: !!privateKeyEnv,
          service_account_env_inspect: inspectKey(serviceAccountEnv),
          individual_private_key_env_inspect: inspectKey(privateKeyEnv),
          service_account_parsed_key_inspect: serviceAccountKeyDetails
        }
      },
      { status: 500 }
    )
  }
}

