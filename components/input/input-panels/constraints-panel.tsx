import React from 'react'
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
} from '@mui/material'
import GavelIcon from '@mui/icons-material/Gavel'
import {PreferencesPanel} from './preferences-panel'
import { useWhiteLabelContext } from '../../../app/white-label-layout'
import { useLanguage } from '../../../contexts/language-context'

export interface ConstraintsPreferences {
  constraints: {
    max_vehicle_overtime?: number
    max_visit_lateness?: number
    max_activity_waiting_time?: number
    driver_break_time?: number
    max_working_time?: number
  }
}

interface ConstraintsPanelProps {
  preferences: ConstraintsPreferences
  onPreferencesChange: (preferences: ConstraintsPreferences) => void
}

export function ConstraintsPanel({ preferences, onPreferencesChange }: ConstraintsPanelProps) {
  const { constraints } = preferences
  const { companyColor } = useWhiteLabelContext()
  const { t } = useLanguage()

  const setMaxOvertime = (value: number) => {
    onPreferencesChange({
      ...preferences,
      constraints: {
        ...constraints,
        max_vehicle_overtime: value,
      },
    })
  }

  const setMaxVisitLateness = (value: number) => {
    onPreferencesChange({
      ...preferences,
      constraints: {
        ...constraints,
        max_visit_lateness: value,
      },
    })
  }

  const setMaxActivityWaitingTime = (value: number) => {
    onPreferencesChange({
      ...preferences,
      constraints: {
        ...constraints,
        max_activity_waiting_time: value,
      },
    })
  }

  const setDriverBreakTime = (value: number) => {
    onPreferencesChange({
      ...preferences,
      constraints: {
        ...constraints,
        driver_break_time: value,
      },
    })
  }

  const setMaxWorkingTime = (value: number) => {
    onPreferencesChange({
      ...preferences,
      constraints: {
        ...constraints,
        max_working_time: value,
      },
    })
  }

  return (
    <PreferencesPanel
      icon={<GavelIcon sx={{ color: companyColor }} />}
      title={t('preferences.specifyConstraints')}
      description=""
    >
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              label={t('preferences.maxOvertimeAllowed')}
              type="number"
              value={constraints.max_vehicle_overtime || ''}
              onChange={(e) => setMaxOvertime(Number(e.target.value))}
              size="small"
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">sec</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label={t('preferences.maxAllowedDelay')}
              type="number"
              value={constraints.max_visit_lateness || ''}
              onChange={(e) => setMaxVisitLateness(Number(e.target.value))}
              size="small"
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">sec</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label={t('preferences.maxPauseBetweenTasks')}
              type="number"
              value={constraints.max_activity_waiting_time || ''}
              onChange={(e) => setMaxActivityWaitingTime(Number(e.target.value))}
              size="small"
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">sec</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label={t('preferences.driverBreakTime')}
              type="number"
              value={constraints.driver_break_time || ''}
              onChange={(e) => setDriverBreakTime(Number(e.target.value))}
              size="small"
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">sec</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label={t('preferences.maxWorkingTime')}
              type="number"
              value={constraints.max_working_time || 10}
              onChange={(e) => setMaxWorkingTime(Number(e.target.value))}
              size="small"
              fullWidth
              inputProps={{
                min: 1,
                max: 24
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </PreferencesPanel>
  )
} 