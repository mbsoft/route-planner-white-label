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
import { useWhiteLabelContext } from '../../../app/white-label-layout'

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
  {label: 'Class 1 (Explosives)', value: 'class_1', internalValues: ['circumstantial', 'general', 'explosive']},
  {label: 'Class 2 (Gas)', value: 'class_2', internalValues: ['circumstantial', 'general', 'explosive']},
  {label: 'Class 3 (Flammable Liquid)', value: 'class_3', internalValues: ['circumstantial', 'general', 'explosive', 'harmful_to_water']},
  {label: 'Class 4 (Flammable Gas)', value: 'class_4', internalValues: ['circumstantial', 'general', 'explosive', 'harmful_to_water']},
  {label: 'Class 5 (Organic)', value: 'class_5', internalValues: ['circumstantial', 'general', 'explosive', 'harmful_to_water']},
  {label: 'Class 6 (Toxic)', value: 'class_6', internalValues: ['circumstantial', 'general', 'harmful_to_water']},
  {label: 'Class 7 (Radioactive)', value: 'class_7', internalValues: ['circumstantial', 'general', 'harmful_to_water']},
  {label: 'Class 8 (Corrosive)', value: 'class_8', internalValues: ['circumstantial', 'general', 'harmful_to_water']},
  {label: 'Class 9 (Other)', value: 'class_9', internalValues: ['circumstantial', 'general', 'harmful_to_water']},
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
    selected_hazmat_class?: string // Store the selected class for UI purposes
  }
}

interface RoutingPanelProps {
  preferences: RoutingPreferences
  onPreferencesChange: (preferences: RoutingPreferences) => void
}

export function RoutingPanel({ preferences, onPreferencesChange }: RoutingPanelProps) {
  const { routing } = preferences
  const { companyColor } = useWhiteLabelContext()

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

  const setHazmatTypes = (value: string | string[]) => {
    // Handle single selection - if it's a string, convert to array
    const selectedValues = Array.isArray(value) ? value : [value]
    
    // If no values selected, clear the setting
    if (selectedValues.length === 0) {
      onPreferencesChange({
        ...preferences,
        routing: {
          ...routing,
          hazmat_type: undefined,
          selected_hazmat_class: undefined,
        },
      })
      return
    }
    
    // Take only the first selected value (single selection)
    const selectedValue = selectedValues[0]
    
    // Map selected hazard class to its internal values
    const option = HAZMAT_OPTIONS.find(opt => opt.value === selectedValue)
    const internalValues = option?.internalValues || []
    
    onPreferencesChange({
      ...preferences,
      routing: {
        ...routing,
        hazmat_type: internalValues,
        selected_hazmat_class: selectedValue,
      },
    })
  }

  const isTruckSizeValid = !routing.truck_size || validateTruckSize(routing.truck_size)



  return (
    <PreferencesPanel
      icon={<DirectionsIcon sx={{ color: companyColor }} />}
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
                  border: '1px solid companyColor',
                  backgroundColor: 'transparent',
                  color: 'companyColor',
                },
                '&:hover': {
                  border: '1px solid companyColor',
                  color: 'companyColor',
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

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
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
                            color: 'companyColor',
                            '& .MuiChip-deleteIcon': {
                              color: 'companyColor',
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
          
          {/* Hazardous Material Types - Only show for truck mode */}
          {routing.mode === 'truck' && (
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Hazardous Material Types</InputLabel>
                <Select
                  value={routing.selected_hazmat_class || ''}
                  onChange={(e) => setHazmatTypes(e.target.value)}
                  input={<OutlinedInput label="Hazardous Material Types" />}
                  displayEmpty
                  renderValue={(selected: string) => {
                    if (!selected) {
                      return <span style={{ color: '#999' }}>Select hazard class...</span>
                    }
                    const option = HAZMAT_OPTIONS.find(opt => opt.value === selected)
                    return option?.label || selected
                  }}
                >
                  <MenuItem value="">
                    <em>Clear selection</em>
                  </MenuItem>
                  {HAZMAT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Box>
    </PreferencesPanel>
  )
} 