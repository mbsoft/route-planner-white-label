'use client'

import { useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { FileDropZone } from './file-drop-zone'
import { DataTable } from './data-table'
import { useInputStore } from '../../../models/input/store'
import { DataMapperTable } from '../data-mapper/data-mapper-table'

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

  // Batch editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editRows, setEditRows] = useState<string[][]>([])
  const [editAttachedRows, setEditAttachedRows] = useState<string[][]>([])

  // Start editing: copy current data
  const handleEdit = () => {
    setEditRows(vehicle.rawData.rows.map(row => [...row]))
    setEditAttachedRows(vehicle.rawData.attachedRows.map(row => [...row]))
    setIsEditing(true)
  }
  // Cancel editing: discard changes
  const handleCancel = () => {
    setIsEditing(false)
    setEditRows([])
    setEditAttachedRows([])
  }
  // Save editing: commit to store
  const handleSave = () => {
    store.inputCore.setRawData('vehicle', {
      header: vehicle.rawData.header,
      rows: editRows,
      attachedRows: editAttachedRows,
    })
    setIsEditing(false)
    setEditRows([])
    setEditAttachedRows([])
  }

  // Cell change handler for editing
  const handleCellChange = (row: number, col: number, value: string) => {
    setEditRows(prev => {
      const updated = prev.map(r => [...r])
      if (updated[row]) updated[row][col] = value
      return updated
    })
  }
  // Fill-down handler for editing
  const handleRepeatToAll = (row: number, col: number, value: string) => {
    setEditRows(prev => {
      const updated = prev.map(r => [...r])
      for (let i = 0; i < updated.length; i++) {
        updated[i][col] = value
      }
      return updated
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

          {/* Batch editing controls */}
          <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
            {!isEditing && (
              <IconButton onClick={handleEdit} color="primary" title="Edit table">
                <span role="img" aria-label="edit">✏️</span>
              </IconButton>
            )}
            {isEditing && (
              <>
                <IconButton onClick={handleSave} color="success" title="Save changes">
                  <span role="img" aria-label="save">💾</span>
                </IconButton>
                <IconButton onClick={handleCancel} color="error" title="Cancel editing">
                  <span role="img" aria-label="cancel">❌</span>
                </IconButton>
              </>
            )}
          </Box>

          {/* Editable table */}
          <DataMapperTable
            inputType="vehicle"
            isEditing={isEditing}
            highlightCell={null}
            onCellChange={handleCellChange}
            onRepeatToAll={handleRepeatToAll}
            rows={isEditing ? editRows : vehicle.rawData.rows}
            attachedRows={isEditing ? editAttachedRows : vehicle.rawData.attachedRows}
            header={vehicle.rawData.header}
          />
        </Box>
      )}
    </div>
  )
} 