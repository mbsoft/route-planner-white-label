'use client'

import React, { useState } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material'
import {
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material'
import { useLanguage } from '../../contexts/language-context'

export function LanguageSwitcher() {
  const { language, setLanguage, t, renderKey } = useLanguage()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageChange = (newLanguage: 'en' | 'es-MX' | 'pt-BR' | 'ca-FR') => {
    setLanguage(newLanguage)
    setAnchorEl(null) // Close menu immediately
  }

  const getLanguageDisplayName = (lang: string) => {
    switch (lang) {
      case 'en':
        return t('language.english')
      case 'es-MX':
        return t('language.spanish')
      case 'pt-BR':
        return t('language.portuguese')
      case 'ca-FR':
        return t('language.frenchCanadian')
      default:
        return lang
    }
  }

  return (
    <Box key={`switcher-${language}-${renderKey}`}>
      <Button
        variant="outlined"
        size="small"
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={<ExpandMoreIcon />}
        sx={{ 
          height: '25px',
          fontSize: '0.75rem',
          textTransform: 'none',
          minWidth: 'auto',
          px: 1
        }}
      >
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          {getLanguageDisplayName(language)}
        </Typography>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted={false}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('en')}
          selected={language === 'en'}
        >
          <ListItemIcon>
            <Typography variant="body2">🇺🇸 🇨🇦</Typography>
          </ListItemIcon>
          <ListItemText primary={t('language.english')} />
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('ca-FR')}
          selected={language === 'ca-FR'}
        >
          <ListItemIcon>
            <Typography variant="body2">🇨🇦</Typography>
          </ListItemIcon>
          <ListItemText primary={t('language.frenchCanadian')} />
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('es-MX')}
          selected={language === 'es-MX'}
        >
          <ListItemIcon>
            <Typography variant="body2">🇲🇽</Typography>
          </ListItemIcon>
          <ListItemText primary={t('language.spanish')} />
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('pt-BR')}
          selected={language === 'pt-BR'}
        >
          <ListItemIcon>
            <Typography variant="body2">🇧🇷</Typography>
          </ListItemIcon>
          <ListItemText primary={t('language.portuguese')} />
        </MenuItem>

      </Menu>
    </Box>
  )
} 