export interface SessionInfo {
  username: string
  role: 'admin' | 'user'
  timestamp: number
}

export function decodeSession(sessionToken: string): SessionInfo | null {
  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    
    if (parts.length >= 3) {
      return {
        username: parts[0],
        role: parts[1] as 'admin' | 'user',
        timestamp: parseInt(parts[2], 10)
      }
    }
    
    return null
  } catch (error) {
    console.error('Error decoding session:', error)
    return null
  }
}

export function hasPermission(sessionInfo: SessionInfo | null, requiredRole: 'admin' | 'user'): boolean {
  if (!sessionInfo) return false
  
  if (requiredRole === 'admin') {
    return sessionInfo.role === 'admin'
  }
  
  // User role can access user-level features
  return sessionInfo.role === 'admin' || sessionInfo.role === 'user'
} 