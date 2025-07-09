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
      backgroundColor: '#23272f',
      borderRadius: '8px',
      padding: '6px 10px',
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
      minWidth: isExpanded ? '150px' : 'auto',
      color: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <Stack spacing={0.5}>
        {/* Header with expand/collapse button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          minHeight: '28px',
        }} onClick={() => setIsExpanded(!isExpanded)}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'white', px: 0 }}>
            Map Options
          </Typography>
          <IconButton 
            size="small" 
            sx={{ 
              padding: '2px',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' }
            }}
          >
            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
        {/* Collapsible content */}
        <Box sx={{ 
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          maxHeight: isExpanded ? '100px' : '0px',
          opacity: isExpanded ? 1 : 0,
        }}>
          <Stack spacing={0.5}>
            <Card sx={{ boxShadow: 'none', backgroundColor: 'transparent', m: 0, p: 0 }}>
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
                label={<span style={{ fontSize: '12px', color: 'white' }}>Jobs/Shipments</span>}
                sx={{ 
                  fontSize: '12px',
                  m: 0,
                  '& .MuiFormControlLabel-label': { fontSize: '12px', color: 'white' }
                }}
              />
            </Card>
            <Card sx={{ boxShadow: 'none', backgroundColor: 'transparent', m: 0, p: 0 }}>
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
                label={<span style={{ fontSize: '12px', color: 'white' }}>Vehicles</span>}
                sx={{ 
                  fontSize: '12px',
                  m: 0,
                  '& .MuiFormControlLabel-label': { fontSize: '12px', color: 'white' }
                }}
              />
            </Card>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
} 