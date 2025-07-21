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
import { useWhiteLabelContext } from '../../app/white-label-layout'
import { useLanguage } from '../../contexts/language-context'

export const PreferencesManagement: React.FC = () => {
  const { status, clearPreferences, checkPreferencesStatus } = usePreferencesPersistence()
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { hasPreferences, loading } = status
  const store = useInputStore()
  const { isAdmin } = useAuth()
  const { companyColor } = useWhiteLabelContext()
  const { t } = useLanguage()

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
          onClick={() => setSaveDialogOpen(true)}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : null}
          sx={{
            minWidth: '140px',
            padding: '8px 16px',
            fontSize: '14px',
            textTransform: 'none',
            borderColor: companyColor,
            color: companyColor,
            '&:hover': {
              borderColor: companyColor,
              backgroundColor: `${companyColor}0A`,
            },
            '&:disabled': {
              borderColor: '#ccc',
              color: '#ccc',
            }
          }}
        >
          {t('routePlanning.saveMappings')}
        </Button>
      )}
      {isAdmin && hasPreferences && (
        <Button
          variant="outlined"
          color="error"
          onClick={() => setClearDialogOpen(true)}
          disabled={loading}
          sx={{
            minWidth: '140px',
            padding: '8px 16px',
            fontSize: '14px',
            textTransform: 'none',
            borderColor: '#d32f2f',
            color: '#d32f2f',
            '&:hover': {
              borderColor: '#d32f2f',
              backgroundColor: '#d32f2f0A',
            },
            '&:disabled': {
              borderColor: '#ccc',
              color: '#ccc',
            }
          }}
        >
          {t('routePlanning.clearPreferences')}
        </Button>
      )}
      
      {/* Save Mappings Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>{t('routePlanning.saveMappingsTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{t('routePlanning.saveMappingsDescription')}</strong>
            <br />
            {t('routePlanning.saveMappingsDetails')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={saving}>
            {t('routePlanning.cancel')}
          </Button>
          <Button 
            onClick={handleSaveMappings} 
            color="primary" 
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {t('routePlanning.saveMappings')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Preferences Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>{t('routePlanning.clearPreferencesTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{t('routePlanning.clearPreferencesDescription')}</strong>
            <br />
            {t('routePlanning.clearPreferencesDetails')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} disabled={loading}>
            {t('routePlanning.cancel')}
          </Button>
          <Button 
            onClick={handleClearPreferences} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {t('routePlanning.clearPreferences')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 