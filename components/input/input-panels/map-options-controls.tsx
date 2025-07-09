'use client'

import { Box, Card, Stack, Switch, FormControlLabel, Typography, IconButton } from '@mui/material'
import { useState } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

type MapOptionsControlsProps = {
  showJobMarkers: boolean
  showVehicleMarkers: boolean
  onShowJobMarkersChange: (showJobMarkers: boolean) => void
  onShowVehicleMarkersChange: (showVehicleMarkers: boolean) => void
}

export default function MapOptionsControls({
  showJobMarkers,
  showVehicleMarkers,
  onShowJobMarkersChange,
  onShowVehicleMarkersChange,
}: MapOptionsControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 10, 
      right: 10, 
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '8px',
      padding: '8px',
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      minWidth: isExpanded ? '200px' : 'auto'
    }}>
      <Stack spacing={1}>
        {/* Header with expand/collapse button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer'
        }} onClick={() => setIsExpanded(!isExpanded)}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666', px: 1 }}>
            Map Options
          </Typography>
          <IconButton 
            size="small" 
            sx={{ 
              padding: '2px',
              color: '#666',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
        
        {/* Collapsible content */}
        <Box sx={{ 
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          maxHeight: isExpanded ? '200px' : '0px',
          opacity: isExpanded ? 1 : 0
        }}>
          <Stack spacing={1}>
            <Card sx={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showJobMarkers}
                    size="small"
                    onChange={(ev) => {
                      onShowJobMarkersChange(ev.target.checked)
                    }}
                  />
                }
                label="Jobs/Shipments"
                sx={{ 
                  fontSize: '12px',
                  '& .MuiFormControlLabel-label': { fontSize: '12px' }
                }}
              />
            </Card>
            <Card sx={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showVehicleMarkers}
                    size="small"
                    onChange={(ev) => {
                      onShowVehicleMarkersChange(ev.target.checked)
                    }}
                  />
                }
                label="Vehicles"
                sx={{ 
                  fontSize: '12px',
                  '& .MuiFormControlLabel-label': { fontSize: '12px' }
                }}
              />
            </Card>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
} 