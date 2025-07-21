'use client'

import { useState } from 'react'
import { Box, IconButton, Typography, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { FileDropZone } from './file-drop-zone'
import { DataTable } from './data-table'
import { useInputStore } from '../../../models/input/store'
import { useUseCase } from '../../../utils/use-case'
import { DataMapperTable } from '../data-mapper/data-mapper-table'
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { DatabaseDataManager } from '../database-data-manager';
import { useWhiteLabelContext } from '../../../app/white-label-layout'
import { useLanguage } from '../../../contexts/language-context';

export const InputJobUpload = () => {
  const { t } = useLanguage();
  const store = useInputStore()
  const useCase = useUseCase()
  const inputType = useCase === 'jobs' ? 'job' : 'shipment'
  const orderTypeLabel = useCase === 'jobs' ? 'Job' : 'Shipment'
  const { companyColor } = useWhiteLabelContext()

  // Check if CSV import is enabled
  const enableCsvImport = process.env.NEXT_PUBLIC_ENABLE_CSV_IMPORT === 'true'

  const handleDataUpload = (header: string[], data: string[][]) => {
    store.inputCore.setRawData(inputType, {
      header,
      rows: data,
      attachedRows: [],
    })
    // Clear original jobs since this is CSV data, not database data
    setOriginalJobs([])
  }

  const getSampleLink = () => {
    return useCase === 'jobs'
      ? 'https://static.nextbillion.io/ncc/route-planner-v2/data/job_sample_data.zip'
      : 'https://static.nextbillion.io/ncc/route-planner-v2/data/shipment_sample_data.zip'
  }

  const currentData = store.inputCore[inputType].rawData
  const hasData = currentData.rows.length > 0

  // Handler for delete with confirmation
  const handleDelete = () => setDeleteDialogOpen(true);
  const handleDeleteConfirm = () => {
    store.inputCore.setRawData(inputType, { header: [], rows: [], attachedRows: [] });
    setDeleteDialogOpen(false);
  };
  const handleDeleteCancel = () => setDeleteDialogOpen(false);

  // Batch editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editRows, setEditRows] = useState<string[][]>([])
  const [editAttachedRows, setEditAttachedRows] = useState<string[][]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [originalJobs, setOriginalJobs] = useState<any[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Start editing: copy current data
  const handleEdit = () => {
    setEditRows(currentData.rows.map(row => [...row]))
    setEditAttachedRows(currentData.attachedRows.map(row => [...row]))
    setIsEditing(true)
  }
  // Cancel editing: discard changes
  const handleCancel = () => {
    setIsEditing(false)
    setEditRows([])
    setEditAttachedRows([])
  }
  // Save editing: commit to store and database if applicable
  const handleSave = async () => {
    console.log('=== JOB SAVE BUTTON CLICKED ===')
    console.log('originalJobs.length:', originalJobs.length)
    console.log('editRows:', editRows)
    console.log('editAttachedRows:', editAttachedRows)
    console.log('currentData.header:', currentData.header)
    
    setIsSaving(true)
    try {
      // Create combined header that includes both original columns and attached columns
      const combinedHeader = [
        ...currentData.header,
        ...editAttachedRows[0]?.map((_, index) => `Attribute ${index + 1}`) || []
      ]
      
      console.log('Combined header:', combinedHeader)
      
      // First update the local store with the combined header
      store.inputCore.setRawData(inputType, {
        header: combinedHeader,
        rows: editRows,
        attachedRows: editAttachedRows,
      })
      
      // If we have original jobs (from database), save changes back to database
      if (originalJobs.length > 0) {
        console.log('Saving jobs to database...')
        // Convert edited rows back to job objects using the combined header
        const updatedJobs = editRows.map((row, index) => {
          const jobObj: any = { id: originalJobs[index].id }
          combinedHeader.forEach((header: string, colIndex: number) => {
            jobObj[header] = row[colIndex] || null
          })
          return jobObj
        })
        
        console.log('Updated jobs to send:', updatedJobs)
        
        // Send updates to database
        const response = await fetch('/api/jobs', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobs: updatedJobs }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to save changes to database')
        }
        
        const result = await response.json()
        console.log('Database update result:', result)
        
        // Update original jobs with the new data
        setOriginalJobs(updatedJobs)
      } else {
        console.log('No original jobs found - not saving to database')
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

  // Handler for deleting an attribute column
  const handleDeleteAttributeColumn = (colIndex: number) => {
    if (isEditing) {
      setEditAttachedRows(prev => prev.map(row => row.filter((_, i) => i !== colIndex)))
    } else {
      store.inputCore.deleteAttachedColumn(inputType, colIndex)
    }
  }

  // Handler for database import for jobs
  const handleDatabaseJobsImported = async (jobs: any[]) => {
    console.log('Database jobs imported:', jobs)
    if (!jobs || jobs.length === 0) return;
    // Fetch schema from API
    let header: string[] = [];
    try {
      const schemaRes = await fetch('/api/jobs/schema');
      if (schemaRes.ok) {
        const schemaData = await schemaRes.json();
        header = schemaData.columns || Object.keys(jobs[0]);
      } else {
        header = Object.keys(jobs[0]);
      }
    } catch (e) {
      header = Object.keys(jobs[0]);
    }
    // Map each row to the full header
    const rows = jobs.map(job => header.map(h => job[h] ?? ''));
    store.inputCore.setRawData(inputType, {
      header,
      rows,
      attachedRows: [],
    });
    setOriginalJobs(jobs)
    console.log('Original jobs set:', jobs)
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
          {useCase === 'jobs' ? t('dataImport.importJobData') : t('dataImport.importShipmentData')}
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
            {/* Database import panel for jobs */}
            {useCase === 'jobs' && (
              <DatabaseDataManager onJobsImported={handleDatabaseJobsImported} />
            )}
            {/* CSV import panel - only show if enabled */}
            {enableCsvImport && (
              <FileDropZone onDataUpload={handleDataUpload} sampleLink={getSampleLink()} />
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
              <Typography variant="h6" sx={{ color: companyColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: 22, lineHeight: 1, color: '#43a047' }}>✓</span> {currentData.rows.length} records loaded
                {originalJobs.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                    (from database)
                  </span>
                )}
              </Typography>
            </Box>
            {/* Batch editing controls */}
            <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => store.inputCore.resetMapping(inputType)} color="primary" title="Reset Mapping">
                <ReplayIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton onClick={() => store.inputCore.addAttachedColumn(inputType)} color="primary" title="Add attribute">
                <AddIcon sx={{ fontSize: 20 }} />
              </IconButton>
              {!isEditing && (
                <IconButton onClick={handleEdit} color="primary" title="Edit table" disabled={isSaving}>
                  <EditIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              {isEditing && (
                <>
                  <IconButton onClick={handleSave} color="success" title="Save changes" disabled={isSaving}>
                    {isSaving ? <CircularProgress size={20} /> : <SaveIcon sx={{ fontSize: 20 }} />}
                  </IconButton>
                  <IconButton onClick={handleCancel} color="error" title="Cancel editing" disabled={isSaving}>
                    <CloseIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </>
              )}
              <IconButton onClick={handleDelete} color="error" title="Delete imported data">
                <DeleteIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
            {/* Editable table */}
            <DataMapperTable
              inputType={inputType}
              isEditing={isEditing}
              highlightCell={null}
              onCellChange={handleCellChange}
              onRepeatToAll={handleRepeatToAll}
              onDeleteAttributeColumn={handleDeleteAttributeColumn}
              rows={isEditing ? editRows : currentData.rows}
              attachedRows={isEditing ? editAttachedRows : currentData.attachedRows}
              header={currentData.header}
            />
          </Box>
        )
      }
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete all imported {orderTypeLabel} data? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
