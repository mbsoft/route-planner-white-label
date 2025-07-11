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
    setEditValue(e.target.value)
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

  const handleRepeatToAll = () => {
    console.log('Repeat button clicked, editValue:', editValue)
    if (editValue !== value) {
      onValueChange(editValue)
    }
    if (onRepeatToAll) {
      onRepeatToAll(editValue)
    }
  }

  const formatValue = (val: string) => {
    if (!val) return ''
    if (isTimestamp) {
      try {
        const date = new Date(val)
        if (!isNaN(date.getTime())) {
          return date.toLocaleString()
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
        </Box>
      )}
    </Box>
  )
} 