import React from 'react'
import {
  Box,
  Grid,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from '@mui/material'
import DirectionsIcon from '@mui/icons-material/Directions'
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
    traffic_timestamps?: string // Changed from number to string for datetime-local input
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

  const setTrafficTimestamps = (value: string) => {
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
      icon={<DirectionsIcon sx={{ color: '#d36784' }} />}
      title="Routing Configuration"
      description=""
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
                  border: '1px solid #d36784',
                  backgroundColor: 'transparent',
                  color: '#d36784',
                },
                '&:hover': {
                  border: '1px solid #d36784',
                  color: '#d36784',
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
              label="Traffic timestamp"
              type="datetime-local"
              value={routing.traffic_timestamps || ''}
              onChange={(e) => setTrafficTimestamps(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              helperText="When traffic conditions should be considered"
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