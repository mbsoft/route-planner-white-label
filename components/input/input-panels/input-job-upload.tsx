'use client'

import { useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { FileDropZone } from './file-drop-zone'
import { DataTable } from './data-table'
import { useInputStore } from '../../../models/input/store'

const ORDER_TYPE_OPTIONS = [
  { label: 'Job (either pickup or delivery)', value: 'job' },
  { label: 'Shipment (both pickup & delivery)', value: 'shipment' },
]

export const InputJobUpload = () => {
  const [orderType, setOrderType] = useState<'job' | 'shipment'>('job')
  const store = useInputStore()

  const handleDataUpload = (header: string[], data: string[][]) => {
    const inputType = orderType === 'job' ? 'job' : 'shipment'
    store.inputCore.setRawData(inputType, {
      header,
      rows: data,
      attachedRows: [],
    })
  }

  const getSampleLink = () => {
    return orderType === 'job'
      ? 'https://static.nextbillion.io/ncc/route-planner-v2/data/job_sample_data.zip'
      : 'https://static.nextbillion.io/ncc/route-planner-v2/data/shipment_sample_data.zip'
  }

  const currentData = orderType === 'job' ? store.inputCore.job.rawData : store.inputCore.shipment.rawData
  const hasData = currentData.rows.length > 0

  const handleClearData = () => {
    const inputType = orderType === 'job' ? 'job' : 'shipment'
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
          Are you uploading a Job or a Shipment?
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

      <div
        style={{
          display: 'flex',
          marginBottom: '20px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {ORDER_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setOrderType(option.value as 'job' | 'shipment')}
            style={{
              flex: 1,
              padding: '10px 20px',
              border: 'none',
              backgroundColor: orderType === option.value ? '#1976d2' : '#f5f5f5',
              color: orderType === option.value ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

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
              ✓ {orderType === 'job' ? 'Jobs' : 'Shipments'} Data Imported
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {currentData.rows.length} records loaded
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Your {orderType === 'job' ? 'jobs' : 'shipments'} data has been successfully imported. 
            You can now proceed to the mapping step or click the delete icon above to remove the data and upload a different file.
          </Typography>
        </Box>
      )}

      {/* Remove DataTable rendering here */}
    </div>
  )
} 