'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material'
import { usePreferencesPersistence } from '../../hooks/use-preferences-persistence'
import { useInputStore } from '../../models/input/store'
import { mappingPersistence } from '../../utils/mapping-persistence'
import { useAuth } from '../../hooks/use-auth'

export const PreferencesManagement: React.FC = () => {
  const { status, clearPreferences, checkPreferencesStatus } = usePreferencesPersistence()
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { hasPreferences, loading } = status
  const store = useInputStore()
  const { isAdmin } = useAuth()

  // Refresh preferences status on mount and after clearing (only on client side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkPreferencesStatus()
    }
  }, [checkPreferencesStatus])

  const handleClearPreferences = async () => {
    try {
      await clearPreferences()
      setClearDialogOpen(false)
      // Refresh status after clearing to ensure UI updates
      await checkPreferencesStatus()
    } catch (error) {
      console.error('Failed to clear preferences:', error)
    }
  }

  const handleSaveMappings = async () => {
    setSaving(true)
    try {
      // Save Jobs Map data
      if (store.inputCore.job.mapConfig.dataMappings.length > 0) {
        await mappingPersistence.saveMapping('job', store.inputCore.job.mapConfig)
      }
      
      // Save Vehicles Map data
      if (store.inputCore.vehicle.mapConfig.dataMappings.length > 0) {
        await mappingPersistence.saveMapping('vehicle', store.inputCore.vehicle.mapConfig)
      }
      
      setSaveDialogOpen(false)
      console.log('Mappings saved successfully')
    } catch (error) {
      console.error('Failed to save mappings:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
      {isAdmin && (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => setSaveDialogOpen(true)}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          Save Mappings
        </Button>
      )}
      {isAdmin && hasPreferences && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => setClearDialogOpen(true)}
          disabled={loading}
        >
          Clear Preferences
        </Button>
      )}
      
      {/* Save Mappings Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Mappings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Save current mapping configurations?</strong>
            <br />
            This will save the current Jobs Map and Vehicles Map configurations to persistent storage. This will overwrite any previously saved mappings.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveMappings} 
            color="primary" 
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            Save Mappings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Preferences Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear Preferences</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Are you sure?</strong>
            <br />
            This will permanently delete all saved optimization preferences from your browser's local storage. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleClearPreferences} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            Clear Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 