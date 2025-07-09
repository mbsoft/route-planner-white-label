import React from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  styled,
} from '@mui/material'
import { MenuInfo } from './mapping-config/options/interface'
import { Popover } from '@mui/material'

type MappingPopoverProps = {
  dataOptionMenuList: MenuInfo[]
  open: boolean
  anchorEl: HTMLElement | null
  onSelectDataMapOption: (option: MenuInfo) => void
  onClose: () => void
  currentMappings: Array<{ index: number; value: string }>
  currentColumnIndex: number
}

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: '12px',
  padding: '4px 8px',
  minHeight: '32px',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}))

const StyledListItem = styled(ListItem)(({ theme }) => ({
  fontSize: '12px',
  padding: '4px 8px',
  minHeight: '32px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}))

export default function MappingPopover({
  dataOptionMenuList,
  open,
  anchorEl,
  onSelectDataMapOption,
  onClose,
  currentMappings,
  currentColumnIndex,
}: MappingPopoverProps) {
  const handleOptionClick = (option: MenuInfo) => {
    onSelectDataMapOption(option)
  }

  // Filter out options that are already mapped to other columns
  const availableOptions = dataOptionMenuList.filter(option => {
    const existingMapping = currentMappings.find(mapping => mapping.value === option.value)
    // Allow if no mapping exists, or if it's mapped to the current column
    return !existingMapping || existingMapping.index === currentColumnIndex
  })

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          maxHeight: '400px',
          width: '300px',
        },
      }}
    >
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '14px', fontWeight: 'bold' }}>
          Select Field Type
        </Typography>
        <List dense>
          {availableOptions.map((option) => (
            <StyledListItem
              key={option.value}
              onClick={() => handleOptionClick(option)}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <ListItemText
                primary={option.label}
                secondary={option.required ? 'Required' : undefined}
                primaryTypographyProps={{ 
                  fontSize: '12px',
                  color: option.required ? 'error.main' : 'inherit'
                }}
                secondaryTypographyProps={{ fontSize: '10px', color: 'error.main' }}
              />
              {option.required && (
                <Typography variant="caption" color="error" sx={{ fontSize: '10px' }}>
                  *
                </Typography>
              )}
            </StyledListItem>
          ))}
        </List>
      </Box>
    </Popover>
  )
} 