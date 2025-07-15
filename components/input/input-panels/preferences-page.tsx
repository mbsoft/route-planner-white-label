import React, { useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { RoutingPanel, RoutingPreferences } from './routing-panel'
import { ConstraintsPanel, ConstraintsPreferences } from './constraints-panel'
import { ObjectivePanel, ObjectivePreferences } from './objective-panel'

export interface PreferencesInput {
  routing: {
    mode?: string
    traffic_timestamps?: string // Changed from number to string for datetime-local input
    truck_size?: string
    truck_weight?: number
    avoid?: string[]
  }
  constraints: {
    max_vehicle_overtime?: number
    max_visit_lateness?: number
    max_activity_waiting_time?: number
  }
  objective: {
    travel_cost?: string
    custom?: {
      type?: string
      value?: string
    }
  }
}

interface PreferencesPageProps {
  preferences: PreferencesInput
  onPreferencesChange: (preferences: PreferencesInput) => void
}



export function PreferencesPage({ preferences, onPreferencesChange }: PreferencesPageProps) {
  const handleRoutingChange = (routingPrefs: RoutingPreferences) => {
    onPreferencesChange({
      ...preferences,
      routing: routingPrefs.routing,
    })
  }

  const handleConstraintsChange = (constraintsPrefs: ConstraintsPreferences) => {
    onPreferencesChange({
      ...preferences,
      constraints: constraintsPrefs.constraints,
    })
  }

  const handleObjectiveChange = (objectivePrefs: ObjectivePreferences) => {
    onPreferencesChange({
      ...preferences,
      objective: objectivePrefs.objective,
    })
  }

  return (
    <Box
      sx={{
        paddingRight: '30%',
        position: 'relative',
        paddingBottom: '1px',
        paddingTop: '1px',
      }}
    >
      <Stack direction="column" spacing={'28px'}>
        <ObjectivePanel 
          preferences={{ objective: preferences.objective }}
          onPreferencesChange={handleObjectiveChange}
        />

        <ConstraintsPanel 
          preferences={{ constraints: preferences.constraints }}
          onPreferencesChange={handleConstraintsChange}
        />

        <RoutingPanel 
          preferences={{ routing: preferences.routing }}
          onPreferencesChange={handleRoutingChange}
        />
      </Stack>
    </Box>
  )
} 