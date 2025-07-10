import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NEXTBILLION_API_KEY: process.env.NEXTBILLION_API_KEY,
    USE_CASE: process.env.USE_CASE || 'jobs',
  })
} 