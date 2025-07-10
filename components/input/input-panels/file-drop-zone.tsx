'use client'

import {useEffect, useState} from 'react'
import {useFileDialog} from '../../../hooks/use-file-dialog'
import * as XLSX from 'xlsx'
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material'

type FileDropZoneProps = {
  onDataUpload: (header: string[], data: string[][]) => void
  sampleLink?: string
}

type WorksheetInfo = {
  name: string
  rowCount: number
  hasData: boolean
}

function isIncludeHeader(firstRow: string[]) {
  const isAnyNumLike = firstRow.some((item) => {
    if (typeof item === 'string') {
      return item.includes(',')
    }
    return !isNaN(parseFloat(item))
  })
  return !isAnyNumLike
}

// Function to parse CSV with proper quoted field handling
function parseCSV(csvText: string): string[][] {
  const rows: string[][] = []
  const lines = csvText.split('\n')
  
  for (const line of lines) {
    if (line.trim() === '') continue
    
    const fields: string[] = []
    let currentField = ''
    let insideQuotes = false
    let i = 0
    
    while (i < line.length) {
      const char = line[i]
      
      if (char === '"') {
        if (insideQuotes) {
          // Check for escaped quote (double quote)
          if (i + 1 < line.length && line[i + 1] === '"') {
            currentField += '"'
            i += 2 // Skip both quotes
            continue
          } else {
            // End of quoted field
            insideQuotes = false
          }
        } else {
          // Start of quoted field
          insideQuotes = true
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        fields.push(currentField.trim())
        currentField = ''
      } else {
        // Regular character
        currentField += char
      }
      
      i++
    }
    
    // Add the last field
    fields.push(currentField.trim())
    rows.push(fields)
  }
  
  return rows
}

// Function to get worksheet information from Excel file
function getWorksheetInfo(file: File): Promise<WorksheetInfo[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const worksheetInfo: WorksheetInfo[] = []
        
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
          
          const hasData = jsonData.length > 0 && jsonData.some(row => 
            row.length > 0 && row.some(cell => cell !== '' && cell !== null && cell !== undefined)
          )
          
          worksheetInfo.push({
            name: sheetName,
            rowCount: jsonData.length,
            hasData
          })
        }
        
        resolve(worksheetInfo)
      } catch (error) {
        reject(new Error('Error reading Excel file: ' + error))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

// Function to parse Excel files
function parseExcel(file: File, worksheetName?: string): Promise<{rows: string[][], worksheetName: string}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Use specified worksheet or find the first non-empty one
        let selectedSheetName = worksheetName || workbook.SheetNames[0]
        let worksheet = workbook.Sheets[selectedSheetName]
        
        // If no worksheet specified and first sheet is empty, try to find a non-empty sheet
        if (!worksheetName && (!worksheet || XLSX.utils.sheet_to_json(worksheet, { header: 1 }).length === 0)) {
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName]
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
            if (sheetData.length > 0 && sheetData.some(row => row.length > 0 && row.some(cell => cell !== ''))) {
              selectedSheetName = sheetName
              worksheet = sheet
              break
            }
          }
        }
        
        if (!worksheet) {
          reject(new Error('No data found in any worksheet'))
          return
        }
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
        
        // Convert all values to strings and filter out empty rows
        const rows = jsonData
          .map(row => row.map(cell => {
            // Handle different data types
            if (cell === null || cell === undefined) return ''
            if (typeof cell === 'number') return String(cell)
            if (typeof cell === 'boolean') return String(cell)
            if (cell instanceof Date) return cell.toISOString().split('T')[0] // Format as YYYY-MM-DD
            return String(cell)
          }))
          .filter(row => row.length > 0 && row.some(cell => cell !== ''))
        
        if (rows.length === 0) {
          reject(new Error('No data found in worksheet'))
          return
        }
        
        resolve({rows, worksheetName: selectedSheetName})
      } catch (error) {
        reject(new Error('Error reading Excel file: ' + error))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

export const FileDropZone = (props: FileDropZoneProps) => {
  const {onDataUpload, sampleLink} = props
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [importInfo, setImportInfo] = useState<string | null>(null)
  const [showWorksheetDialog, setShowWorksheetDialog] = useState(false)
  const [worksheetInfo, setWorksheetInfo] = useState<WorksheetInfo[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  async function handleFileUpload(file: File) {
    setError(null)
    setIsLoading(true)
    setImportInfo(null)
    
    try {
      const fileType = file.type
      const fileName = file.name.toLowerCase()
      
      // Check file type by both MIME type and file extension
      const isCSV = fileType === 'text/csv' || fileName.endsWith('.csv')
      const isExcel = fileType === 'application/vnd.ms-excel' || 
                     fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     fileName.endsWith('.xlsx') || 
                     fileName.endsWith('.xls')
      
      if (!isCSV && !isExcel) {
        setError('Invalid file. Please upload a CSV, XLS or XLSX file.')
        return
      }

      if (isCSV) {
        // Handle CSV files
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error('Error reading CSV file'))
          reader.readAsText(file)
        })
        
        const rows = parseCSV(text)
        setImportInfo(`CSV file imported: ${rows.length} rows`)
        
        if (rows.length === 0) {
          setError('No data found in the file.')
          return
        }
        
        // Determine if first row is header
        if (isIncludeHeader(rows[0])) {
          const header = rows[0]
          const data = rows.slice(1).filter(row => row.length > 0 && row.some(cell => cell !== ''))
          onDataUpload(header, data)
        } else {
          const header = rows[0].map((item: string, index: number) => {
            return `Column_${index + 1}`
          })
          onDataUpload(header, rows.filter(row => row.length > 0 && row.some(cell => cell !== '')))
        }
      } else {
        // Handle Excel files
        const worksheets = await getWorksheetInfo(file)
        const validWorksheets = worksheets.filter(ws => ws.hasData)
        
        if (validWorksheets.length === 0) {
          setError('No data found in any worksheet.')
          return
        }
        
        if (validWorksheets.length === 1) {
          // Only one worksheet with data, import it directly
          await importExcelWorksheet(file, validWorksheets[0].name)
        } else {
          // Multiple worksheets, show selection dialog
          setWorksheetInfo(validWorksheets)
          setCurrentFile(file)
          setShowWorksheetDialog(true)
        }
      }
    } catch (error) {
      setError('Error reading file: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  async function importExcelWorksheet(file: File, worksheetName: string) {
    try {
      const result = await parseExcel(file, worksheetName)
      const rows = result.rows
      
      setImportInfo(`Excel file imported from worksheet "${worksheetName}": ${rows.length} rows`)
      
      // Determine if first row is header
      if (isIncludeHeader(rows[0])) {
        const header = rows[0]
        const data = rows.slice(1).filter(row => row.length > 0 && row.some(cell => cell !== ''))
        onDataUpload(header, data)
      } else {
        const header = rows[0].map((item: string, index: number) => {
          return `Column_${index + 1}`
        })
        onDataUpload(header, rows.filter(row => row.length > 0 && row.some(cell => cell !== '')))
      }
    } catch (error) {
      setError('Error importing worksheet: ' + (error as Error).message)
    }
  }

  const handleWorksheetSelect = async (worksheetName: string) => {
    if (currentFile) {
      setShowWorksheetDialog(false)
      setIsLoading(true)
      await importExcelWorksheet(currentFile, worksheetName)
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const {files, openFileDialog} = useFileDialog(() => {}, {
    multiple: false,
    accept: '.csv,.xls,.xlsx',
  })

  useEffect(() => {
    if (files && files.length > 0) {
      const file = files[0]
      handleFileUpload(file)
    }
  }, [files])

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: '100%',
          borderRadius: '8px',
          padding: '5.5px',
          textAlign: 'center',
          color: '#5A5A5A',
          cursor: isLoading ? 'wait' : 'pointer',
          border: isDragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
          backgroundColor: isDragOver ? 'rgba(25, 118, 210, 0.1)' : '#f9f9f9',
          transition: 'all 0.2s ease',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        <div style={{
          fontSize: '33.6px', // 48px * 0.7
          marginBottom: '10px',
          color: '#1976d2'
        }}>
          {isLoading ? '⏳' : '📁'}
        </div>
        
        <div style={{
          fontSize: '15px', // 21px * 0.7
          fontWeight: '500',
          color: '#2A3249',
          marginBottom: '10px'
        }}>
          {isLoading ? (
            'Processing file...'
          ) : (
            <>
              Drag and drop a file (CSV, Excel) or{' '}
              <span
                onClick={() => !isLoading && openFileDialog()}
                style={{
                  cursor: isLoading ? 'wait' : 'pointer',
                  color: '#1976d2',
                  textDecoration: 'underline',
                }}
              >
                Browse for file
              </span>
            </>
          )}
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '10px'
        }}>
          Supported formats: CSV, XLS, XLSX
        </div>

        {importInfo && (
          <div style={{
            marginTop: '10px',
            color: '#5A5A5A',
            fontSize: '14px'
          }}>
            {importInfo}
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '10px',
            color: 'red',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Worksheet Selection Dialog */}
      <Dialog open={showWorksheetDialog} onClose={() => setShowWorksheetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Worksheet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This Excel file contains multiple worksheets. Please select which one to import:
          </Typography>
          <List>
            {worksheetInfo.map((worksheet) => (
              <ListItem key={worksheet.name} disablePadding>
                <ListItemButton onClick={() => handleWorksheetSelect(worksheet.name)}>
                  <ListItemText
                    primary={worksheet.name}
                    secondary={`${worksheet.rowCount} rows`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWorksheetDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  )
} 