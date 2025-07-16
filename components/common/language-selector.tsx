'use client'

import React, { useState } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import {
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { locales, type Locale } from '../../i18n'

interface LanguageSelectorProps {
  currentLocale: Locale
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLocale }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('language')

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageChange = (locale: Locale) => {
    handleClose()
    
    // Remove the current locale from the pathname if it exists
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/'
    
    // Navigate to the new locale
    router.push(`/${locale}${pathWithoutLocale}`)
  }

  const getLanguageName = (locale: Locale) => {
    switch (locale) {
      case 'en':
        return t('english')
      case 'es-MX':
        return t('spanish')
      default:
        return locale
    }
  }

  const getLanguageFlag = (locale: Locale) => {
    switch (locale) {
      case 'en':
        return '🇺🇸'
      case 'es-MX':
        return '🇲🇽'
      default:
        return '🌐'
    }
  }

  return (
    <Box>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={<ExpandMoreIcon />}
        variant="outlined"
        size="small"
        sx={{
          minWidth: 'auto',
          px: 2,
          py: 0.5,
          fontSize: '0.75rem',
          textTransform: 'none',
          borderColor: 'rgba(0, 0, 0, 0.23)',
          color: 'rgba(0, 0, 0, 0.87)',
          '&:hover': {
            borderColor: 'rgba(0, 0, 0, 0.87)',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span style={{ fontSize: '14px' }}>{getLanguageFlag(currentLocale)}</span>
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
            {getLanguageName(currentLocale)}
          </Typography>
        </Box>
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
        PaperProps={{
          sx: {
            minWidth: 120,
            mt: 1,
          },
        }}
      >
        {locales.map((locale) => (
          <MenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            selected={locale === currentLocale}
            sx={{
              py: 1,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <span style={{ fontSize: '16px' }}>{getLanguageFlag(locale)}</span>
            </ListItemIcon>
            <ListItemText
              primary={getLanguageName(locale)}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: locale === currentLocale ? 'bold' : 'normal',
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
} 