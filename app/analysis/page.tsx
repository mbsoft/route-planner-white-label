'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  Menu,
  MenuItem,
  ListItemIcon,
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
  Edit as EditIcon,
  Download as DownloadIcon,
  GetApp as GetAppIcon,
  LocalGasStation as LocalGasStationIcon,
  Cancel as CancelIcon,
  Stop as StopIcon,
  Straighten as StraightenIcon,
  AccessTime as AccessTimeIcon,
  Build as BuildIcon,
} from '@mui/icons-material'
import { WhiteLabelLayout } from '../white-label-layout'
import { Sidebar } from '../../components/common/sidebar'
import { RouteSummaryTable } from '../../components/common/route-summary-table'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/use-auth'
import { useWhiteLabelContext } from '../white-label-layout'
import { LanguageSwitcher } from '../../components/common/language-switcher'
import { useLanguage } from '../../contexts/language-context'
import { CompanyLogo } from '../../components/common/company-logo'

export default function RouteAnalysisPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { companyName, companyLogo, companyColor } = useWhiteLabelContext()
  const { t, isLoading, language, renderKey } = useLanguage()
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
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedResultForDownload, setSelectedResultForDownload] = useState<any>(null)
  const [summaryStats, setSummaryStats] = useState({
    totalRoutes: 0,
    avgSpeed: 0,
    avgGallonsPerRoute: 0,
    totalUnassignedJobs: 0,
    avgStopsPerRoute: 0,
    avgDistancePerRoute: 0,
    totalWaitingTime: 0,
    avgServiceTimePerRoute: 0
  })
  const isCalculatingRef = useRef(false)

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
    // Removed debug logging
  }, [summaryStats])

  // Recalculate summary stats when optimization results change
  useEffect(() => {
    if (optimizationResults.length > 0) {
      calculateSummaryStats(optimizationResults)
    }
  }, [optimizationResults]) // Trigger when the array changes

  useEffect(() => {
    // Removed debug logging
  }, [selectedResult]);

  const fetchOptimizationResults = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/optimization-results')
      if (response.ok) {
        const data = await response.json()
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
    // Prevent multiple simultaneous calculations
    if (isCalculatingRef.current) {
      return
    }

    isCalculatingRef.current = true

    if (results.length === 0) {
      setSummaryStats({
        totalRoutes: 0,
        avgSpeed: 0,
        avgGallonsPerRoute: 0,
        totalUnassignedJobs: 0,
        avgStopsPerRoute: 0,
        avgDistancePerRoute: 0,
        totalWaitingTime: 0,
        avgServiceTimePerRoute: 0
      })
      isCalculatingRef.current = false
      return
    }

    let totalRoutes = 0
    let totalSpeed = 0
    let totalGallons = 0
    let totalUnassigned = 0
    let totalStops = 0
    let totalDistance = 0
    let totalWaitingTime = 0
    let totalServiceTime = 0
    let validResults = 0

    // Create a Set to track processed job_ids to avoid duplicates
    const processedJobIds = new Set()

    for (const result of results) {
      // Skip if we've already processed this job_id (same optimization result)
      if (processedJobIds.has(result.job_id)) {
        continue
      }
      processedJobIds.add(result.job_id)

      try {
        // Only fetch details if we don't have response_data already
        let detailData
        if (result.response_data) {
          detailData = result
        } else {
          // Fetch the detailed result data only if needed
          const detailResponse = await fetch(`/api/optimization-results?job_id=${encodeURIComponent(result.job_id)}`)
          if (detailResponse.ok) {
            detailData = await detailResponse.json()
          }
        }

        if (detailData?.response_data) {
          const kpis = calculateKPIs(detailData.response_data)

          if (kpis) {
            totalRoutes += kpis.routesCount
            totalSpeed += kpis.avgSpeed
            totalGallons += kpis.totalFuel
            totalUnassigned += kpis.unassignedCount
            totalStops += kpis.totalStops
            totalDistance += kpis.totalDistance
            totalWaitingTime += kpis.totalWaiting
            totalServiceTime += kpis.totalService || 0
            validResults++
          }
        }
      } catch (error) {
        console.error('Error processing result for stats:', error)
      }
    }

    const finalStats = {
      totalRoutes: totalRoutes,
      avgSpeed: validResults > 0 ? Math.round(totalSpeed / validResults) : 0,
      avgGallonsPerRoute: totalRoutes > 0 ? Math.round(totalGallons / totalRoutes) : 0,
      totalUnassignedJobs: totalUnassigned,
      avgStopsPerRoute: totalRoutes > 0 ? Math.round(totalStops / totalRoutes) : 0,
      avgDistancePerRoute: totalRoutes > 0 ? Math.round(totalDistance / totalRoutes) : 0,
      totalWaitingTime: totalWaitingTime,
      avgServiceTimePerRoute: totalRoutes > 0 && totalServiceTime > 0 && !isNaN(totalServiceTime) ? Math.round(totalServiceTime / totalRoutes) : 0
    }

    setSummaryStats(finalStats)
    isCalculatingRef.current = false
  }

  const handleViewResult = async (jobId: string) => {
    try {
      setLoadingDetails(true)

      // Check if we already have the full data in optimizationResults
      const existingResult = optimizationResults.find(r => r.job_id === jobId && r.response_data)

      if (existingResult) {
        // Use existing data if available
        const resultWithSharedUrl = {
          ...existingResult,
          title: existingResult.title || existingResult.title,
          shared_url: existingResult.shared_url || existingResult.shared_url
        }
        setSelectedResult(resultWithSharedUrl)
        setSelectedJobId(jobId)
        setLoadingDetails(false)
        return
      }

      // Fetch from API if not available locally
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
        setSelectedResult(resultWithSharedUrl)
        setSelectedJobId(jobId)
      } else {
        setError('Failed to fetch result details')
      }
    } catch (error) {
      console.error('Error fetching result details:', error)
      setError('Failed to fetch result details')
    } finally {
      setLoadingDetails(false)
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

    // Fuel delivery metrics
    const totalFuelDelivered = summary?.delivery || [0, 0, 0, 0, 0]
    const ulsdClearDelivered = totalFuelDelivered[0] || 0
    const ulsdDyedDelivered = totalFuelDelivered[1] || 0
    const unlDelivered = totalFuelDelivered[2] || 0
    const gasUnlPreDelivered = totalFuelDelivered[3] || 0
    const rec90Delivered = totalFuelDelivered[4] || 0
    const totalFuel = ulsdClearDelivered + ulsdDyedDelivered + unlDelivered + gasUnlPreDelivered + rec90Delivered

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
      unlDelivered,
      gasUnlPreDelivered,
      rec90Delivered,
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
      routesCount,

      // Additional metrics for summary tiles
      totalStops: routes?.reduce((sum: number, route: any) => sum + (route.steps?.length || 0), 0) || 0
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
        // Check if the deleted result is currently being viewed in the right panel
        if (selectedResult && selectedResult.id === resultToDelete.id) {
          // Close the right panel since the result being viewed was deleted
          setSelectedResult(null)
          setSelectedJobId(null)
        }

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

  const handleDownloadClick = (event: React.MouseEvent<HTMLElement>, result: any) => {
    event.stopPropagation()
    setDownloadMenuAnchor(event.currentTarget)
    setSelectedResultForDownload(result)
  }

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchor(null)
    setSelectedResultForDownload(null)
  }

  const handleDownloadCSV = async () => {
    if (!selectedResultForDownload) return

    try {
      // Fetch the full result data if not already available
      let resultData = selectedResultForDownload
      if (!resultData.response_data) {
        const response = await fetch(`/api/optimization-results?job_id=${encodeURIComponent(selectedResultForDownload.job_id)}`)
        if (response.ok) {
          resultData = await response.json()
        } else {
          throw new Error('Failed to fetch result data')
        }
      }

      const routes = resultData.response_data?.result?.routes || []
      if (routes.length === 0) {
        alert('No routes found to download')
        return
      }

      // Create a zip file with individual CSV files for each route
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      routes.forEach((route: any, index: number) => {
        const vehicleId = route.vehicle || `vehicle_${index + 1}`
        const steps = route.steps || []

        // Create CSV content for this route
        const csvHeaders = ['Step', 'Location', 'Type', 'Arrival Time', 'Departure Time', 'Service Time', 'Waiting Time', 'Distance (km)', 'Duration (min)']
        const csvRows = [csvHeaders]

        steps.forEach((step: any, stepIndex: number) => {
          const arrivalTime = step.arrival_time ? new Date(step.arrival_time * 1000).toLocaleString() : 'N/A'
          const departureTime = step.departure_time ? new Date(step.departure_time * 1000).toLocaleString() : 'N/A'
          const serviceTime = step.service_time ? (step.service_time / 60).toFixed(2) : '0'
          const waitingTime = step.waiting_time ? (step.waiting_time / 60).toFixed(2) : '0'
          const distance = step.distance ? (step.distance / 1000).toFixed(2) : '0'
          const duration = step.duration ? (step.duration / 60).toFixed(2) : '0'

          csvRows.push([
            stepIndex + 1,
            step.location?.name || step.location_id || 'Unknown',
            step.type || 'Unknown',
            arrivalTime,
            departureTime,
            serviceTime,
            waitingTime,
            distance,
            duration
          ])
        })

        // Convert to CSV string
        const csvContent = csvRows.map(row =>
          row.map(cell => `"${cell}"`).join(',')
        ).join('\n')

        // Add to zip with vehicle ID as filename
        zip.file(`${vehicleId}.csv`, csvContent)
      })

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedResultForDownload.title || 'routes'}_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error downloading CSV:', error)
      alert('Failed to download CSV files')
    } finally {
      handleDownloadMenuClose()
    }
  }

  const handleDownloadJSON = async () => {
    if (!selectedResultForDownload) return

    try {
      // Fetch the full result data if not already available
      let resultData = selectedResultForDownload
      if (!resultData.response_data) {
        const response = await fetch(`/api/optimization-results?job_id=${encodeURIComponent(selectedResultForDownload.job_id)}`)
        if (response.ok) {
          resultData = await response.json()
        } else {
          throw new Error('Failed to fetch result data')
        }
      }

      // Create JSON content
      const jsonContent = JSON.stringify(resultData.response_data, null, 2)

      // Create and download the JSON file
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedResultForDownload.title || 'routes'}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error downloading JSON:', error)
      alert('Failed to download JSON file')
    } finally {
      handleDownloadMenuClose()
    }
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
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar currentPage="analysis" />

        {/* Main Content Area */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: 'var(--sidebar-width, 280px)',
          transition: 'margin-left 0.3s ease'
        }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CompanyLogo height={60} variant="header" />
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ color: '#333', fontWeight: 'bold', fontSize: '1.1rem' }}
                >
                  {t('analysis.pageTitle')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isAdmin && (
                  <Typography
                    variant="caption"
                    sx={{
                      backgroundColor: companyColor,
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
                <LanguageSwitcher />
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
                  {t('analysis.logout')}
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
                        {t('analysis.pageTitle')}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666' }}>
                        {t('analysis.pageDescription')}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Analysis Cards */}
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      backgroundColor: '#ff9800',
                      borderRadius: '50%',
                      color: 'white',
                      mr: 2
                    }}>
                      <SpeedIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', fontWeight: 'bold' }}>
                      {t('analysis.averageSpeed')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h1" sx={{ fontWeight: 'bold', color: '#ff9800', fontSize: '2.5rem' }}>
                      {summaryStats.avgSpeed}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {t('analysis.kmh')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      backgroundColor: '#2196f3',
                      borderRadius: '50%',
                      color: 'white',
                      mr: 2
                    }}>
                      <RouteIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', fontWeight: 'bold' }}>
                      {t('analysis.totalRoutes')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h1" sx={{ fontWeight: 'bold', color: '#2196f3', fontSize: '2.5rem' }}>
                      {summaryStats.totalRoutes}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {t('analysis.optimizationPlans')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      backgroundColor: '#9c27b0',
                      borderRadius: '50%',
                      color: 'white',
                      mr: 2
                    }}>
                      <LocalGasStationIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', fontWeight: 'bold' }}>
                      {t('analysis.averageGallonsPerRoute')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h1" sx={{ fontWeight: 'bold', color: '#9c27b0', fontSize: '2.5rem' }}>
                      {summaryStats.avgGallonsPerRoute.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {t('analysis.gallons')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      backgroundColor: '#f44336',
                      borderRadius: '50%',
                      color: 'white',
                      mr: 2
                    }}>
                      <CancelIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', fontWeight: 'bold' }}>
                      {t('analysis.unassignedJobs')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h1" sx={{ fontWeight: 'bold', color: '#f44336', fontSize: '2.5rem' }}>
                      {summaryStats.totalUnassignedJobs}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {t('analysis.jobs')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      backgroundColor: '#4caf50',
                      borderRadius: '50%',
                      color: 'white',
                      mr: 2
                    }}>
                      <StopIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', fontWeight: 'bold' }}>
                      {t('analysis.averageStopsPerRoute')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h1" sx={{ fontWeight: 'bold', color: '#4caf50', fontSize: '2.5rem' }}>
                      {summaryStats.avgStopsPerRoute}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {t('analysis.stops')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      backgroundColor: '#ff5722',
                      borderRadius: '50%',
                      color: 'white',
                      mr: 2
                    }}>
                      <StraightenIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', fontWeight: 'bold' }}>
                      {t('analysis.averageDistancePerRoute')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h1" sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: '2.5rem' }}>
                      {formatDistance(summaryStats.avgDistancePerRoute)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {t('analysis.km')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      backgroundColor: '#795548',
                      borderRadius: '50%',
                      color: 'white',
                      mr: 2
                    }}>
                      <AccessTimeIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', fontWeight: 'bold' }}>
                      {t('analysis.totalWaitingTime')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h1" sx={{ fontWeight: 'bold', color: '#795548', fontSize: '2.5rem' }}>
                      {formatDuration(summaryStats.totalWaitingTime)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {t('analysis.time')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      backgroundColor: '#607d8b',
                      borderRadius: '50%',
                      color: 'white',
                      mr: 2
                    }}>
                      <BuildIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', fontWeight: 'bold' }}>
                      {t('analysis.averageServiceTimePerRoute')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h1" sx={{ fontWeight: 'bold', color: '#607d8b', fontSize: '2.5rem' }}>
                      {formatDuration(summaryStats.avgServiceTimePerRoute)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {t('analysis.time')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Optimization Results */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <HistoryIcon sx={{ fontSize: 32, color: companyColor }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {t('analysis.optimizationHistory')}
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
                        {t('analysis.noResults')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        {t('analysis.noResultsDescription')}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
                      {/* Left: Summary Table and KPIs */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>{t('analysis.title')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{t('analysis.status')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{t('analysis.solutionTime')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{t('analysis.createdAt')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{t('analysis.actions')}</TableCell>
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
                                  hover
                                  onClick={() => {
                                    // Disable row click if any title is being edited
                                    if (editingTitle !== null) {
                                      return;
                                    }

                                    // If the panel is already open for this result, close it
                                    if (selectedJobId === result.job_id) {
                                      setSelectedResult(null)
                                      setSelectedJobId(null)
                                    } else {
                                      // Otherwise, open the panel for this result
                                      handleViewResult(result.job_id)
                                    }
                                  }}
                                  style={{
                                    cursor: editingTitle !== null ? 'default' : 'pointer',
                                    opacity: editingTitle !== null ? 0.6 : 1
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
                                            cursor: editingTitle !== null ? 'default' : 'pointer',
                                            opacity: editingTitle !== null ? 0.6 : 1,
                                            '&:hover': {
                                              color: editingTitle !== null ? 'inherit' : '#666'
                                            }
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation() // Prevent row click from firing

                                            // Disable title click if any title is being edited
                                            if (editingTitle !== null) {
                                              return;
                                            }

                                            // If the panel is already open for this result, close it
                                            if (selectedJobId === result.job_id) {
                                              setSelectedResult(null)
                                              setSelectedJobId(null)
                                            } else {
                                              // Otherwise, open the panel for this result
                                              handleViewResult(result.job_id)
                                            }
                                          }}
                                        >
                                          {result.title}
                                        </Typography>
                                        <Button
                                          size="small"
                                          onClick={() => handleEditTitle(result)}
                                          sx={{ minWidth: 'auto', p: 0.5 }}
                                        >
                                          <EditIcon sx={{ fontSize: 27 }} />
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
                                      {result.solution_time ? `${result.solution_time.toFixed(2)}s` : 'N/A'}
                                    </Typography>
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
                                          {t('analysis.map')}
                                        </Button>
                                      )}
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        onClick={(e) => handleDownloadClick(e, result)}
                                        sx={{ textTransform: 'none' }}
                                      >
                                        {t('analysis.download')}
                                      </Button>
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
                                          {t('analysis.delete')}
                                        </Button>
                                      )}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>

                      {/* Right: Expandable Details Panel */}
                      {selectedResult && (
                        <Box
                          sx={{
                            width: { xs: '100%', sm: 750, md: 900 },
                            maxWidth: '90vw',
                            minWidth: 480,
                            boxShadow: 4,
                            bgcolor: 'background.paper',
                            borderLeft: '1px solid #e0e0e0',
                            p: 3,
                            position: 'fixed',
                            top: 80, // Move panel up to start just below the header
                            right: 0,
                            zIndex: 10,
                            overflowY: 'auto',
                            height: 'calc(100vh - 80px)', // Adjust height to account for top offset
                            transition: 'all 0.3s',
                          }}
                        >
                          {/* Close button at top right */}
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedResult(null)
                              setSelectedJobId(null)
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 11,
                              minWidth: '80px',
                              px: 2,
                              py: 1,
                              fontSize: '0.875rem',
                              textTransform: 'none'
                            }}
                          >
                            {t('analysis.close')}
                          </Button>

                          {/* Loading state */}
                          {loadingDetails ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                              <CircularProgress />
                            </Box>
                          ) : (
                            <>
                              {/* Details content */}
                              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                {t('analysis.optimizationResultDetails')}
                              </Typography>
                              {/* Basic Information */}
                              <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {t('analysis.title')}:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                                    {selectedResult.title}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {t('analysis.jobId')}:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                                    {selectedResult.id}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {t('analysis.status')}:
                                  </Typography>
                                  <Typography variant="body2" sx={{ mb: 2 }}>
                                    {selectedResult.status}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {t('analysis.createdAt')}:
                                  </Typography>
                                  <Typography variant="body2" sx={{ mb: 2 }}>
                                    {formatDate(selectedResult.created_at)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {t('analysis.routesFound')}:
                                  </Typography>
                                  <Typography variant="body2" sx={{ mb: 2 }}>
                                    {selectedResult.response_data?.result?.routes?.length || 0}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {t('analysis.solutionTime')}:
                                  </Typography>
                                  <Typography variant="body2" sx={{ mb: 2 }}>
                                    {selectedResult.solution_time ? `${selectedResult.solution_time.toFixed(2)} ${t('analysis.seconds')}` : 'N/A'}
                                  </Typography>
                                </Grid>
                              </Grid>

                              {/* Route Details Table */}
                              {selectedResult?.response_data?.result?.routes && (
                                <Box sx={{ mt: 3 }}>
                                  <Typography variant="h6" sx={{ mb: 2, color: companyColor, fontWeight: 'bold' }}>
                                    {t('analysis.routeDetails')}
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

                              {/* KPI Calculations */}
                              {(() => {
                                const kpis = calculateKPIs(selectedResult.response_data)
                                if (!kpis) return null
                                return (
                                  <>
                                    {/* Fuel Delivery KPIs */}
                                    <Typography variant="h6" sx={{ mb: 2, mt: 4, color: companyColor, fontWeight: 'bold' }}>
                                      {t('analysis.fuelDeliveryMetrics')}
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                      <Grid item xs={12} md={2}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {kpis.ulsdClearDelivered.toLocaleString()}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.ulsdClear')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} md={2}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {kpis.ulsdDyedDelivered.toLocaleString()}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.ulsdDyed')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} md={2}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {kpis.unlDelivered.toLocaleString()}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.unl')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} md={2}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {kpis.gasUnlPreDelivered.toLocaleString()}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.gasUnlPre')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} md={2}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {kpis.rec90Delivered.toLocaleString()}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.rec90')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} md={2}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {kpis.totalFuel.toLocaleString()}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.totalFuel')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                      <Grid item xs={12} md={3}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {kpis.avgFuelPerRoute.toFixed(0)}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.avgPerRoute')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    </Grid>

                                    {/* Operational Efficiency KPIs */}
                                    <Typography variant="h6" sx={{ mb: 2, mt: 3, color: companyColor, fontWeight: 'bold' }}>
                                      {t('analysis.operationalEfficiency')}
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                      <Grid item xs={12} md={3}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {formatDistance(kpis.totalDistance)}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.totalDistance')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} md={3}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {formatDuration(kpis.totalDuration)}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.totalDuration')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} md={3}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {formatDuration(kpis.totalService)}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.totalService')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} md={3}>
                                        <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, textAlign: 'center' }}>
                                          <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold' }}>
                                            {formatDuration(kpis.totalWaiting)}
                                          </Typography>
                                          <Typography variant="body1" sx={{ color: '#666' }}>
                                            {t('analysis.totalWaiting')}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </>
                                )
                              })()}
                            </>
                          )}
                        </Box>
                      )}
                    </Box>
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
            <Box sx={{ mt: 0, pt: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CompanyLogo height={40} variant="footer" />
              <Typography variant="body2" sx={{ color: '#999', fontSize: '14px' }}>
                powered by NextBillion.ai | Version 1.0.0 | Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Download Menu */}
      <Menu
        anchorEl={downloadMenuAnchor}
        open={Boolean(downloadMenuAnchor)}
        onClose={handleDownloadMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleDownloadCSV}>
          <ListItemIcon>
            <GetAppIcon fontSize="small" />
          </ListItemIcon>
          {t('analysis.downloadAsCsv')}
        </MenuItem>
        <MenuItem onClick={handleDownloadJSON}>
          <ListItemIcon>
            <GetAppIcon fontSize="small" />
          </ListItemIcon>
          {t('analysis.downloadAsJson')}
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: '#d32f2f' }}>
          {t('analysis.confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            {t('analysis.deleteConfirmation').replace('{title}', resultToDelete?.title || '')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            {t('analysis.deleteWarning')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            {t('analysis.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            {t('analysis.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </WhiteLabelLayout>
  )
} 