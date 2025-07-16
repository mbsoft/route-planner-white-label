'use client'

import React, { useState } from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Route as RouteIcon,
  Analytics as AnalyticsIcon,
  Home as HomeIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useWhiteLabelContext } from '../../app/white-label-layout'

interface HamburgerMenuProps {
  currentPage?: string
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ currentPage = 'home' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { companyName, companyColor } = useWhiteLabelContext()

  const handleDrawerToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const menuItems = [
    {
      text: 'Route Planner',
      icon: <RouteIcon />,
      path: '/',
      isActive: currentPage === 'home',
    },
    {
      text: 'Route Analysis',
      icon: <AnalyticsIcon />,
      path: '/analysis',
      isActive: currentPage === 'analysis',
    },
    {
      text: 'Information',
      icon: <InfoIcon />,
      path: '/information',
      isActive: currentPage === 'information',
    },
  ]

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: companyColor }}>
            {companyName}
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={item.isActive}
                sx={{
                  minHeight: 48,
                  px: 3,
                  '&.Mui-selected': {
                    backgroundColor: `${companyColor}14`,
                    '&:hover': {
                      backgroundColor: `${companyColor}1F`,
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.isActive ? companyColor : '#666666' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: item.isActive ? 'bold' : 'normal',
                      color: item.isActive ? companyColor : '#000000',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  )
} 