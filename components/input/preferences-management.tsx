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

export const PreferencesManagement: React.FC = () => {
  const { status, clearPreferences, checkPreferencesStatus } = usePreferencesPersistence()
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const { hasPreferences, loading } = status

  // Refresh preferences status on mount and after clearing
  useEffect(() => {
    checkPreferencesStatus()
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

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
      {hasPreferences && (
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