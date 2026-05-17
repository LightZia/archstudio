import { NextRequest, NextResponse } from "next/server"

// Default credentials if env vars not set (for demo purposes only)
const DEFAULT_EMAIL = "admin@archstudio.com"
const DEFAULT_PASSWORD = "admin123"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Get credentials from environment variables or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD

    // Validate credentials
    if (email === adminEmail && password === adminPassword) {
      return NextResponse.json(
        { success: true, message: "Login successful" },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
      { status: 401 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    )
  }
}
