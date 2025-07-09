import React from 'react'
import {
  Box,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import GolfCourseOutlined from '@mui/icons-material/GolfCourseOutlined'
import {PreferencesPanel} from './preferences-panel'

const TRAVEL_COST_OPTIONS = [
  {label: 'None', value: 'none'},
  {label: 'Duration', value: 'duration'},
  {label: 'Distance', value: 'distance'},
  {label: 'Air Distance', value: 'air_distance'},
]

const CUSTOM_TYPE_OPTIONS = [
  {label: 'min', value: 'min'},
  {label: 'min-max', value: 'min-max'},
]

const MIN_CUSTOM_VALUE_OPTIONS = [
  {label: 'vehicles', value: 'vehicles'},
  {label: 'completed_time', value: 'completed_time'},
]

const MINMAX_CUSTOM_VALUE_OPTIONS_VEHICLES = [
  {label: 'tasks', value: 'tasks'},
  {label: 'travel_cost', value: 'travel_cost'},
]

export interface ObjectivePreferences {
  objective: {
    travel_cost?: string
    custom?: {
      type?: string
      value?: string
    }
  }
}

interface ObjectivePanelProps {
  preferences: ObjectivePreferences
  onPreferencesChange: (preferences: ObjectivePreferences) => void
}

export function ObjectivePanel({ preferences, onPreferencesChange }: ObjectivePanelProps) {
  const { objective } = preferences

  const setTravelCost = (value: string) => {
    onPreferencesChange({
      ...preferences,
      objective: {
        ...objective,
        travel_cost: value,
      },
    })
  }

  const toggleCustom = (value: boolean) => {
    if (objective.custom) {
      onPreferencesChange({
        ...preferences,
        objective: {
          ...objective,
          custom: undefined,
        },
      })
    } else {
      onPreferencesChange({
        ...preferences,
        objective: {
          ...objective,
          custom: {
            type: CUSTOM_TYPE_OPTIONS[0].value,
            value: MIN_CUSTOM_VALUE_OPTIONS[0].value,
          },
        },
      })
    }
  }

  const setCustomType = (value: string) => {
    let customValue
    if (value === CUSTOM_TYPE_OPTIONS[0].value) {
      customValue = MIN_CUSTOM_VALUE_OPTIONS[0].value
    } else if (value === CUSTOM_TYPE_OPTIONS[1].value) {
      customValue = MINMAX_CUSTOM_VALUE_OPTIONS_VEHICLES[0].value
    }
    onPreferencesChange({
      ...preferences,
      objective: {
        ...objective,
        custom: { type: value, value: customValue },
      },
    })
  }

  const setCustomValue = (value: string) => {
    onPreferencesChange({
      ...preferences,
      objective: {
        ...objective,
        custom: { type: objective.custom?.type, value },
      },
    })
  }

  return (
    <PreferencesPanel
      icon={<GolfCourseOutlined />}
      title="Set Your Objective"
      description="Optimize based on duration, distance, or a custom objective"
    >
      <Box>
        <Box sx={{display: 'flex', gap: 2, mt: 2}}>
          <TextField
            label="Travel Cost"
            value={objective.travel_cost || 'none'}
            onChange={(e) => {
              if (e.target.value === 'none') {
                setTravelCost('')
              } else {
                setTravelCost(e.target.value)
              }
            }}
            variant="outlined"
            select
            sx={{width: 200}}
            size="small"
          >
            {TRAVEL_COST_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={!!objective.custom}
              onChange={(e) => toggleCustom(e.target.checked)}
              color="primary"
            />
          }
          label="Custom Optimization Criteria"
        />

        {!!objective.custom && (
          <Box sx={{display: 'flex', gap: 2, mt: 1}}>
            <TextField
              label="Type"
              value={objective.custom?.type}
              onChange={(e) => setCustomType(e.target.value)}
              select
              sx={{width: 200}}
              size="small"
            >
              {CUSTOM_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {objective.custom?.type === CUSTOM_TYPE_OPTIONS[0].value && (
              <TextField
                label="Value"
                value={objective.custom?.value}
                onChange={(e) => setCustomValue(e.target.value)}
                select
                size="small"
                sx={{width: 200}}
              >
                {MIN_CUSTOM_VALUE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {objective.custom?.type === CUSTOM_TYPE_OPTIONS[1].value && (
              <TextField
                label="Value"
                value={objective.custom?.value}
                onChange={(e) => setCustomValue(e.target.value)}
                select
                size="small"
                sx={{width: 200}}
              >
                {MINMAX_CUSTOM_VALUE_OPTIONS_VEHICLES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        )}
      </Box>
    </PreferencesPanel>
  )
} 