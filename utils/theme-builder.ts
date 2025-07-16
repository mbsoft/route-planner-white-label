import { createTheme, Theme } from '@mui/material/styles'

export interface ThemeConfig {
  // Colors
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  paperColor: string
  textPrimary: string
  textSecondary: string
  errorColor: string
  warningColor: string
  infoColor: string
  successColor: string
  
  // Typography
  fontFamily: string
  fontSizeSmall: string
  fontSizeMedium: string
  fontSizeLarge: string
  
  // Layout
  borderRadius: string
  spacingUnit: number
}

export function buildThemeFromConfig(config: ThemeConfig): Theme {
  console.log('Building theme with config:', config)
  return createTheme({
    palette: {
      primary: {
        main: config.primaryColor,
        light: config.primaryColor + '1A', // 10% opacity
        dark: config.primaryColor + 'CC', // 80% opacity
        contrastText: '#ffffff',
      },
      secondary: {
        main: config.secondaryColor,
        light: config.secondaryColor + '1A',
        dark: config.secondaryColor + 'CC',
        contrastText: '#ffffff',
      },
      background: {
        default: config.backgroundColor,
        paper: config.paperColor,
      },
      text: {
        primary: config.textPrimary,
        secondary: config.textSecondary,
      },
      error: {
        main: config.errorColor,
        light: config.errorColor + '1A',
        dark: config.errorColor + 'CC',
      },
      warning: {
        main: config.warningColor,
        light: config.warningColor + '1A',
        dark: config.warningColor + 'CC',
      },
      info: {
        main: config.infoColor,
        light: config.infoColor + '1A',
        dark: config.infoColor + 'CC',
      },
      success: {
        main: config.successColor,
        light: config.successColor + '1A',
        dark: config.successColor + 'CC',
      },
    },
    typography: {
      fontFamily: config.fontFamily,
      fontSize: parseInt(config.fontSizeMedium),
      h1: {
        fontSize: config.fontSizeLarge,
        fontWeight: 500,
      },
      h2: {
        fontSize: config.fontSizeLarge,
        fontWeight: 500,
      },
      h3: {
        fontSize: config.fontSizeMedium,
        fontWeight: 500,
      },
      h4: {
        fontSize: config.fontSizeMedium,
        fontWeight: 500,
      },
      h5: {
        fontSize: config.fontSizeMedium,
        fontWeight: 500,
      },
      h6: {
        fontSize: config.fontSizeMedium,
        fontWeight: 500,
      },
      body1: {
        fontSize: config.fontSizeMedium,
      },
      body2: {
        fontSize: config.fontSizeSmall,
      },
      button: {
        fontSize: config.fontSizeMedium,
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: parseInt(config.borderRadius.replace('px', '')) || 4,
    },
    spacing: config.spacingUnit,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: config.borderRadius,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: config.borderRadius,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: config.borderRadius,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: config.borderRadius,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: parseInt(config.borderRadius.replace('px', '')) || 4,
          },
          label: {
            color: config.textPrimary,
            fontSize: '0.875rem',
            fontWeight: 400,
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: config.textPrimary,
            fontSize: '0.875rem',
            fontWeight: 400,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: config.borderRadius,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: config.borderRadius,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: config.borderRadius,
          },
        },
      },
    },
  })
}

export function parseThemeConfigFromAPI(config: any): ThemeConfig {
  return {
    // Colors
    primaryColor: config.THEME_PRIMARY_COLOR || config.COMPANY_COLOR || '#D36784',
    secondaryColor: config.THEME_SECONDARY_COLOR || '#dc004e',
    backgroundColor: config.THEME_BACKGROUND_COLOR || '#ffffff',
    paperColor: config.THEME_PAPER_COLOR || '#ffffff',
    textPrimary: config.THEME_TEXT_PRIMARY || '#000000',
    textSecondary: config.THEME_TEXT_SECONDARY || '#666666',
    errorColor: config.THEME_ERROR_COLOR || '#d32f2f',
    warningColor: config.THEME_WARNING_COLOR || '#ed6c02',
    infoColor: config.THEME_INFO_COLOR || '#0288d1',
    successColor: config.THEME_SUCCESS_COLOR || '#2e7d32',
    
    // Typography
    fontFamily: config.THEME_FONT_FAMILY || '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSizeSmall: config.THEME_FONT_SIZE_SMALL || '0.875rem',
    fontSizeMedium: config.THEME_FONT_SIZE_MEDIUM || '1rem',
    fontSizeLarge: config.THEME_FONT_SIZE_LARGE || '1.25rem',
    
    // Layout
    borderRadius: config.THEME_BORDER_RADIUS || '4px',
    spacingUnit: parseInt(config.THEME_SPACING_UNIT || '8'),
  }
} 