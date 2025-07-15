'use client'

import { useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
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

export const InputJobUpload = () => {
  const store = useInputStore()
  const useCase = useUseCase()
  const inputType = useCase === 'jobs' ? 'job' : 'shipment'
  const orderTypeLabel = useCase === 'jobs' ? 'Job' : 'Shipment'

  // Check if CSV import is enabled
  const enableCsvImport = process.env.NEXT_PUBLIC_ENABLE_CSV_IMPORT === 'true'

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

  // Batch editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editRows, setEditRows] = useState<string[][]>([])
  const [editAttachedRows, setEditAttachedRows] = useState<string[][]>([])

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
  // Save editing: commit to store
  const handleSave = () => {
    store.inputCore.setRawData(inputType, {
      header: currentData.header,
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

  // Handler for deleting an attribute column
  const handleDeleteAttributeColumn = (colIndex: number) => {
    if (isEditing) {
      setEditAttachedRows(prev => prev.map(row => row.filter((_, i) => i !== colIndex)))
    } else {
      store.inputCore.deleteAttachedColumn(inputType, colIndex)
    }
  }

  // Handler for database import for jobs
  const handleDatabaseJobsImported = (jobs: any[]) => {
    // Convert jobs to the format expected by setRawData
    if (!jobs || jobs.length === 0) return;
    const header = Object.keys(jobs[0]);
    const rows = jobs.map(job => header.map(h => job[h] ?? ''));
    store.inputCore.setRawData(inputType, {
      header,
      rows,
      attachedRows: [],
    });
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
          Import {orderTypeLabel} Data
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
              <Typography variant="h6" sx={{ color: '#d36784', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: 22, lineHeight: 1, color: '#43a047' }}>✓</span> {currentData.rows.length} records loaded
              </Typography>
            </Box>
            {/* Batch editing controls */}
            <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => store.inputCore.resetMapping(inputType)} color="primary" title="Reset Mapping">
                <ReplayIcon />
              </IconButton>
              <IconButton onClick={() => store.inputCore.addAttachedColumn(inputType)} color="primary" title="Add attribute">
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
              <IconButton onClick={handleClearData} color="error" title="Delete imported data">
                <DeleteIcon />
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
    </div>
  )
}
