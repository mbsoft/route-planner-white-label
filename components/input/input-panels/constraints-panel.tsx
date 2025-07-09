import React from 'react'
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
} from '@mui/material'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import {PreferencesPanel} from './preferences-panel'

export interface ConstraintsPreferences {
  constraints: {
    max_vehicle_overtime?: number
    max_visit_lateness?: number
    max_activity_waiting_time?: number
  }
}

interface ConstraintsPanelProps {
  preferences: ConstraintsPreferences
  onPreferencesChange: (preferences: ConstraintsPreferences) => void
}

export function ConstraintsPanel({ preferences, onPreferencesChange }: ConstraintsPanelProps) {
  const { constraints } = preferences

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

  return (
    <PreferencesPanel
      icon={<TimerOutlinedIcon />}
      title="Specify Constraints"
      description="Defines rules for overtime, delays, and wait times to optimize routing efficiency."
    >
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="Max overtime allowed"
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
          <Grid item xs={4}>
            <TextField
              label="Max allowed delay"
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
          <Grid item xs={4}>
            <TextField
              label="Max Pause Between Tasks"
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
        </Grid>
      </Box>
    </PreferencesPanel>
  )
} 