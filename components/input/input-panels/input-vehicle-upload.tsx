'use client'

import { useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { FileDropZone } from './file-drop-zone'
import { DataTable } from './data-table'
import { useInputStore } from '../../../models/input/store'

export const InputVehicleUpload = () => {
  const store = useInputStore()
  const { vehicle } = store.inputCore
  const hasData = vehicle.rawData.rows.length > 0

  const handleDataUpload = (header: string[], data: string[][]) => {
    store.inputCore.setRawData('vehicle', {
      header,
      rows: data,
      attachedRows: [],
    })
  }

  const handleClearData = () => {
    store.inputCore.setRawData('vehicle', {
      header: [],
      rows: [],
      attachedRows: [],
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <h3
          style={{
            color: '#585656',
            fontSize: '16px',
            marginBottom: '13px',
            fontWeight: '500',
          }}
        >
          Import Vehicle Fleet Data
        </h3>
        {hasData && (
          <IconButton
            onClick={handleClearData}
            sx={{
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.04)',
              },
            }}
            title="Delete imported data"
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      {!hasData ? (
        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <FileDropZone
            onDataUpload={handleDataUpload}
            sampleLink="https://static.nextbillion.io/ncc/route-planner-v2/data/vehicle_sample_data.zip"
          />
        </div>
      ) : (
        <Box
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#f8f9fa',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              ✓ Vehicle Data Imported
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {vehicle.rawData.rows.length} records loaded
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Your vehicle fleet data has been successfully imported. 
            You can now proceed to the mapping step or click the delete icon above to remove the data and upload a different file.
          </Typography>
        </Box>
      )}

      {/* Remove DataTable rendering here */}
    </div>
  )
} 