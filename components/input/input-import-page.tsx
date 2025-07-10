'use client'

import React from 'react'
import { Box, Button, Typography, IconButton } from '@mui/material'
import { InputOrderPanel } from './input-panels/input-order'
import { InputVehiclePanel } from './input-panels/input-vehicle'
import { InputImportStepper } from './input-import-stepper'
import { PreferencesPage, PreferencesInput } from './input-panels/preferences-page'
import { useInputStore } from '../../models/input/store'
import { DataMapper } from './data-mapper/data-mapper'
import { useUseCase } from '../../utils/use-case'
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

const steps = [
  'Preferences',
  'Orders/Shipments',
  'Vehicles',
  'Review',
]

interface InputImportPageProps {
  currentStep: number
  onStepChange: (nextStep: number) => void
  preferences?: PreferencesInput
  onPreferencesChange?: (preferences: PreferencesInput) => void
}

export const InputImportPage = ({ currentStep, onStepChange, preferences, onPreferencesChange }: InputImportPageProps) => {
  const store = useInputStore()
  const { job, vehicle, shipment } = store.inputCore
  const useCase = useUseCase()
  const inputType = useCase === 'jobs' ? 'job' : 'shipment'
  const orderTypeLabel = useCase === 'jobs' ? 'Jobs' : 'Shipments'

  // Local editing state for jobs mapping
  const [isEditing, setIsEditing] = React.useState(false)
  const [editRows, setEditRows] = React.useState<string[][]>([])
  const [editAttachedRows, setEditAttachedRows] = React.useState<string[][]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Handlers for editing
  const handleEdit = () => {
    setEditRows(store.inputCore[inputType].rawData.rows.map(row => [...row]))
    setEditAttachedRows(store.inputCore[inputType].rawData.attachedRows.map(row => [...row]))
    setIsEditing(true)
  }
  const handleCancel = () => {
    setIsEditing(false)
    setEditRows([])
    setEditAttachedRows([])
  }
  const handleSave = () => {
    store.inputCore.setRawData(inputType, {
      header: store.inputCore[inputType].rawData.header,
      rows: editRows,
      attachedRows: editAttachedRows,
    })
    setIsEditing(false)
    setEditRows([])
    setEditAttachedRows([])
  }
  const handleCellChange = (row: number, col: number, value: string) => {
    setEditRows(prev => {
      const updated = prev.map(r => [...r])
      if (updated[row]) updated[row][col] = value
      return updated
    })
  }
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
    store.inputCore.setRawData(inputType, { header: [], rows: [], attachedRows: [] });
    setDeleteDialogOpen(false);
  };
  const handleDeleteCancel = () => setDeleteDialogOpen(false);

  // Only show mapping table in the relevant step
  const showMapping = (step: number) => {
    if (step === 1 && store.inputCore[inputType].rawData.rows.length > 0) return true
    if (step === 2 && vehicle.rawData.rows.length > 0) return true
    return false
  }

  // Render the main content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return preferences && onPreferencesChange ? (
          <PreferencesPage
            preferences={preferences}
            onPreferencesChange={onPreferencesChange}
          />
        ) : (
          <Box sx={{ p: 2 }}>
            <h3 style={{ color: '#585656', fontSize: '16px', fontWeight: 500 }}>Preferences</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Preferences step coming soon.</p>
          </Box>
        )
      case 1:
        // Jobs/Shipments step: show drag-drop if no data, otherwise show summary, icons, and mapping table
        if (store.inputCore[inputType].rawData.rows.length === 0) {
          return <InputOrderPanel />;
        }
        return (
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', background: '#fff', p: 4, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                ✓ {orderTypeLabel} Data Imported
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {store.inputCore[inputType].rawData.rows.length} records loaded
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
              Your {orderTypeLabel.toLowerCase()} data has been successfully imported. You can now proceed to the mapping step or click the delete icon above to remove the data and upload a different file.
            </Typography>
            {/* Icon toolbar and mapping table are rendered here */}
            <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => store.inputCore.resetMapping(inputType)} color="primary" title="Reset Mapping">
                <ReplayIcon />
              </IconButton>
              <IconButton onClick={() => store.inputCore.appendAttachedRows(inputType)} color="primary" title="Add attribute">
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
                  This will delete all imported data. This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
                <Button onClick={handleDeleteConfirm} color="error" variant="contained">Confirm</Button>
              </DialogActions>
            </Dialog>
            <Box sx={{ mt: 4 }}>
              <DataMapper
                headers={store.inputCore[inputType].rawData.header}
                rows={isEditing ? editRows : store.inputCore[inputType].rawData.rows}
                attachedRows={isEditing ? editAttachedRows : store.inputCore[inputType].rawData.attachedRows}
                inputType={inputType}
              />
            </Box>
          </Box>
        );
      case 2:
        return <InputVehiclePanel />
      case 3:
        return (
          <Box sx={{ p: 2 }}>
            <h3 style={{ color: '#585656', fontSize: '16px', fontWeight: 500 }}>Review & Optimize</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              All data has been imported and mapped. You can now review the data and proceed with route optimization.
            </p>
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <strong>{orderTypeLabel}:</strong> {store.inputCore[inputType].rawData.rows.length} records
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <strong>Vehicles:</strong> {vehicle.rawData.rows.length} records
              </Typography>
            </Box>
          </Box>
        )
      default:
        return null
    }
  }

  // Remove renderMapping and showMapping logic for jobs step, since mapping is now inside the card

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <InputImportStepper currentStep={currentStep} onStepChange={onStepChange} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderStepContent()}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            disabled={currentStep === 0}
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          >
            Back
          </Button>
          <Button
            variant="contained"
            disabled={currentStep === steps.length - 1}
            onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
} 