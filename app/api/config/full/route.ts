import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NEXTBILLION_API_KEY: process.env.NEXTBILLION_API_KEY,
    USE_CASE: process.env.USE_CASE || 'jobs',
    COMPANY_NAME: process.env.COMPANY_NAME || 'Route Planner',
    COMPANY_LOGO: process.env.COMPANY_LOGO || '/company_logo.svg',
    COMPANY_COLOR: process.env.COMPANY_COLOR || '#D36784',
    
    // Theme customization options
    THEME_PRIMARY_COLOR: process.env.THEME_PRIMARY_COLOR || process.env.COMPANY_COLOR || '#D36784',
    THEME_SECONDARY_COLOR: process.env.THEME_SECONDARY_COLOR || '#dc004e',
    THEME_BACKGROUND_COLOR: process.env.THEME_BACKGROUND_COLOR || '#ffffff',
    THEME_PAPER_COLOR: process.env.THEME_PAPER_COLOR || '#ffffff',
    THEME_TEXT_PRIMARY: process.env.THEME_TEXT_PRIMARY || '#000000',
    THEME_TEXT_SECONDARY: process.env.THEME_TEXT_SECONDARY || '#666666',
    THEME_ERROR_COLOR: process.env.THEME_ERROR_COLOR || '#d32f2f',
    THEME_WARNING_COLOR: process.env.THEME_WARNING_COLOR || '#ed6c02',
    THEME_INFO_COLOR: process.env.THEME_INFO_COLOR || '#0288d1',
    THEME_SUCCESS_COLOR: process.env.THEME_SUCCESS_COLOR || '#2e7d32',
    
    // Typography customization
    THEME_FONT_FAMILY: process.env.THEME_FONT_FAMILY || '"Roboto", "Helvetica", "Arial", sans-serif',
    THEME_FONT_SIZE_SMALL: process.env.THEME_FONT_SIZE_SMALL || '0.875rem',
    THEME_FONT_SIZE_MEDIUM: process.env.THEME_FONT_SIZE_MEDIUM || '1rem',
    THEME_FONT_SIZE_LARGE: process.env.THEME_FONT_SIZE_LARGE || '1.25rem',
    
    // Border radius customization
    THEME_BORDER_RADIUS: process.env.THEME_BORDER_RADIUS || '4px',
    
    // Spacing customization
    THEME_SPACING_UNIT: process.env.THEME_SPACING_UNIT || '8',
  })
} 