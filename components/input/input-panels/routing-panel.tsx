import React from 'react'
import {
  Box,
  Grid,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  MenuItem,
  Chip,
  OutlinedInput,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import DirectionsIcon from '@mui/icons-material/Directions'
import {PreferencesPanel} from './preferences-panel'

const ROUTING_MODE_OPTIONS = [
  {label: 'Truck', value: 'truck'},
  {label: 'Car', value: 'car'},
]

const AVOID_OPTIONS = [
  {label: 'Toll Roads', value: 'toll'},
  {label: 'Highways', value: 'highway'},
  {label: 'Bounding Box', value: 'bbox'},
  {label: 'Left Turns', value: 'left_turn'},
  {label: 'Right Turns', value: 'right_turn'},
  {label: 'None', value: 'none'},
]

const HAZMAT_OPTIONS = [
  {label: 'General Hazardous Materials', value: 'general'},
  {label: 'Circumstantial Hazardous Materials', value: 'circumstantial'},
  {label: 'Explosive Materials', value: 'explosive'},
  {label: 'Harmful to Water', value: 'harmful_to_water'},
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
    avoid?: string[]
    hazmat_type?: string[]
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

  const setAvoids = (value: string[]) => {
    onPreferencesChange({
      ...preferences,
      routing: {
        ...routing,
        avoid: value,
      },
    })
  }

  const setHazmatTypes = (value: string[]) => {
    onPreferencesChange({
      ...preferences,
      routing: {
        ...routing,
        hazmat_type: value,
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

        {/* Hazardous Material Types - Only show for truck mode */}
        {routing.mode === 'truck' && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Hazardous Material Types</InputLabel>
                <Select
                  multiple
                  value={routing.hazmat_type || []}
                  onChange={(e) => setHazmatTypes(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label="Hazardous Material Types" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const option = HAZMAT_OPTIONS.find(opt => opt.value === value)
                        return (
                          <Chip 
                            key={value} 
                            label={option?.label || value} 
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(255, 152, 0, 0.1)',
                              color: '#ff9800',
                              '& .MuiChip-deleteIcon': {
                                color: '#ff9800',
                              }
                            }}
                          />
                        )
                      })}
                    </Box>
                  )}
                >
                  {HAZMAT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Route Avoidances</InputLabel>
              <Select
                multiple
                value={routing.avoid || []}
                onChange={(e) => setAvoids(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Route Avoidances" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const option = AVOID_OPTIONS.find(opt => opt.value === value)
                      return (
                        <Chip 
                          key={value} 
                          label={option?.label || value} 
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(211, 103, 132, 0.1)',
                            color: '#d36784',
                            '& .MuiChip-deleteIcon': {
                              color: '#d36784',
                            }
                          }}
                        />
                      )
                    })}
                  </Box>
                )}
              >
                {AVOID_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </PreferencesPanel>
  )
} 