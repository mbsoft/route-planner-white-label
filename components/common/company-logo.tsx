'use client'

import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useWhiteLabelContext } from '../../app/white-label-layout'

interface CompanyLogoProps {
  height?: number | string
  width?: string
  showText?: boolean
  variant?: 'header' | 'footer' | 'sidebar'
  style?: React.CSSProperties
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  height = 60,
  width = 'auto',
  showText = true,
  variant = 'header',
  style = {}
}) => {
  const { companyLogo, companyName, companyColor } = useWhiteLabelContext()
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const getTextStyles = () => {
    const baseStyles = {
      fontWeight: 'bold',
      color: companyColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    }

    switch (variant) {
      case 'header':
        return {
          ...baseStyles,
          fontSize: typeof height === 'number' ? Math.max(12, height * 0.3) : '1.2rem',
          minHeight: height,
          width: width,
        }
      case 'footer':
        return {
          ...baseStyles,
          fontSize: typeof height === 'number' ? Math.max(10, height * 0.4) : '0.875rem',
          minHeight: height,
          width: width,
        }
      case 'sidebar':
        return {
          ...baseStyles,
          fontSize: typeof height === 'number' ? Math.max(14, height * 0.35) : '1.1rem',
          minHeight: height,
          width: width,
        }
      default:
        return {
          ...baseStyles,
          fontSize: typeof height === 'number' ? Math.max(12, height * 0.3) : '1rem',
          minHeight: height,
          width: width,
        }
    }
  }

  const getImageStyles = () => {
    return {
      height: height,
      width: width,
      borderRadius: '4px',
      objectFit: 'contain' as const,
      ...style
    }
  }

  // If image failed to load or showText is false and image failed, show text
  if (imageError || (!showText && imageError)) {
    return (
      <Box sx={getTextStyles()}>
        {companyName}
      </Box>
    )
  }

  // If showText is false and image loads successfully, show only image
  if (!showText) {
    return (
      <img
        src={companyLogo}
        alt={`${companyName} Logo`}
        style={getImageStyles()}
        onError={handleImageError}
      />
    )
  }

  // Default: show image with text fallback
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <img
        src={companyLogo}
        alt={`${companyName} Logo`}
        style={getImageStyles()}
        onError={handleImageError}
      />
      {imageError && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: companyColor,
            fontSize: typeof height === 'number' ? Math.max(14, height * 0.25) : '1.1rem',
          }}
        >
          {companyName}
        </Typography>
      )}
    </Box>
  )
} 