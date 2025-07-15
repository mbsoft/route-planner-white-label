'use client'

import { useState } from 'react'
import { Box, IconButton, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, TextField } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import StorageIcon from '@mui/icons-material/Storage'
import { FileDropZone } from './file-drop-zone'
import { DataTable } from './data-table'
import { useInputStore } from '../../../models/input/store'
import { DataMapperTable } from '../data-mapper/data-mapper-table'
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useCallback } from 'react';
import { VehicleDatabaseManager } from '../database-data-manager';

export const InputVehicleUpload = () => {
  
  const store = useInputStore()
  const { vehicle } = store.inputCore
  const hasData = vehicle.rawData.rows.length > 0
  const [isSaving, setIsSaving] = useState(false)
  const [originalVehicles, setOriginalVehicles] = useState<any[]>([])

  // Check if CSV import is enabled
  const enableCsvImport = process.env.NEXT_PUBLIC_ENABLE_CSV_IMPORT === 'true'

  const handleDataUpload = (header: string[], data: string[][]) => {
    store.inputCore.setRawData('vehicle', {
      header,
      rows: data,
      attachedRows: [],
    })
    // Clear original vehicles since this is CSV data, not database data
    setOriginalVehicles([])
  }

  // Handler for database import for vehicles
  const handleDatabaseVehiclesImported = (vehicles: any[]) => {
    // Convert vehicles to the format expected by setRawData
    if (!vehicles || vehicles.length === 0) return;
    const header = Object.keys(vehicles[0]);
    const rows = vehicles.map(vehicle => header.map(h => vehicle[h] ?? ''));
    store.inputCore.setRawData('vehicle', {
      header,
      rows,
      attachedRows: [],
    });
    // Store original vehicles for database updates
    setOriginalVehicles(vehicles)
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
    console.log('Cancel button clicked')
    setIsEditing(false)
    setEditRows([])
    setEditAttachedRows([])
  }
  // Save editing: commit to store and database if applicable
  const handleSave = async () => {
    
    setIsSaving(true)
    try {
      // First update the local store
      store.inputCore.setRawData('vehicle', {
        header: vehicle.rawData.header,
        rows: editRows,
        attachedRows: editAttachedRows,
      })
      
      // If we have original vehicles (from database), save changes back to database
      if (originalVehicles.length > 0) {
        // Convert edited rows back to vehicle objects
        const updatedVehicles = editRows.map((row, index) => {
          const vehicleObj: any = { id: originalVehicles[index].id }
          vehicle.rawData.header.forEach((header: string, colIndex: number) => {
            vehicleObj[header] = row[colIndex] || null
          })
          return vehicleObj
        })
        
        // Send updates to database
        const response = await fetch('/api/vehicles', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vehicles: updatedVehicles }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to save changes to database')
        }
        
        const result = await response.json()
        
        // Update original vehicles with the new data
        setOriginalVehicles(updatedVehicles)
      }
      
      setIsEditing(false)
      setEditRows([])
      setEditAttachedRows([])
    } catch (error) {
      console.error('Error saving changes:', error)
      // You could show an error message to the user here
    } finally {
      setIsSaving(false)
    }
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

  // Handler for deleting an attribute column
  const handleDeleteAttributeColumn = (colIndex: number) => {
    if (isEditing) {
      setEditAttachedRows(prev => prev.map(row => row.filter((_, i) => i !== colIndex)))
    } else {
      store.inputCore.deleteAttachedColumn('vehicle', colIndex)
    }
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Import Vehicle Data
        </h3>
      </Box>
      {
        !hasData ? (
          <div
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <VehicleDatabaseManager
              onVehiclesImported={handleDatabaseVehiclesImported}
            />
            {/* CSV import panel - only show if enabled */}
            {enableCsvImport && (
              <FileDropZone
                onDataUpload={handleDataUpload}
                sampleLink="https://static.nextbillion.io/ncc/route-planner-v2/data/vehicle_sample_data.zip"
              />
            )}
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
              <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: 22, lineHeight: 1, color: '#43a047' }}>✓</span> {vehicle.rawData.rows.length} records loaded
                {originalVehicles.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                    (from database)
                  </span>
                )}
              </Typography>
            </Box>
            {/* Batch editing controls */}
            <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => store.inputCore.resetMapping('vehicle')} color="primary" title="Reset Mapping">
                <ReplayIcon />
              </IconButton>
              <IconButton onClick={() => store.inputCore.addAttachedColumn('vehicle')} color="primary" title="Add attribute">
                <AddIcon />
              </IconButton>
              {!isEditing && (
                <IconButton onClick={handleEdit} color="primary" title="Edit table" disabled={isSaving}>
                  <EditIcon />
                </IconButton>
              )}
              {isEditing && (
                <>
                  <IconButton onClick={handleSave} color="success" title="Save changes" disabled={isSaving}>
                    {isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                  </IconButton>
                  <IconButton onClick={handleCancel} color="error" title="Cancel editing" disabled={isSaving}>
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
              onDeleteAttributeColumn={handleDeleteAttributeColumn}
              rows={isEditing ? editRows : vehicle.rawData.rows}
              attachedRows={isEditing ? editAttachedRows : vehicle.rawData.attachedRows}
              header={vehicle.rawData.header}
            />
          </Box>
        )
      }
    </div>
  )
} 