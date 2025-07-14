'use client'

import React from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { ViewList as ViewListIcon, Timeline as TimelineIcon } from '@mui/icons-material'

export type ViewMode = 'list' | 'timeline'

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  label?: string
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ 
  viewMode, 
  onViewModeChange, 
  label = 'View Mode' 
}) => {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null,
  ) => {
    if (newMode !== null) {
      onViewModeChange(newMode)
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666' }}>
        {label}:
      </Typography>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleChange}
        aria-label="view mode"
        size="small"
      >
        <ToggleButton value="list" aria-label="list view">
          <ViewListIcon sx={{ fontSize: 16, mr: 1 }} />
          List
        </ToggleButton>
        <ToggleButton value="timeline" aria-label="timeline view">
          <TimelineIcon sx={{ fontSize: 16, mr: 1 }} />
          Timeline
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
} 