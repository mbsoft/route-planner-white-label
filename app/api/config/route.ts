import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NEXTBILLION_API_KEY: process.env.NEXTBILLION_API_KEY,
    USE_CASE: process.env.USE_CASE || 'jobs',
    COMPANY_NAME: process.env.COMPANY_NAME || 'Route Planner',
    COMPANY_LOGO: process.env.COMPANY_LOGO || '/company_logo.svg',
    COMPANY_COLOR: process.env.COMPANY_COLOR || '#D36784',
  })
} 