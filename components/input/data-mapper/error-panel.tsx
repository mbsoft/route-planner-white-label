import React from 'react'
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material'
import { InputErrorInfo } from '../../../models/input/input-core'

interface ErrorPanelProps {
  errors: InputErrorInfo[]
  style?: React.CSSProperties
  onItemHover?: (errorInfo: { rowIndex: number; columnIndex: number } | null) => void
}

export default function ErrorPanel({ errors, style, onItemHover }: ErrorPanelProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '300px',
        maxHeight: '400px',
        overflow: 'auto',
        ...style,
      }}
    >
      <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle2" color="error">
          Validation Errors ({errors.length})
        </Typography>
      </Box>
      <List dense>
        {errors.map((error, index) => (
          <ListItem
            key={index}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
            onMouseEnter={() => onItemHover?.({ rowIndex: error.rowIndex, columnIndex: error.columnIndex })}
            onMouseLeave={() => onItemHover?.(null)}
          >
            <ListItemText
              primary={`Row ${error.rowIndex + 1}, Col ${error.columnIndex + 1}`}
              secondary={error.message}
              primaryTypographyProps={{ fontSize: '12px', fontWeight: 'bold' }}
              secondaryTypographyProps={{ fontSize: '11px' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
} 