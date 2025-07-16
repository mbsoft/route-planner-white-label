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

interface HamburgerMenuProps {
  currentPage?: string
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ currentPage = 'home' }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setDrawerOpen(false)
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
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d36784' }}>
            The Service Company
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
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(211, 103, 132, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(211, 103, 132, 0.12)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: item.isActive ? '#d36784' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: item.isActive ? 'bold' : 'normal',
                      color: item.isActive ? '#d36784' : 'inherit',
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