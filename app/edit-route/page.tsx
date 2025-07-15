'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import { useRouter, useSearchParams } from 'next/navigation'
import { WhiteLabelLayout } from '../white-label-layout'
import { Sidebar } from '../../components/common/sidebar'
import { useWhiteLabelContext } from '../white-label-layout'

export default function EditRoutePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { companyName, companyLogo } = useWhiteLabelContext()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routeData, setRouteData] = useState<any>(null)
  const [open, setOpen] = useState(true)

  const jobId = searchParams.get('job_id')

  useEffect(() => {
    if (jobId) {
      fetchRouteData(jobId)
    } else {
      setError('No route ID provided')
      setLoading(false)
    }
  }, [jobId])

  const fetchRouteData = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/optimization-results?job_id=${encodeURIComponent(id)}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.response_data?.result?.routes?.length > 0) {
          setRouteData(data)
        } else {
          setError('No routes found in this optimization result')
        }
      } else {
        setError('Failed to fetch route data')
      }
    } catch (error) {
      console.error('Error fetching route data:', error)
      setError('Failed to fetch route data')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setOpen(false)
    router.push('/analysis')
  }

  const handleClose = () => {
    setOpen(false)
    router.push('/analysis')
  }

  if (!open) {
    return null
  }

  return (
    <WhiteLabelLayout>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar currentPage="analysis" />
        
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
                src={companyLogo}
                alt={`${companyName} Logo`}
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
                Edit Route
              </Typography>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                >
                  Back to Analysis
                </Button>
              </Box>
            ) : routeData ? (
              <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#d36784' }}>
                  Edit Route: {routeData.title || routeData.job_id}
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Route editing functionality is coming soon. This will allow you to:
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#d36784' }}>
                    Planned Features:
                  </Typography>
                  <ul>
                    <li>Interactive map with route visualization</li>
                    <li>Drag and drop route editing</li>
                    <li>Add/remove stops from routes</li>
                    <li>Reassign jobs between vehicles</li>
                    <li>Real-time route optimization</li>
                    <li>Timeline view of route schedules</li>
                    <li>Unassigned tasks management</li>
                  </ul>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                  >
                    Back to Analysis
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    disabled
                  >
                    Edit Routes (Coming Soon)
                  </Button>
                </Box>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </WhiteLabelLayout>
  )
} 