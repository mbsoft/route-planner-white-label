'use client'

import React, { useEffect, useState } from 'react'
import { Box, Chip } from '@mui/material'
import { useMappingPersistence } from '../../hooks/input/use-mapping-persistence'
import { usePreferencesPersistence } from '../../hooks/use-preferences-persistence'
import { InputType } from '../../models/input/input-core'

export const MappingManagement: React.FC = () => {
  const { hasMapping } = useMappingPersistence()
  const { status: preferencesStatus, checkPreferencesStatus } = usePreferencesPersistence()

  // State for mapping status
  const [mappingStatus, setMappingStatus] = useState({
    job: { hasMapping: false, loading: true },
    vehicle: { hasMapping: false, loading: true },
    shipment: { hasMapping: false, loading: true },
  })

  // Refresh mapping status
  const refreshMappingStatus = async () => {
    const inputTypes: InputType[] = ['job', 'vehicle', 'shipment']
    for (const inputType of inputTypes) {
      setMappingStatus(prev => ({
        ...prev,
        [inputType]: { ...prev[inputType], loading: true },
      }))
      try {
        const exists = await hasMapping(inputType)
        setMappingStatus(prev => ({
          ...prev,
          [inputType]: { hasMapping: exists, loading: false },
        }))
      } catch {
        setMappingStatus(prev => ({
          ...prev,
          [inputType]: { hasMapping: false, loading: false },
        }))
      }
    }
  }

  // Refresh preferences status
  const refreshPreferencesStatus = async () => {
    await checkPreferencesStatus()
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshMappingStatus()
    }
  }, [hasMapping])

  // Refresh both mapping and preferences status when preferences status changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshMappingStatus()
      refreshPreferencesStatus()
    }
  }, [preferencesStatus.hasPreferences])

  const getStatusColor = (has: boolean, loading: boolean) => {
    if (loading) return 'default'
    return has ? 'success' : 'default'
  }
  const getStatusText = (has: boolean, loading: boolean, label: string) => {
    if (loading) return 'Loading...'
    if (!has) return label
    return label + ' ✓'
  }
  const preferences = preferencesStatus || { hasPreferences: false, loading: true }

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip
        label={getStatusText(mappingStatus.job.hasMapping, mappingStatus.job.loading, 'Jobs Map')}
        color={getStatusColor(mappingStatus.job.hasMapping, mappingStatus.job.loading)}
        size="small"
      />
      <Chip
        label={getStatusText(mappingStatus.vehicle.hasMapping, mappingStatus.vehicle.loading, 'Vehicles Map')}
        color={getStatusColor(mappingStatus.vehicle.hasMapping, mappingStatus.vehicle.loading)}
        size="small"
      />
      <Chip
        label={getStatusText(mappingStatus.shipment.hasMapping, mappingStatus.shipment.loading, 'Shipment Map')}
        color={getStatusColor(mappingStatus.shipment.hasMapping, mappingStatus.shipment.loading)}
        size="small"
      />
      <Chip
        label={getStatusText(preferences.hasPreferences, preferences.loading, 'Preferences')}
        color={getStatusColor(preferences.hasPreferences, preferences.loading)}
        size="small"
      />
    </Box>
  )
} 