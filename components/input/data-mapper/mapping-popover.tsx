import React, { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Divider,
  styled,
} from '@mui/material'
import { MenuInfo } from './mapping-config/options/interface'
import KeyboardArrowRightOutlined from '@mui/icons-material/KeyboardArrowRightOutlined'
import AddIcon from '@mui/icons-material/Add'
import { Popover } from '@mui/material'

type MappingPopoverProps = {
  dataOptionMenuList: MenuInfo[]
  open: boolean
  anchorEl: HTMLElement | null
  onSelectDataMapOption: (option: MenuInfo) => void
  onClose: () => void
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
}: MappingPopoverProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const cats: Record<string, MenuInfo[]> = {}
    
    dataOptionMenuList.forEach((option) => {
      const category = option.value.split('.')[0] || 'General'
      if (!cats[category]) {
        cats[category] = []
      }
      cats[category].push(option)
    })
    
    return cats
  }, [dataOptionMenuList])

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
  }

  const handleOptionClick = (option: MenuInfo) => {
    onSelectDataMapOption(option)
    setSelectedCategory(null)
  }

  const handleBackClick = () => {
    setSelectedCategory(null)
  }

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
        {!selectedCategory ? (
          // Main categories view
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '14px', fontWeight: 'bold' }}>
              Select Field Type
            </Typography>
            <List dense>
              {Object.keys(categories).map((category) => (
                <StyledListItem
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={category}
                    primaryTypographyProps={{ fontSize: '12px' }}
                  />
                  <KeyboardArrowRightOutlined sx={{ fontSize: '16px' }} />
                </StyledListItem>
              ))}
            </List>
          </Box>
        ) : (
          // Category options view
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StyledMenuItem onClick={handleBackClick} sx={{ minWidth: 'auto', p: 0 }}>
                <KeyboardArrowRightOutlined sx={{ fontSize: '16px', transform: 'rotate(180deg)' }} />
              </StyledMenuItem>
              <Typography variant="subtitle2" sx={{ ml: 1, fontSize: '14px', fontWeight: 'bold' }}>
                {selectedCategory}
              </Typography>
            </Box>
            <List dense>
              {categories[selectedCategory]?.map((option) => (
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
                    primaryTypographyProps={{ fontSize: '12px' }}
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
        )}
      </Box>
    </Popover>
  )
} 