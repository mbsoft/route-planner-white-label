'use client'

import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useInputStore } from '../../models/input/store'
import { InputType } from '../../models/input/input-core'

const tabs: { key: InputType; label: string }[] = [
  { key: 'job', label: 'Jobs & Shipments' },
  { key: 'vehicle', label: 'Vehicles' },
]

export const InputTabs = () => {
  const store = useInputStore()
  const { activeTab, setActiveTab } = store.inputCore
  const { job, vehicle, shipment } = store.inputCore

  const hasJobData = job.rawData.rows.length > 0
  const hasVehicleData = vehicle.rawData.rows.length > 0
  const hasShipmentData = shipment.rawData.rows.length > 0

  const getTabDataCount = (tab: InputType) => {
    switch (tab) {
      case 'job':
        return (hasJobData ? 1 : 0) + (hasShipmentData ? 1 : 0)
      case 'vehicle':
        return hasVehicleData ? 1 : 0
      default:
        return 0
    }
  }

  return (
    <Box sx={{ display: 'flex', borderBottom: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
      {tabs.map((tab) => {
        const dataCount = getTabDataCount(tab.key)
        const isActive = activeTab === tab.key
        
        return (
          <Button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            sx={{
              flex: 1,
              py: 2,
              px: 3,
              borderRadius: 0,
              borderBottom: isActive ? '2px solid #1976d2' : '2px solid transparent',
              backgroundColor: isActive ? '#fff' : 'transparent',
              color: isActive ? '#1976d2' : '#666',
              fontWeight: isActive ? 'bold' : 'normal',
              textTransform: 'none',
              fontSize: '14px',
              '&:hover': {
                backgroundColor: isActive ? '#fff' : '#e0e0e0',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">{tab.label}</Typography>
              {dataCount > 0 && (
                <Box
                  sx={{
                    backgroundColor: isActive ? '#1976d2' : '#999',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {dataCount}
                </Box>
              )}
            </Box>
          </Button>
        )
      })}
    </Box>
  )
} 