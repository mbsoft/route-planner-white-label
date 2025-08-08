'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Tooltip,
  Collapse,
} from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Route as RouteIcon,
  Analytics as AnalyticsIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Storage as StorageIcon,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

import { useWhiteLabelContext } from '../../app/white-label-layout'
import { useLanguage } from '../../contexts/language-context'
import { useAuth } from '../../hooks/use-auth'

interface SidebarProps {
  currentPage?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage = 'home' }) => {
  // Read initial state from localStorage
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-expanded')
      return stored === null ? true : stored === 'true'
    }
    return true
  })
  const router = useRouter()
  const { companyName, companyColor } = useWhiteLabelContext()
  const { t } = useLanguage()
  const { isAdmin, isUser, isDispatcher } = useAuth()

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-expanded', isExpanded ? 'true' : 'false')
    }
    // Update CSS custom property for main content margin
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isExpanded ? '280px' : '64px'
    )
  }, [isExpanded])

  const handleNavigation = (path: string) => {
    router.push(path)
    // Do NOT expand the sidebar on navigation; preserve current state
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const menuItems = useMemo(() => {
    const items = [
      {
        text: t('navigation.routePlanner'),
        icon: <RouteIcon />,
        path: '/',
        isActive: currentPage === 'home',
        adminOnly: true, // Route Planner is admin-only
        dispatcherAccess: true, // Dispatchers can also access Route Planner
      },
      {
        text: t('navigation.routeAnalysis'),
        icon: <AnalyticsIcon />,
        path: '/analysis',
        isActive: currentPage === 'analysis',
        adminOnly: false, // Available to all users
        dispatcherAccess: true, // Dispatchers can access Route Analysis
      },
      {
        text: t('navigation.information'),
        icon: <InfoIcon />,
        path: '/information',
        isActive: currentPage === 'information',
        adminOnly: false, // Available to all users
        dispatcherAccess: true, // Dispatchers can access Information
      },
    ]

    // Filter menu items based on user role
    return items.filter(item => {
      if (isAdmin) return true // Admin can see all items
      if (isDispatcher) {
        // Dispatchers can see items marked with dispatcherAccess
        return item.dispatcherAccess || !item.adminOnly
      }
      return !item.adminOnly // Users can only see non-admin-only items
    })
  }, [t, currentPage, isAdmin, isDispatcher])

  return (
    <Box
      sx={{
        width: isExpanded ? 280 : 64,
        height: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          minHeight: '64px',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Collapse in={isExpanded} orientation="horizontal">
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: companyColor }}>
            {companyName}
          </Typography>
        </Collapse>
        
        <Tooltip 
          title={isExpanded ? t('sidebar.collapseSidebar') : t('sidebar.expandSidebar')} 
          placement="right"
          componentsProps={{
            tooltip: {
              sx: {
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: 'rgba(0, 0, 0, 0.87)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                '& .MuiTooltip-arrow': {
                  color: 'rgba(0, 0, 0, 0.87)',
                },
              },
            },
          }}
        >
          <IconButton 
            onClick={toggleExpanded}
            sx={{ 
              ml: isExpanded ? 1 : 'auto',
              mr: isExpanded ? 0 : 'auto',
              '& .MuiSvgIcon-root': {
                fontSize: '20px'
              }
            }}
          >
            {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider />
      
      {/* Navigation Menu */}
      <List sx={{ pt: 1, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Tooltip 
              title={!isExpanded ? item.text : ""} 
              placement="right"
              disableHoverListener={isExpanded}
              componentsProps={{
                tooltip: {
                  sx: {
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: 'rgba(0, 0, 0, 0.87)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '& .MuiTooltip-arrow': {
                      color: 'rgba(0, 0, 0, 0.87)',
                    },
                  },
                },
              }}
            >
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={item.isActive}
                sx={{
                  minHeight: 48,
                  justifyContent: isExpanded ? 'initial' : 'center',
                  px: isExpanded ? 3 : 2,
                  '&.Mui-selected': {
                    backgroundColor: `${companyColor}14`, // 8% opacity
                    '&:hover': {
                      backgroundColor: `${companyColor}1F`, // 12% opacity
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: item.isActive ? companyColor : '#666666',
                    minWidth: isExpanded ? 40 : 0,
                    justifyContent: 'center',
                    '& .MuiSvgIcon-root': {
                      fontSize: '24px'
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <Collapse in={isExpanded} orientation="horizontal">
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: item.isActive ? 'bold' : 'normal',
                        color: item.isActive ? companyColor : '#000000',
                        fontSize: '0.875rem',
                        lineHeight: 1.2,
                      },
                    }}
                  />
                </Collapse>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  )
} 