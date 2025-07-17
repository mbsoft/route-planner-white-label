'use client'

import React, { useEffect, useState } from 'react'
import { Container, Box, Typography, Paper, Divider, Button, Grid, Card, CardContent, CardHeader, List, ListItem, ListItemIcon, ListItemText, Chip, Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material'
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
import { LanguageSwitcher } from '../../components/common/language-switcher'
import { useRouter } from 'next/navigation'
import { useWhiteLabelContext } from '../white-label-layout'
import { useLanguage } from '../../contexts/language-context'

export default function InformationPage() {
  const router = useRouter()
  const { companyName, companyLogo, companyColor } = useWhiteLabelContext()
  const { t, isLoading, language, renderKey } = useLanguage()

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

  // Show loading spinner while translations are loading
  if (isLoading) {
    return (
      <WhiteLabelLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </WhiteLabelLayout>
    )
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
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
                  {t('header.informationDocumentation')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LanguageSwitcher />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ 
                    height: '25px',
                    fontSize: '0.75rem',
                    textTransform: 'none'
                  }}
                >
                  {t('navigation.logout')}
                </Button>
              </Box>
            </Box>
          </Box>
          <Box key={`content-${language}-${renderKey}`} sx={{ flex: 1, backgroundColor: '#ffffff', p: 3, overflow: 'auto' }}>
            {/* Application Overview */}
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: companyColor }}>
              {t('information.pageTitle')}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
              {t('information.welcomeMessage').replace('{companyName}', companyName)}
            </Typography>

            {/* Core Features Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    avatar={<RouteIcon sx={{ color: companyColor }} />}
                    title={t('information.routeOptimization')}
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {t('information.routeOptimizationDesc')}
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.minTravelTime')} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.vehicleCapacity')} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.timeWindow')} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.multiFuel')} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    avatar={<UploadIcon sx={{ color: companyColor }} />}
                    title={t('information.dataImport')}
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {t('information.dataImportDesc')}
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.csvExcel')} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.databaseIntegration')} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.realTimeMapping')} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.bulkValidation')} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    avatar={<AnalyticsIcon sx={{ color: companyColor }} />}
                    title={t('information.analytics')}
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {t('information.analyticsDesc')}
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.fuelMetrics')} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.routePerformance')} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.optimizationHistory')} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText primary={t('information.exportCapabilities')} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* White Label Customization Section */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, mt: 4, color: companyColor }}>
              {t('information.whiteLabelTitle')}
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
              {t('information.whiteLabelDesc')}
            </Typography>

            {/* Customization Options */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Accordion sx={{ border: '1px solid #e0e0e0' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PaletteIcon sx={{ color: companyColor }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {t('information.brandingTitle')}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>{t('information.logoIdentity')}</strong>
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={`• ${t('information.replaceLogo')}`}
                          secondary={t('information.setCompanyLogo')}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={`• ${t('information.colorScheme')}`}
                          secondary={t('information.setCompanyColor')}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={`• ${t('information.companyName')}`}
                          secondary={t('information.setCompanyName')}
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
                      <CodeIcon sx={{ color: companyColor }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {t('information.technicalTitle')}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>{t('information.environmentVariables')}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {t('information.envVarsDesc')}
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={t('information.companyLogoVar')}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={t('information.companyColorVar')}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={t('information.companyNameVar')}
                        />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>

            {/* Deployment Section */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, mt: 4, color: companyColor }}>
              {t('information.deploymentTitle')}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    avatar={<SettingsIcon sx={{ color: companyColor }} />}
                    title={t('information.vercelDeployment')}
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {t('information.vercelSteps')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    avatar={<StorageIcon sx={{ color: companyColor }} />}
                    title={t('information.otherPlatforms')}
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2">
                      {t('information.otherPlatformsDesc')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Internationalization Guide */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, mt: 4, color: companyColor }}>
              {t('information.i18nGuide')}
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
              {t('information.i18nDescription')}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    avatar={<InfoIcon sx={{ color: companyColor }} />}
                    title={t('information.addingNewLanguages')}
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>{t('information.currentLanguages')}</strong>
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary={t('information.englishDefault')} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary={t('information.spanishMexican')} />
                      </ListItem>
                    </List>
                    
                    <Typography variant="body2" sx={{ mb: 2, mt: 2 }}>
                      <strong>{t('information.stepsToAdd')}</strong>
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary={`1. ${t('information.step1')}`} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary={`2. ${t('information.step2')}`} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary={`3. ${t('information.step3')}`} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary={`4. ${t('information.step4')}`} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary={`5. ${t('information.step5')}`} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardHeader
                    avatar={<WarningIcon sx={{ color: companyColor }} />}
                    title={t('information.translationBestPractices')}
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <List dense>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={t('information.useNestedKeys')}
                          secondary={t('information.useNestedKeysDesc')}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={t('information.keepKeysDescriptive')}
                          secondary={t('information.keepKeysDescriptiveDesc')}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={t('information.considerCulturalContext')}
                          secondary={t('information.considerCulturalContextDesc')}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={t('information.testLongerText')}
                          secondary={t('information.testLongerTextDesc')}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Footer */}
          <Box sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            py: 3,
            px: 2,
            mt: '5px'
          }}>
            <Box sx={{ mt: 0, pt: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
              <img
                src={companyLogo}
                alt={`${companyName} Logo`}
                style={{ height: '20px', width: 'auto', marginRight: '8px', verticalAlign: 'middle' }}
              />
              <Typography variant="caption" sx={{ color: '#999' }}>
                {t('footer.poweredBy')} | {t('footer.version')} | {t('footer.lastUpdated')}: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </WhiteLabelLayout>
  )
} 