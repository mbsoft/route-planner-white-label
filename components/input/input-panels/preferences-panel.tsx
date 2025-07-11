import React from 'react'
import {Box, Typography} from '@mui/material'

export function PreferencesPanel({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Box
      sx={{
        borderRadius: '8px',
        background: '#FFF',
        boxShadow:
          '0px 0px 4px 0px rgba(165, 165, 165, 0.25), 8px 8px 20px -15px rgba(203, 203, 203, 0.25)',
        padding: '20px',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'rgba(211, 103, 132, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: '12px',
            color: '#d36784',
            fontSize: '12px',
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            style: {
              width: '28px',
              height: '28px',
              color: '#d36784',
            },
          })}
        </Box>
        <Typography sx={{fontSize: '16px', fontWeight: '600'}}>{title}</Typography>
      </Box>
      <Typography sx={{color: 'rgba(0, 0, 0, 0.54)', fontSize: '14px', mb: 2}}>
        {description}
      </Typography>
      <Box>{children}</Box>
    </Box>
  )
} 