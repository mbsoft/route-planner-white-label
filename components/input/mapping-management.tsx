'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useMappingPersistence } from '../../hooks/input/use-mapping-persistence'
import { InputType } from '../../models/input/input-core'

interface MappingStatus {
  hasMapping: boolean
  age: number | null
  loading: boolean
}

export const MappingManagement: React.FC = () => {
  const { hasMapping, getMappingAge, clearAllMappings, loadAllMappings } = useMappingPersistence()
  const [mappingStatus, setMappingStatus] = useState<Record<InputType, MappingStatus>>({
    job: { hasMapping: false, age: null, loading: true },
    vehicle: { hasMapping: false, age: null, loading: true },
    shipment: { hasMapping: false, age: null, loading: true },
  })
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load mapping status on mount
  useEffect(() => {
    const loadStatus = async () => {
      const inputTypes: InputType[] = ['job', 'vehicle', 'shipment']
      
      for (const inputType of inputTypes) {
        try {
          const [hasMappingResult, age] = await Promise.all([
            hasMapping(inputType),
            getMappingAge(inputType),
          ])
          
          setMappingStatus(prev => ({
            ...prev,
            [inputType]: {
              hasMapping: hasMappingResult,
              age,
              loading: false,
            },
          }))
        } catch (error) {
          console.error(`Failed to load status for ${inputType}:`, error)
          setMappingStatus(prev => ({
            ...prev,
            [inputType]: {
              hasMapping: false,
              age: null,
              loading: false,
            },
          }))
        }
      }
    }

    loadStatus()
  }, [hasMapping, getMappingAge])

  const handleClearAllMappings = async () => {
    setIsLoading(true)
    try {
      await clearAllMappings()
      // Reload status after clearing
      const inputTypes: InputType[] = ['job', 'vehicle', 'shipment']
      for (const inputType of inputTypes) {
        setMappingStatus(prev => ({
          ...prev,
          [inputType]: {
            hasMapping: false,
            age: null,
            loading: false,
          },
        }))
      }
      setClearDialogOpen(false)
    } catch (error) {
      console.error('Failed to clear mappings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReloadMappings = async () => {
    setIsLoading(true)
    try {
      await loadAllMappings()
      // Reload status after loading
      const inputTypes: InputType[] = ['job', 'vehicle', 'shipment']
      for (const inputType of inputTypes) {
        const [hasMappingResult, age] = await Promise.all([
          hasMapping(inputType),
          getMappingAge(inputType),
        ])
        
        setMappingStatus(prev => ({
          ...prev,
          [inputType]: {
            hasMapping: hasMappingResult,
            age,
            loading: false,
          },
        }))
      }
    } catch (error) {
      console.error('Failed to reload mappings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (inputType: InputType) => {
    const status = mappingStatus[inputType]
    if (status.loading) return 'default'
    return status.hasMapping ? 'success' : 'default'
  }

  const getStatusText = (inputType: InputType) => {
    const status = mappingStatus[inputType]
    if (status.loading) return 'Loading...'
    if (!status.hasMapping) return 'No mapping'
    if (status.age === null) return 'Saved'
    return `${status.age} day${status.age !== 1 ? 's' : ''} old`
  }

  const hasAnyMappings = Object.values(mappingStatus).some(status => status.hasMapping)

  return (
    <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px', mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
        Column Mapping Persistence
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          label={`Jobs: ${getStatusText('job')}`}
          color={getStatusColor('job')}
          size="small"
        />
        <Chip
          label={`Vehicles: ${getStatusText('vehicle')}`}
          color={getStatusColor('vehicle')}
          size="small"
        />
        <Chip
          label={`Shipments: ${getStatusText('shipment')}`}
          color={getStatusColor('shipment')}
          size="small"
        />
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Column mappings are automatically saved to your browser's local storage and will be restored when you return to the application.
      </Alert>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleReloadMappings}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          Reload Mappings
        </Button>
        
        {hasAnyMappings && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setClearDialogOpen(true)}
            disabled={isLoading}
          >
            Clear All Mappings
          </Button>
        )}
      </Box>

      {/* Clear All Mappings Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear All Mappings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all saved column mappings from your browser's local storage. 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleClearAllMappings} 
            color="error" 
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 