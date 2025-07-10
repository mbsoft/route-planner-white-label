import React from 'react'

const version = process.env.NEXT_PUBLIC_GIT_COMMIT || process.env.NEXT_PUBLIC_VERSION || '1.0.0'
const lastUpdated = process.env.NEXT_PUBLIC_LAST_UPDATED || ''

export default function Footer() {
  return (
    <footer style={{
      width: '100%',
      padding: '12px 0',
      background: '#23272f',
      color: '#fff',
      fontSize: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      borderTop: '1px solid #222',
      position: 'relative',
      zIndex: 100,
    }}>
      <img src="/company_logo.png" alt="Company Logo" style={{ height: 24, marginRight: 8, verticalAlign: 'middle' }} />
      <span style={{ fontWeight: 500 }}>PlanPath-AI</span>
      <span style={{ margin: '0 6px' }}>powered by NextBillion.ai</span>
      <span style={{ margin: '0 6px', color: '#aaa' }}>Version {version}</span>
      <span style={{ margin: '0 6px', color: '#aaa' }}>| Last updated: {lastUpdated}</span>
    </footer>
  )
} 