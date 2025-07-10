'use client'

import { useState } from 'react'
import { Box, IconButton, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { FileDropZone } from './file-drop-zone'
import { DataTable } from './data-table'
import { useInputStore } from '../../../models/input/store'
import { DataMapperTable } from '../data-mapper/data-mapper-table'
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  // Handler for delete with confirmation
  const handleDelete = () => setDeleteDialogOpen(true);
  const handleDeleteConfirm = () => {
    store.inputCore.setRawData('vehicle', { header: [], rows: [], attachedRows: [] });
    setDeleteDialogOpen(false);
  };
  const handleDeleteCancel = () => setDeleteDialogOpen(false);

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
          <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
            <IconButton onClick={() => store.inputCore.resetMapping('vehicle')} color="primary" title="Reset Mapping">
              <ReplayIcon />
            </IconButton>
            <IconButton onClick={() => store.inputCore.appendAttachedRows('vehicle')} color="primary" title="Add attribute">
              <AddIcon />
            </IconButton>
            {!isEditing && (
              <IconButton onClick={handleEdit} color="primary" title="Edit table">
                <EditIcon />
              </IconButton>
            )}
            {isEditing && (
              <>
                <IconButton onClick={handleSave} color="success" title="Save changes">
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancel} color="error" title="Cancel editing">
                  <CloseIcon />
                </IconButton>
              </>
            )}
            <IconButton onClick={handleDelete} color="error" title="Delete imported data">
              <DeleteIcon />
            </IconButton>
          </Box>
         {/* Delete confirmation dialog */}
         <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
           <DialogTitle>Are you sure?</DialogTitle>
           <DialogContent>
             <DialogContentText>
               This will delete all imported vehicle data. This action cannot be undone.
             </DialogContentText>
           </DialogContent>
           <DialogActions>
             <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
             <Button onClick={handleDeleteConfirm} color="error" variant="contained">Confirm</Button>
           </DialogActions>
         </Dialog>

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