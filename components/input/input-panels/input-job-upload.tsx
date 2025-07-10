'use client'

import { useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { FileDropZone } from './file-drop-zone'
import { DataTable } from './data-table'
import { useInputStore } from '../../../models/input/store'
import { useUseCase } from '../../../utils/use-case'

export const InputJobUpload = () => {
  const store = useInputStore()
  const useCase = useUseCase()
  const inputType = useCase === 'jobs' ? 'job' : 'shipment'
  const orderTypeLabel = useCase === 'jobs' ? 'Job' : 'Shipment'

  const handleDataUpload = (header: string[], data: string[][]) => {
    store.inputCore.setRawData(inputType, {
      header,
      rows: data,
      attachedRows: [],
    })
  }

  const getSampleLink = () => {
    return useCase === 'jobs'
      ? 'https://static.nextbillion.io/ncc/route-planner-v2/data/job_sample_data.zip'
      : 'https://static.nextbillion.io/ncc/route-planner-v2/data/shipment_sample_data.zip'
  }

  const currentData = store.inputCore[inputType].rawData
  const hasData = currentData.rows.length > 0

  const handleClearData = () => {
    store.inputCore.setRawData(inputType, {
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
          Upload {orderTypeLabel} Data
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
          <FileDropZone onDataUpload={handleDataUpload} sampleLink={getSampleLink()} />
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
              ✓ {orderTypeLabel}s Data Imported
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {currentData.rows.length} records loaded
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Your {orderTypeLabel.toLowerCase()}s data has been successfully imported. 
            You can now proceed to the mapping step or click the delete icon above to remove the data and upload a different file.
          </Typography>
        </Box>
      )}

      {/* Remove DataTable rendering here */}
    </div>
  )
} 