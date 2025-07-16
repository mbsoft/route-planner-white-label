'use client'

import React from 'react'
import { Container, Box, Typography, Paper, Divider, Button, Grid, Card, CardContent, CardHeader, List, ListItem, ListItemIcon, ListItemText, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { 
  Logout as LogoutIcon,
  Route as RouteIcon,
  Analytics as AnalyticsIcon,
  Upload as UploadIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  Palette as PaletteIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { WhiteLabelLayout } from '../white-label-layout'
import { Sidebar } from '../../components/common/sidebar'
import { useRouter } from 'next/navigation'
import { useWhiteLabelContext } from '../white-label-layout'

export default function InformationPage() {
  const router = useRouter()
  const { companyName, companyLogo, companyColor } = useWhiteLabelContext()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <WhiteLabelLayout>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar currentPage="information" />
        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          ml: 'var(--sidebar-width, 280px)',
          transition: 'margin-left 0.3s ease',
          backgroundColor: '#ffffff' 
        }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img
                src={companyLogo}
                alt={`${companyName} Logo`}
                style={{
                  height: '60px',
                  width: 'auto',
                  borderRadius: '4px'
                }}
              />
              <Typography
                variant="h4"
                component="h1"
                sx={{ color: '#333', fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                Information & Documentation
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, backgroundColor: '#ffffff', p: 3, overflow: 'auto' }}>
            {/* Application Overview */}
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: companyColor }}>
              Route Planning & Optimization Platform
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
              Welcome to the {companyName} Route Planning Platform, a comprehensive white-label solution powered by NextBillion.ai's advanced optimization engine. 
              This platform provides intelligent route planning, real-time optimization, and detailed analytics for fleet management operations.
            </Typography>

            {/* Core Features Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    avatar={<RouteIcon sx={{ color: companyColor }} />}
                    title="Route Optimization"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Advanced algorithms optimize routes for:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Minimum travel time and distance" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Vehicle capacity constraints" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Time window compliance" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Multi-fuel type support" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    avatar={<UploadIcon sx={{ color: companyColor }} />}
                    title="Data Import & Management"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Flexible data import options:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="CSV/Excel file upload" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Database integration" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Real-time data mapping" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Bulk data validation" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    avatar={<AnalyticsIcon sx={{ color: companyColor }} />}
                    title="Analytics & Reporting"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Comprehensive analytics features:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Fuel delivery metrics" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Route performance analysis" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Optimization history" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Export capabilities" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* White Label Customization Section */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, mt: 4, color: companyColor }}>
              White Label Customization Guide
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
              This platform is designed as a white-label solution, allowing complete customization of branding, 
              styling, and functionality to match your organization's identity and requirements.
            </Typography>

            {/* Customization Options */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Accordion sx={{ border: '1px solid #e0e0e0' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PaletteIcon sx={{ color: companyColor }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Branding & Visual Customization
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Logo & Company Identity:</strong>
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Replace default logo with your company logo"
                          secondary="Set COMPANY_LOGO environment variable or update company_logo.svg in the public directory"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Customize company name throughout the application"
                          secondary="Modify company name in white-label configuration"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Update color scheme and theme"
                          secondary="Customize primary colors, typography, and styling"
                        />
                      </ListItem>
                    </List>
                    
                    <Typography variant="body2" sx={{ mb: 2, mt: 2 }}>
                      <strong>Implementation Steps:</strong>
                    </Typography>
                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      1. Set COMPANY_LOGO environment variable or replace /public/company_logo.svg with your logo<br/>
                      2. Update company name in environment variables<br/>
                      3. Customize theme colors in app/white-label-layout.tsx<br/>
                      4. Update favicon and meta tags
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12} md={6}>
                <Accordion sx={{ border: '1px solid #e0e0e0' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SettingsIcon sx={{ color: companyColor }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Configuration & Environment
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Environment Variables:</strong>
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• NEXTBILLION_API_KEY"
                          secondary="Your NextBillion.ai API key for optimization services"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• NEXT_PUBLIC_ENABLE_CSV_IMPORT"
                          secondary="Control CSV import functionality (true/false)"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• USE_CASE"
                          secondary="Set to 'jobs' or 'shipments' based on your use case"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• COMPANY_LOGO"
                          secondary="Path to your company logo (e.g., '/your-logo.svg' or full URL)"
                        />
                      </ListItem>
                    </List>
                    
                    <Typography variant="body2" sx={{ mb: 2, mt: 2 }}>
                      <strong>Configuration Files:</strong>
                    </Typography>
                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      • .env.local - Environment variables<br/>
                      • app/white-label-layout.tsx - Branding & theme<br/>
                      • components/common/sidebar.tsx - Navigation<br/>
                      • public/ - Static assets (logos, favicons)
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12} md={6}>
                <Accordion sx={{ border: '1px solid #e0e0e0' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CodeIcon sx={{ color: companyColor }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Feature Customization
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Available Customizations:</strong>
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Enable/disable CSV import functionality"
                          secondary="Control data import methods based on requirements"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Customize fuel types and delivery metrics"
                          secondary="Add or modify fuel types (ULSD Clear, ULSD Dyed, UNL, etc.)"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Modify navigation and menu structure"
                          secondary="Add, remove, or reorganize application sections"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Customize data mapping and validation"
                          secondary="Adapt field mappings for your specific data format"
                        />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12} md={6}>
                <Accordion sx={{ border: '1px solid #e0e0e0' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <StorageIcon sx={{ color: companyColor }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Database Integration
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Database Features:</strong>
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Direct database import for jobs and vehicles"
                          secondary="Import data directly from your existing database"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Real-time data synchronization"
                          secondary="Keep route planning data current with live updates"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Custom database schema support"
                          secondary="Adapt to your existing database structure"
                        />
                      </ListItem>
                    </List>
                    
                    <Typography variant="body2" sx={{ mb: 2, mt: 2 }}>
                      <strong>Setup Requirements:</strong>
                    </Typography>
                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      • Configure database connection in API routes<br/>
                      • Set up data transformation logic<br/>
                      • Implement authentication for database access<br/>
                      • Configure data refresh intervals
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>

            {/* Getting Started Section */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, mt: 4, color: companyColor }}>
              Getting Started
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={8}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    title="Quick Start Guide"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>1. Initial Setup:</strong>
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Configure your NextBillion.ai API key"
                          secondary="Set NEXTBILLION_API_KEY in your environment variables"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Upload your company logo"
                          secondary="Replace the default logo with your branded logo"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Set your company name"
                          secondary="Update the company name throughout the application"
                        />
                      </ListItem>
                    </List>

                    <Typography variant="body2" sx={{ mb: 2, mt: 2 }}>
                      <strong>2. Data Import:</strong>
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Prepare your jobs/vehicles data in CSV format"
                          secondary="Ensure data includes required fields (location, capacity, time windows)"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Map your data fields to the application schema"
                          secondary="Use the data mapping interface to connect your fields"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Validate and import your data"
                          secondary="Review mapped data and proceed with import"
                        />
                      </ListItem>
                    </List>

                    <Typography variant="body2" sx={{ mb: 2, mt: 2 }}>
                      <strong>3. Route Optimization:</strong>
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Configure optimization preferences"
                          secondary="Set routing mode, constraints, and objectives"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Run optimization and review results"
                          secondary="Analyze routes, metrics, and performance data"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Export and share results"
                          secondary="Download route data and share with your team"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ border: '1px solid #e0e0e0', height: 'fit-content' }}>
                  <CardHeader
                    title="System Requirements"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <InfoIcon sx={{ fontSize: 16, color: '#2196f3' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Node.js 18.17.0+"
                          secondary="Required for Next.js compatibility"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <InfoIcon sx={{ fontSize: 16, color: '#2196f3' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="NextBillion.ai API Key"
                          secondary="For route optimization services"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <InfoIcon sx={{ fontSize: 16, color: '#2196f3' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Modern Web Browser"
                          secondary="Chrome, Firefox, Safari, Edge"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <WarningIcon sx={{ fontSize: 16, color: '#ff9800' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Database Access"
                          secondary="For database import functionality"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Support & Documentation */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, mt: 4, color: companyColor }}>
              Support & Documentation
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    title="Available Resources"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={
                            <a 
                              href="https://docs.nextbillion.ai/optimization/route-optimization-api" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: companyColor, textDecoration: 'none' }}
                            >
                              • API Documentation
                            </a>
                          }
                          secondary="Complete NextBillion.ai API reference"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={
                            <a 
                              href="https://github.com/mbsoft/route-planner-white-label/blob/main/DOCUMENTATION.md#database-schema" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: companyColor, textDecoration: 'none' }}
                            >
                              • Data Format Specifications
                            </a>
                          }
                          secondary="Required CSV formats and field mappings"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={
                            <a 
                              href="https://github.com/mbsoft/route-planner-white-label/blob/main/docs/DEPLOYMENT_QUICKSTART.md" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: companyColor, textDecoration: 'none' }}
                            >
                              • White Label Guide
                            </a>
                          }
                          secondary="Detailed customization instructions"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Troubleshooting Guide"
                          secondary="Common issues and solutions"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    title="Contact & Support"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      For technical support and customization assistance:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• NextBillion.ai Support"
                          secondary="API and optimization engine support"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Platform Documentation"
                          secondary="Comprehensive setup and usage guides"
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="• Custom Development"
                          secondary="For advanced customization needs"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            py: 3,
            px: 2,
            mt: '5px', // Add 5px margin above the footer
            position: 'relative',
            zIndex: 10, // Ensure footer is above content but below sticky elements
            flexShrink: 0, // Prevent footer from shrinking
          }}>
            <Box sx={{ mt: 0, pt: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
              <img
                src={companyLogo}
                alt={`${companyName} Logo`}
                style={{ height: '40px', width: 'auto', marginRight: '8px', verticalAlign: 'middle' }}
              />
              <Typography variant="body2" sx={{ color: '#999', fontSize: '14px' }}>
                powered by NextBillion.ai | Version 1.0.0 | Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </WhiteLabelLayout>
  )
} 