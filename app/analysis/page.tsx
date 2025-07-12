'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Route as RouteIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
} from '@mui/icons-material'
import { WhiteLabelLayout } from '../white-label-layout'
import { HamburgerMenu } from '../../components/common/hamburger-menu'
import { RouteSummaryTable } from '../../components/common/route-summary-table'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/use-auth'

export default function RouteAnalysisPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [optimizationResults, setOptimizationResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [editingTitleValue, setEditingTitleValue] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resultToDelete, setResultToDelete] = useState<any>(null)
  const [expandedRoutes, setExpandedRoutes] = useState<Set<number>>(new Set())
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [summaryStats, setSummaryStats] = useState({
    totalRoutes: 0,
    avgSpeed: 0,
    avgGallonsPerRoute: 0,
    totalUnassignedJobs: 0
  })

  useEffect(() => {
    fetchOptimizationResults()
  }, [])

  // Check for job_id in URL query parameters and auto-open details
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const jobIdFromUrl = urlParams.get('job_id')
    
    if (jobIdFromUrl && optimizationResults.length > 0) {
      // Find the optimization result with this job_id
      const result = optimizationResults.find(r => r.job_id === jobIdFromUrl)
      if (result) {
        handleViewResult(jobIdFromUrl)
        setSelectedJobId(jobIdFromUrl)
      }
    }
  }, [optimizationResults])

  // Debug summary stats changes
  useEffect(() => {
    console.log('Summary stats updated:', summaryStats)
  }, [summaryStats])

  // Recalculate summary stats when optimization results change
  useEffect(() => {
    if (optimizationResults.length > 0) {
      console.log('useEffect triggered - recalculating stats for', optimizationResults.length, 'results')
      calculateSummaryStats(optimizationResults)
    }
  }, [optimizationResults])

  const fetchOptimizationResults = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/optimization-results')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched optimization results:', data.results)
        setOptimizationResults(data.results || [])
      } else {
        setError('Failed to fetch optimization results')
      }
    } catch (error) {
      console.error('Error fetching optimization results:', error)
      setError('Failed to fetch optimization results')
    } finally {
      setLoading(false)
    }
  }

  const calculateSummaryStats = async (results: any[]) => {
    console.log('Calculating summary stats for', results.length, 'results')
    
    if (results.length === 0) {
      setSummaryStats({
        totalRoutes: 0,
        avgSpeed: 0,
        avgGallonsPerRoute: 0,
        totalUnassignedJobs: 0
      })
      return
    }

    let totalRoutes = 0
    let totalSpeed = 0
    let totalGallons = 0
    let totalUnassigned = 0
    let validResults = 0

    // Create a Set to track processed job_ids to avoid duplicates
    const processedJobIds = new Set()
    let skippedCount = 0

    console.log('Processing', results.length, 'optimization results')

    for (const result of results) {
      // Skip if we've already processed this job_id
      if (processedJobIds.has(result.job_id)) {
        console.log('Skipping duplicate job_id:', result.job_id)
        skippedCount++
        continue
      }
      processedJobIds.add(result.job_id)

      try {
        console.log('Fetching details for result:', result.job_id)
        // Fetch the detailed result data
        const detailResponse = await fetch(`/api/optimization-results?job_id=${encodeURIComponent(result.job_id)}`)
        if (detailResponse.ok) {
          const detailData = await detailResponse.json()
          console.log('Detail data for', result.job_id, ':', detailData)
          const kpis = calculateKPIs(detailData.response_data)
          console.log('KPIs for', result.job_id, ':', kpis)
          
          if (kpis) {
            totalRoutes += kpis.routesCount
            totalSpeed += kpis.avgSpeed
            totalGallons += kpis.totalFuel
            totalUnassigned += kpis.unassignedCount
            validResults++
            console.log('Added to totals - routes:', kpis.routesCount, 'speed:', kpis.avgSpeed, 'fuel:', kpis.totalFuel, 'unassigned:', kpis.unassignedCount, 'running total routes:', totalRoutes)
          } else {
            console.log('No KPIs calculated for', result.job_id)
          }
        } else {
          console.log('Failed to fetch details for', result.job_id, 'Status:', detailResponse.status)
        }
      } catch (error) {
        console.error('Error fetching result details for stats:', error)
      }
    }

    console.log('Final totals - routes:', totalRoutes, 'speed:', totalSpeed, 'fuel:', totalGallons, 'unassigned:', totalUnassigned, 'valid results:', validResults, 'skipped duplicates:', skippedCount)

    const finalStats = {
      totalRoutes: totalRoutes,
      avgSpeed: validResults > 0 ? Math.round(totalSpeed / validResults) : 0,
      avgGallonsPerRoute: totalRoutes > 0 ? Math.round(totalGallons / totalRoutes) : 0,
      totalUnassignedJobs: totalUnassigned
    }
    
    console.log('Setting summary stats to:', finalStats)
    setSummaryStats(finalStats)
  }

  const handleViewResult = async (jobId: string) => {
    try {
      const response = await fetch(`/api/optimization-results?job_id=${encodeURIComponent(jobId)}`)
      if (response.ok) {
        const data = await response.json()
        // Find the summary result for this jobId
        const summary = optimizationResults.find(r => r.job_id === jobId)
        // Merge the title and shared_url from summary if available
        const resultWithSharedUrl = { 
          ...data, 
          title: summary?.title || data.title,
          shared_url: summary?.shared_url || data.shared_url
        }
        console.log('Selected result data:', resultWithSharedUrl)
        console.log('Shared URL available:', !!resultWithSharedUrl.shared_url)
        console.log('Shared URL value:', resultWithSharedUrl.shared_url)
        console.log('Summary shared_url:', summary?.shared_url)
        console.log('Data shared_url:', data.shared_url)
        setSelectedResult(resultWithSharedUrl)
        setSelectedJobId(jobId)
      } else {
        setError('Failed to fetch result details')
      }
    } catch (error) {
      console.error('Error fetching result details:', error)
      setError('Failed to fetch result details')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatJobId = (jobId: string) => {
    if (jobId.length > 30) {
      return jobId.substring(0, 30) + '...'
    }
    return jobId
  }

  // Helper functions for KPI calculations
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return `${km.toFixed(1)} km`
  }

  const calculateKPIs = (resultData: any) => {
    if (!resultData?.result) return null

    const { summary, routes, unassigned } = resultData.result
    
    console.log('KPI calculation - summary.unassigned:', summary?.unassigned, 'unassigned array length:', unassigned?.length)
    
    // Fuel delivery metrics
    const totalFuelDelivered = summary?.delivery || [0, 0]
    const ulsdClearDelivered = totalFuelDelivered[0] || 0
    const ulsdDyedDelivered = totalFuelDelivered[1] || 0
    const totalFuel = ulsdClearDelivered + ulsdDyedDelivered
    
    // Operational metrics
    const totalDistance = summary?.distance || 0
    const totalDuration = summary?.duration || 0
    const totalService = summary?.service || 0
    const totalWaiting = summary?.waiting_time || 0
    const totalSetup = summary?.setup || 0
    
    // Cost metrics
    const totalCost = summary?.cost || 0
    const totalRevenue = summary?.revenue || 0
    const profit = totalRevenue - totalCost
    
    // Service quality metrics
    const unassignedCount = summary?.unassigned || 0
    const totalLateTime = summary?.total_visit_lateness || 0
    const lateVisits = summary?.num_late_visits || 0
    
    // Vehicle metrics
    const routesCount = routes?.length || 0
    const avgFuelPerRoute = routesCount > 0 ? totalFuel / routesCount : 0
    const avgDistancePerRoute = routesCount > 0 ? totalDistance / routesCount : 0
    const avgDurationPerRoute = routesCount > 0 ? totalDuration / routesCount : 0
    
    // Efficiency metrics
    const avgSpeed = totalDuration > 0 ? (totalDistance / 1000) / (totalDuration / 3600) : 0 // km/h
    const fuelEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0 // meters per gallon
    const costPerGallon = totalFuel > 0 ? totalCost / totalFuel : 0
    const costPerKm = totalDistance > 0 ? totalCost / (totalDistance / 1000) : 0
    
    return {
      // Fuel metrics
      ulsdClearDelivered,
      ulsdDyedDelivered,
      totalFuel,
      avgFuelPerRoute,
      
      // Operational metrics
      totalDistance,
      totalDuration,
      totalService,
      totalWaiting,
      totalSetup,
      avgDistancePerRoute,
      avgDurationPerRoute,
      avgSpeed,
      
      // Cost metrics
      totalCost,
      totalRevenue,
      profit,
      costPerGallon,
      costPerKm,
      
      // Service quality
      unassignedCount,
      totalLateTime,
      lateVisits,
      
      // Efficiency
      fuelEfficiency,
      routesCount
    }
  }

  const handleEditTitle = (result: any) => {
    setEditingTitle(result.id)
    setEditingTitleValue(result.title)
  }

  const handleSaveTitle = async (result: any) => {
    try {
      const response = await fetch('/api/optimization-results', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: result.id,
          title: editingTitleValue,
        }),
      })

      if (response.ok) {
        // Update the local state
        setOptimizationResults(prev => 
          prev.map(r => 
            r.id === result.id 
              ? { ...r, title: editingTitleValue }
              : r
          )
        )
        setEditingTitle(null)
        setEditingTitleValue('')
      } else {
        setError('Failed to update title')
      }
    } catch (error) {
      console.error('Error updating title:', error)
      setError('Failed to update title')
    }
  }

  const handleCancelEdit = () => {
    setEditingTitle(null)
    setEditingTitleValue('')
  }

  const handleDeleteClick = (result: any) => {
    setResultToDelete(result)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!resultToDelete) return

    try {
      const response = await fetch(`/api/optimization-results?id=${encodeURIComponent(resultToDelete.id)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the deleted result from the local state
        setOptimizationResults(prev => 
          prev.filter(r => r.id !== resultToDelete.id)
        )
        setDeleteDialogOpen(false)
        setResultToDelete(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete optimization result')
      }
    } catch (error) {
      console.error('Error deleting optimization result:', error)
      setError('Failed to delete optimization result')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setResultToDelete(null)
  }

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
      <Container maxWidth="xl" sx={{ minHeight: '100vh', p: 0 }}>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
            <Box sx={{ maxHeight: '25px', height: '25px', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HamburgerMenu currentPage="analysis" />
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
                  Route Plan Analysis
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isAdmin && (
                  <Typography
                    variant="caption"
                    sx={{
                      backgroundColor: '#d36784',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}
                  >
                    ADMIN
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ 
                    height: '25px',
                    fontSize: '0.75rem',
                    textTransform: 'none'
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, p: 3 }}>
            <Grid container spacing={3}>
              {/* Page Header */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <AnalyticsIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Route Plan Analysis
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666' }}>
                        Analyze and optimize your route planning performance
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Analysis Cards */}
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    avatar={<SpeedIcon sx={{ color: '#ff9800' }} />}
                    title="Average Speed"
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                      {summaryStats.avgSpeed}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                      km/h average speed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    avatar={<RouteIcon sx={{ color: '#2196f3' }} />}
                    title="Total Routes"
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                      {summaryStats.totalRoutes}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                      Optimization plans
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    avatar={<AnalyticsIcon sx={{ color: '#9c27b0' }} />}
                    title="Avg Gallons/Route"
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                      {summaryStats.avgGallonsPerRoute.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                      Average gallons per route
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    avatar={<AnalyticsIcon sx={{ color: '#f44336' }} />}
                    title="Unassigned Jobs"
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                      {summaryStats.totalUnassignedJobs}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                      Total unassigned jobs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Optimization Results */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <HistoryIcon sx={{ fontSize: 32, color: '#d36784' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      Optimization History
                    </Typography>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : optimizationResults.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                      <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                        No optimization results found
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Run an optimization on the main page to see results here
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {optimizationResults.map((result) => (
                              <TableRow 
                                key={result.id}
                                sx={{
                                  backgroundColor: selectedJobId === result.job_id ? '#f0f8ff' : 'inherit',
                                  '&:hover': {
                                    backgroundColor: selectedJobId === result.job_id ? '#e6f3ff' : '#f5f5f5'
                                  }
                                }}
                              >
                                <TableCell>
                                  {editingTitle === result.id ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <input
                                        type="text"
                                        value={editingTitleValue}
                                        onChange={(e) => setEditingTitleValue(e.target.value)}
                                        style={{
                                          flex: 1,
                                          padding: '4px 8px',
                                          border: '1px solid #ccc',
                                          borderRadius: '4px',
                                          fontSize: '14px'
                                        }}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSaveTitle(result)
                                          }
                                        }}
                                        aria-label="Edit optimization title"
                                        title="Edit optimization title"
                                      />
                                      <Button
                                        size="small"
                                        onClick={() => handleSaveTitle(result)}
                                        sx={{ minWidth: 'auto', p: 0.5 }}
                                      >
                                        ✓
                                      </Button>
                                      <Button
                                        size="small"
                                        onClick={handleCancelEdit}
                                        sx={{ minWidth: 'auto', p: 0.5 }}
                                      >
                                        ✕
                                      </Button>
                                    </Box>
                                  ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          flex: 1,
                                          cursor: 'pointer',
                                          '&:hover': {
                                            color: '#666'
                                          }
                                        }}
                                        onClick={() => handleViewResult(result.job_id)}
                                      >
                                        {result.title}
                                      </Typography>
                                      <Button
                                        size="small"
                                        onClick={() => handleEditTitle(result)}
                                        sx={{ minWidth: 'auto', p: 0.5, fontSize: '12px' }}
                                      >
                                        ✎
                                      </Button>
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={result.status}
                                    color={result.status === 'completed' ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {formatDate(result.created_at)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    {result.shared_url && (
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<MapIcon />}
                                        onClick={() => window.open(result.shared_url, '_blank')}
                                        sx={{ textTransform: 'none' }}
                                      >
                                        Map
                                      </Button>
                                    )}
                                    {isAdmin && (
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDeleteClick(result)}
                                        sx={{ 
                                          textTransform: 'none',
                                          color: '#d32f2f',
                                          borderColor: '#d32f2f',
                                          '&:hover': {
                                            borderColor: '#b71c1c',
                                            backgroundColor: 'rgba(211, 47, 47, 0.04)'
                                          }
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    )}
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {selectedResult && (
                        <Box sx={{ mt: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Optimization Result Details
                          </Typography>
                          
                          {/* Basic Information */}
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Title:
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                                {selectedResult.title}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Status:
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2 }}>
                                {selectedResult.status}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Created:
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2 }}>
                                {formatDate(selectedResult.created_at)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Routes Found:
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2 }}>
                                {selectedResult.response_data?.result?.routes?.length || 0}
                              </Typography>
                            </Grid>
                          </Grid>

                          {/* KPI Calculations */}
                          {(() => {
                            const kpis = calculateKPIs(selectedResult.response_data)
                            if (!kpis) return null

                            return (
                              <>
                                {/* Fuel Delivery KPIs */}
                                <Typography variant="h6" sx={{ mb: 2, mt: 3, color: '#d36784', fontWeight: 'bold' }}>
                                  Fuel Delivery Metrics
                                </Typography>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold' }}>
                                        {kpis.ulsdClearDelivered.toLocaleString()}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        ULSD Clear (gal)
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold' }}>
                                        {kpis.ulsdDyedDelivered.toLocaleString()}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        ULSD Dyed (gal)
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold' }}>
                                        {kpis.totalFuel.toLocaleString()}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Total Fuel (gal)
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold' }}>
                                        {kpis.avgFuelPerRoute.toFixed(0)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Avg per Route (gal)
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>

                                {/* Operational Efficiency KPIs */}
                                <Typography variant="h6" sx={{ mb: 2, mt: 3, color: '#d36784', fontWeight: 'bold' }}>
                                  Operational Efficiency
                                </Typography>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold' }}>
                                        {formatDistance(kpis.totalDistance)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Total Distance
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold' }}>
                                        {formatDuration(kpis.totalDuration)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Total Drive Time
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold' }}>
                                        {kpis.avgSpeed.toFixed(1)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Avg Speed (km/h)
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold' }}>
                                        {kpis.fuelEfficiency.toFixed(0)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Fuel Efficiency (m/gal)
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>

                                {/* Service Quality KPIs */}
                                <Typography variant="h6" sx={{ mb: 2, mt: 3, color: '#d36784', fontWeight: 'bold' }}>
                                  Service Quality
                                </Typography>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: kpis.unassignedCount === 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                                        {kpis.unassignedCount}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Unassigned Jobs
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: kpis.lateVisits === 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                                        {kpis.lateVisits}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Late Deliveries
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold' }}>
                                        {formatDuration(kpis.totalService)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Total Service Time
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={3}>
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                      <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold' }}>
                                        {formatDuration(kpis.totalWaiting)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#666' }}>
                                        Total Waiting Time
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </>
                            )
                          })()}

                          {/* Routes Table */}
                          {selectedResult?.response_data?.result?.routes && (
                            <Box sx={{ mt: 4 }}>
                              <Typography variant="h6" sx={{ mb: 2, color: '#d36784', fontWeight: 'bold' }}>
                                Route Details
                              </Typography>
                              <RouteSummaryTable
                                routes={selectedResult.response_data.result.routes}
                                expandedRoutes={expandedRoutes}
                                onToggleRoute={(index) => {
                                  setExpandedRoutes(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(index)) {
                                      newSet.delete(index);
                                    } else {
                                      newSet.add(index);
                                    }
                                    return newSet;
                                  });
                                }}
                                showSelection={false}
                                maxHeight={400}
                              />
                            </Box>
                          )}

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedResult(null)
                              setSelectedJobId(null)
                            }}
                            sx={{ mt: 2 }}
                          >
                            Close Details
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Footer */}
          <Box sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            py: 3,
            px: 2,
            mt: '5px'
          }}>
            <Container maxWidth="xl">
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
            </Container>
          </Box>
        </Box>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: '#d32f2f' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Are you sure you want to delete the optimization result "{resultToDelete?.title}"?
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </WhiteLabelLayout>
  )
} 