'use client'

import {useEffect, useState} from 'react'
import {useFileDialog} from '../../../hooks/use-file-dialog'

type FileDropZoneProps = {
  onDataUpload: (header: string[], data: string[][]) => void
  sampleLink?: string
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

export const FileDropZone = (props: FileDropZoneProps) => {
  const {onDataUpload, sampleLink} = props
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileUpload(file: File) {
    setError(null)
    const fileType = file.type

    if (
      fileType !== 'text/csv' &&
      fileType !== 'application/vnd.ms-excel' &&
      fileType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      setError('Invalid file. Please upload a CSV, XLS or XLSX file.')
      return
    }

    // For CSV files
    if (fileType === 'text/csv') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const rows = parseCSV(text)
          
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
          setError('Error reading CSV file')
        }
      }
      reader.readAsText(file)
    } else {
      // For XLS/XLSX files - simplified version
      setError('Excel files not yet supported. Please use CSV format.')
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
        cursor: 'pointer',
        border: isDragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
        backgroundColor: isDragOver ? 'rgba(25, 118, 210, 0.1)' : '#f9f9f9',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{
        fontSize: '48px',
        marginBottom: '10px',
        color: '#1976d2'
      }}>
        📁
      </div>
      
      <div style={{
        fontSize: '21px',
        fontWeight: '500',
        color: '#2A3249',
        marginBottom: '10px'
      }}>
        Drag and drop a file (CSV) or{' '}
        <span
          onClick={() => openFileDialog()}
          style={{
            cursor: 'pointer',
            color: '#1976d2',
            textDecoration: 'underline',
          }}
        >
          Browse for file
        </span>
      </div>
      


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
  )
} 