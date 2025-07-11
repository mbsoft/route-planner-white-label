import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password'
const USER_USERNAME = process.env.USER_USERNAME || 'user'
const USER_PASSWORD = process.env.USER_PASSWORD || 'password'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    let role = null

    // Check admin credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      role = 'admin'
    }
    // Check user credentials
    else if (username === USER_USERNAME && password === USER_PASSWORD) {
      role = 'user'
    }
    // Invalid credentials
    else {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create session token with role information
    const sessionToken = Buffer.from(`${username}:${role}:${Date.now()}`).toString('base64')
    
    // Set secure session cookie
    const cookieStore = await cookies()
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 