'use client'

import React from 'react'
import { Container, Box, Typography, Paper, Divider, Button } from '@mui/material'
import { Logout as LogoutIcon } from '@mui/icons-material'
import { WhiteLabelLayout } from '../white-label-layout'
import { Sidebar } from '../../components/common/sidebar'
import { useRouter } from 'next/navigation'

export default function InformationPage() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <WhiteLabelLayout>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar currentPage="information" />
        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          ml: 'var(--sidebar-width, 280px)',
          transition: 'margin-left 0.3s ease',
          backgroundColor: '#ffffff' 
        }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img
                src="/company_logo.svg"
                alt="Diesel Direct Logo"
                style={{
                  height: '25px',
                  width: 'auto',
                  borderRadius: '4px'
                }}
              />
              <Typography
                variant="h4"
                component="h1"
                sx={{ color: '#333', fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                Information
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, backgroundColor: '#ffffff', p: 3 }}>
            {/* Main content here */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              About This Application
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This is a white-label route planning and optimization dashboard powered by NextBillion.ai.
            </Typography>
            {/* ... more content ... */}
          </Box>
          <Box sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            py: 3,
            px: 2,
            mt: '5px', // Add 5px margin above the footer
            position: 'relative',
            zIndex: 10, // Ensure footer is above content but below sticky elements
            flexShrink: 0, // Prevent footer from shrinking
          }}>
            <Box sx={{ mt: 0, pt: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
              <img
                src="/company_logo.svg"
                alt="Diesel Direct Logo"
                style={{ height: '20px', width: 'auto', marginRight: '8px', verticalAlign: 'middle' }}
              />
              <Typography variant="caption" sx={{ color: '#999' }}>
                powered by NextBillion.ai | Version 1.0.0 | Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </WhiteLabelLayout>
  )
} 