import React from 'react'
import {
  Box,
  Grid,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from '@mui/material'
import RouteOutlined from '@mui/icons-material/RouteOutlined'
import {PreferencesPanel} from './preferences-panel'

const ROUTING_MODE_OPTIONS = [
  {label: 'Truck', value: 'truck'},
  {label: 'Car', value: 'car'},
]

const validateTruckSize = (value: string) => {
  const regex = new RegExp(
    '^(\\s?)+\\d+(\\s?)+,(\\s?)+\\d+(\\s?)+,(\\s?)+\\d+(\\s?)+$',
  )
  return regex.test(value)
}

export interface RoutingPreferences {
  routing: {
    mode?: string
    traffic_timestamps?: number
    truck_size?: string
    truck_weight?: number
  }
}

interface RoutingPanelProps {
  preferences: RoutingPreferences
  onPreferencesChange: (preferences: RoutingPreferences) => void
}

export function RoutingPanel({ preferences, onPreferencesChange }: RoutingPanelProps) {
  const { routing } = preferences

  const setTransportMode = (value: string) => {
    if (value === 'truck') {
      onPreferencesChange({
        ...preferences,
        routing: {
          ...routing,
          mode: value,
          truck_size: '',
          truck_weight: 0,
        },
      })
    } else {
      onPreferencesChange({
        ...preferences,
        routing: {
          ...routing,
          mode: value,
          truck_size: '',
          truck_weight: 0,
        },
      })
    }
  }

  const setTrafficTimestamps = (value: number) => {
    onPreferencesChange({
      ...preferences,
      routing: {
        ...routing,
        traffic_timestamps: value,
      },
    })
  }

  const setTruckSize = (value: string) => {
    onPreferencesChange({
      ...preferences,
      routing: {
        ...routing,
        truck_size: value,
      },
    })
  }

  const setTruckWeight = (value: number) => {
    onPreferencesChange({
      ...preferences,
      routing: {
        ...routing,
        truck_weight: value,
      },
    })
  }

  const isTruckSizeValid = !routing.truck_size || validateTruckSize(routing.truck_size)

  return (
    <PreferencesPanel
      icon={<RouteOutlined />}
      title="Routing Configuration"
      description="Defines travel mode and traffic considerations, ensuring accurate ETAs and efficient routing."
    >
      <Box>
        <ToggleButtonGroup
          value={routing.mode || 'car'}
          exclusive
          onChange={(e, value) => setTransportMode(value)}
          sx={{mb: 3}}
        >
          {ROUTING_MODE_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              value={option.value}
              sx={{
                px: 4,
                py: 1,
                color: 'text.secondary',
                border: '1px solid #e0e0e0',
                '&.Mui-selected': {
                  border: '1px solid #1E55DE',
                  backgroundColor: 'transparent',
                  color: '#1E55DE',
                },
                '&:hover': {
                  border: '1px solid #1E55DE',
                  color: '#1E55DE',
                },
              }}
            >
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="Traffic timestamp (Unix timestamp)"
              type="number"
              value={routing.traffic_timestamps || ''}
              onChange={(e) => setTrafficTimestamps(Number(e.target.value))}
              size="small"
              fullWidth
              placeholder="e.g., 1640995200"
            />
          </Grid>
          {routing.mode === 'truck' && (
            <>
              <Grid item xs={4}>
                <TextField
                  label="Truck size"
                  error={!isTruckSizeValid}
                  helperText={!isTruckSizeValid ? 'Invalid truck size, e.g. 10,10,10' : ''}
                  placeholder="height,width,length"
                  value={routing.truck_size || ''}
                  onChange={(e) => setTruckSize(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Truck weight"
                  type="number"
                  value={routing.truck_weight || ''}
                  onChange={(e) => setTruckWeight(Number(e.target.value))}
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </PreferencesPanel>
  )
} 