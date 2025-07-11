'use client'

import React from 'react'
import { Container, Box, Typography, Paper, Divider, Button } from '@mui/material'
import { Logout as LogoutIcon } from '@mui/icons-material'
import { WhiteLabelLayout } from '../white-label-layout'
import { HamburgerMenu } from '../../components/common/hamburger-menu'
import { useRouter } from 'next/navigation'

export default function InformationPage() {
  const router = useRouter()

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
      <Container maxWidth="lg" sx={{ minHeight: '100vh', p: 0, backgroundColor: '#ffffff' }}>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
            <Box sx={{ maxHeight: '25px', height: '25px', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HamburgerMenu currentPage="information" />
                <img
                  src="/company_logo.svg"
                  alt="Diesel Direct Logo"
                  style={{
                    height: '25px',
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
                Logout
              </Button>
            </Box>
          </Box>

          {/* Main content */}
          <Box sx={{ flex: 1, p: 3 }}>
            <Paper sx={{ p: 4, maxWidth: '800px', mx: 'auto' }}>
              <Typography variant="h4" component="h2" sx={{ mb: 3, color: '#d36784', fontWeight: 'bold' }}>
                Fuel Delivery Problem Summary
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Problem Overview
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You have a fuel delivery truck with up to 4 compartments: <strong>[1000, 1000, 500, 0]</strong> (gallons).
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  There are 2 fuel types (e.g., ULSD Dyed, ULSD Clear).
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  Note: there are also DEF (diesel fuel types) but these are automatically aligned with DEF trucks.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  A compartment can carry only 1 fuel type.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  The assignment of which compartment carries which fuel should be left to the solver.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Your goal is to produce the <code>alternative_capacities</code> array that tells the solver all possible compartment-to-fuel-type mappings with their capacities.
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Core Constraint
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Each alternative capacity is a 2-element array <code>[a, b]</code>:
                </Typography>
                <Box sx={{ ml: 2, mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • <strong>a</strong> = total gallons of fuel type 1
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • <strong>b</strong> = total gallons of fuel type 2
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Every valid combination of compartment assignments (where each compartment is assigned to one of the 2 fuel types) should be expressed as one such capacity.
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Combinatorial Strategy
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  There are 2 choices (fuel types) for each compartment →
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  With 4 compartments, that's 2⁴ = 16 possible combinations.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  For each combination:
                </Typography>
                <Box sx={{ ml: 2, mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • Assign fuel type 1 to some compartments
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • Assign fuel type 2 to the rest
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • Sum the capacities per fuel type
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Approach
                </Typography>
                <Box sx={{ 
                  backgroundColor: '#f5f5f5', 
                  p: 2, 
                  borderRadius: 1, 
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  mb: 2
                }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    const compartments = [1000, 1000, 500, 0];
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    // generate alternative capacity array based on 2 fuel types and compartment capacity provided
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    const altCaps = generateAlternativeCapacities(compartments, 2);
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    [
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                    [0, 2500],
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                    [500, 2000],
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                    [1000, 1500],
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                    [1500, 1000],
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                    [2000, 500],
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                    [2500, 0]
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ]
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  This means the truck can operate in 6 ways:
                </Typography>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • All compartments carrying fuel type 2
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • 1 carrying fuel type 1, rest fuel type 2
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • ...
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    • All carrying fuel type 1
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Footer */}
          <Box sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            py: 3,
            px: 2,
            mt: '5px'
          }}>
            <Container maxWidth="xl">
              <Box sx={{ mt: 0, pt: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src="/company_logo.svg"
                  alt="Diesel Direct Logo"
                  style={{ height: '20px', width: 'auto', marginRight: '8px', verticalAlign: 'middle' }}
                />
                <Typography variant="caption" sx={{ color: '#999' }}>
                  powered by NextBillion.ai | Version 1.0.0 | Last updated: {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </Container>
          </Box>
        </Box>
      </Container>
    </WhiteLabelLayout>
  )
} 