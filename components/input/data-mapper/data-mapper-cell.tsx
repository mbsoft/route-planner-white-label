import React, { useState, useRef, useEffect } from 'react'
import { Box, InputBase, IconButton, Tooltip } from '@mui/material'
import RepeatIcon from '@mui/icons-material/Repeat'

interface DataMapperCellProps {
  value: string
  isEditing: boolean
  isTimestamp: boolean
  onValueChange: (value: string) => void
  onRepeatToAll?: (value: string) => void // Only this action remains
}

export function DataMapperCell({
  value,
  isEditing,
  isTimestamp,
  onValueChange,
  onRepeatToAll,
}: DataMapperCellProps) {
  const [isEditingCell, setIsEditingCell] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)



  useEffect(() => {
    if (!isEditingCell) {
      setEditValue(value)
    }
  }, [value, isEditingCell])

  useEffect(() => {
    if (isEditingCell && inputRef.current) {
      inputRef.current.focus()
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select()
        }
      }, 0)
    }
  }, [isEditingCell])

  const handleDoubleClick = () => {
    if (isEditing) {
      setIsEditingCell(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = isTimestamp ? parseDateFromInput(e.target.value) : e.target.value
    setEditValue(newValue)
  }

  const handleInputBlur = () => {
    setIsEditingCell(false)
    if (editValue !== value) {
      onValueChange(editValue)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingCell(false)
      if (editValue !== value) {
        onValueChange(editValue)
      }
    } else if (e.key === 'Escape') {
      setIsEditingCell(false)
      setEditValue(value)
    }
  }

  const handleRepeatToAll = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const valueToRepeat = isEditingCell ? editValue : value
    if (onRepeatToAll) {
      onRepeatToAll(valueToRepeat)
    }
  }

  const formatValue = (val: string) => {
    if (!val) return ''
    if (isTimestamp) {
      try {
        const date = new Date(val)
        if (!isNaN(date.getTime())) {
          // Format in 24-hour format
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          return `${year}-${month}-${day} ${hours}:${minutes}`
        }
      } catch (e) {}
    }
    return val
  }

  const formatDateForInput = (val: string) => {
    if (!val) return ''
    if (isTimestamp) {
      try {
        const date = new Date(val)
        if (!isNaN(date.getTime())) {
          // Convert to YYYY-MM-DDTHH:mm:ss format for datetime-local input (24-hour format)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          const seconds = String(date.getSeconds()).padStart(2, '0')
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
        }
      } catch (e) {}
    }
    return val
  }

  const parseDateFromInput = (val: string) => {
    if (!val) return ''
    if (isTimestamp) {
      try {
        const date = new Date(val)
        if (!isNaN(date.getTime())) {
          return date.toISOString()
        }
      } catch (e) {}
    }
    return val
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '40px',
        padding: '0 8px',
        position: 'relative',
        '&:hover': {
          backgroundColor: '#f5f5f5',
        },
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditingCell ? (
        <>
          {isTimestamp ? (
            <input
              ref={inputRef}
              type="datetime-local"
              value={formatDateForInput(editValue)}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              aria-label="Edit datetime value"
              step="60"
              style={{
                flex: 1,
                fontSize: '12px',
                padding: '4px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: 'white',
                width: '100%',
              }}
            />
          ) : (
            <input
              ref={inputRef}
              value={editValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              aria-label="Edit cell value"
              style={{
                flex: 1,
                fontSize: '12px',
                padding: '0',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
              }}
            />
          )}
          {onRepeatToAll && (
            <Tooltip title="Repeat to all rows in this column">
              <IconButton
                size="small"
                onClick={handleRepeatToAll}
                sx={{ ml: 1, width: '20px', height: '20px' }}
              >
                <RepeatIcon sx={{ fontSize: '14px' }} />
              </IconButton>
            </Tooltip>
          )}
        </>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              fontSize: '12px',
              color: '#333',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {formatValue(value)}
          </Box>
          {onRepeatToAll && isEditing && (
            <Tooltip title="Repeat to all rows in this column">
              <IconButton
                size="small"
                onClick={handleRepeatToAll}
                sx={{ ml: 1, width: '20px', height: '20px' }}
              >
                <RepeatIcon sx={{ fontSize: '14px' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  )
} 