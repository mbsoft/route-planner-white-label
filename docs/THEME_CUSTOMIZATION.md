# Theme Customization Guide

This guide explains how to customize the appearance of your white-label route planner application using environment variables. The application uses Material-UI (MUI) theming system and allows comprehensive customization of colors, typography, spacing, and component styling.

## Overview

The theme customization system allows you to:
- Customize all color schemes (primary, secondary, error, warning, etc.)
- Adjust typography (font family, sizes)
- Modify layout properties (border radius, spacing)
- Maintain consistency across all components

## Environment Variables

### Color Customization

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `THEME_PRIMARY_COLOR` | Main brand color for buttons, links, and highlights | `#D36784` | `#1976d2` |
| `THEME_SECONDARY_COLOR` | Secondary color for accents and highlights | `#dc004e` | `#dc004e` |
| `THEME_BACKGROUND_COLOR` | Main background color | `#ffffff` | `#f5f5f5` |
| `THEME_PAPER_COLOR` | Background color for cards and panels | `#ffffff` | `#ffffff` |
| `THEME_TEXT_PRIMARY` | Primary text color | `#000000` | `#212121` |
| `THEME_TEXT_SECONDARY` | Secondary text color | `#666666` | `#757575` |
| `THEME_ERROR_COLOR` | Error state color | `#d32f2f` | `#f44336` |
| `THEME_WARNING_COLOR` | Warning state color | `#ed6c02` | `#ff9800` |
| `THEME_INFO_COLOR` | Information state color | `#0288d1` | `#2196f3` |
| `THEME_SUCCESS_COLOR` | Success state color | `#2e7d32` | `#4caf50` |

### Typography Customization

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `THEME_FONT_FAMILY` | Font family for all text | `"Roboto", "Helvetica", "Arial", sans-serif` | `"Inter", sans-serif` |
| `THEME_FONT_SIZE_SMALL` | Small text size | `0.875rem` | `0.8rem` |
| `THEME_FONT_SIZE_MEDIUM` | Medium text size | `1rem` | `1.1rem` |
| `THEME_FONT_SIZE_LARGE` | Large text size | `1.25rem` | `1.5rem` |

### Layout Customization

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `THEME_BORDER_RADIUS` | Border radius for components | `4px` | `8px` |
| `THEME_SPACING_UNIT` | Base spacing unit (in pixels) | `8` | `10` |

## Implementation Examples

### Example 1: Corporate Blue Theme

```bash
# Corporate blue theme
THEME_PRIMARY_COLOR=#1976d2
THEME_SECONDARY_COLOR=#42a5f5
THEME_BACKGROUND_COLOR=#f5f5f5
THEME_PAPER_COLOR=#ffffff
THEME_TEXT_PRIMARY=#212121
THEME_TEXT_SECONDARY=#757575
THEME_ERROR_COLOR=#f44336
THEME_WARNING_COLOR=#ff9800
THEME_INFO_COLOR=#2196f3
THEME_SUCCESS_COLOR=#4caf50
THEME_FONT_FAMILY="Inter", sans-serif
THEME_BORDER_RADIUS=8px
```

### Example 2: Dark Theme

```bash
# Dark theme
THEME_PRIMARY_COLOR=#90caf9
THEME_SECONDARY_COLOR=#f48fb1
THEME_BACKGROUND_COLOR=#121212
THEME_PAPER_COLOR=#1e1e1e
THEME_TEXT_PRIMARY=#ffffff
THEME_TEXT_SECONDARY=#b0b0b0
THEME_ERROR_COLOR=#f44336
THEME_WARNING_COLOR=#ff9800
THEME_INFO_COLOR=#2196f3
THEME_SUCCESS_COLOR=#4caf50
THEME_FONT_FAMILY="Roboto", sans-serif
THEME_BORDER_RADIUS=4px
```

### Example 3: Modern Green Theme

```bash
# Modern green theme
THEME_PRIMARY_COLOR=#2e7d32
THEME_SECONDARY_COLOR=#66bb6a
THEME_BACKGROUND_COLOR=#f8f9fa
THEME_PAPER_COLOR=#ffffff
THEME_TEXT_PRIMARY=#1a1a1a
THEME_TEXT_SECONDARY=#666666
THEME_ERROR_COLOR=#d32f2f
THEME_WARNING_COLOR=#ed6c02
THEME_INFO_COLOR=#0288d1
THEME_SUCCESS_COLOR=#2e7d32
THEME_FONT_FAMILY="Segoe UI", "Roboto", sans-serif
THEME_BORDER_RADIUS=12px
THEME_SPACING_UNIT=10
```

## Color Format

All color values should be in hexadecimal format:
- 6-digit hex: `#1976d2`
- 3-digit hex: `#f00` (not recommended for consistency)

## Font Family

When specifying custom fonts, ensure they are:
1. Available on the target system, or
2. Loaded via CSS (Google Fonts, etc.)

Example with Google Fonts:
```bash
THEME_FONT_FAMILY="Inter", "Roboto", sans-serif
```

## Border Radius

Border radius values can be specified as:
- Pixels: `4px`, `8px`, `12px`
- Percentage: `50%` (for circular elements)

## Spacing Unit

The spacing unit is used as a multiplier for MUI's spacing system:
- Default: `8` (results in 8px, 16px, 24px, etc.)
- Custom: `10` (results in 10px, 20px, 30px, etc.)

## Fallback Behavior

If any theme variable is not set, the system will:
1. Use the corresponding `COMPANY_COLOR` for primary color
2. Fall back to sensible defaults for other properties
3. Maintain consistency across the application

## Testing Your Theme

1. Set your environment variables
2. Restart the application
3. Check that all components reflect your theme
4. Test in different browsers and devices

## Best Practices

### Color Selection
- Ensure sufficient contrast between text and background colors
- Test your color scheme for accessibility (WCAG guidelines)
- Consider color blindness when choosing primary/secondary colors

### Typography
- Choose fonts that are readable at various sizes
- Ensure font fallbacks for better cross-platform compatibility
- Test font rendering on different operating systems

### Consistency
- Use consistent spacing throughout your customizations
- Maintain visual hierarchy with appropriate font sizes
- Consider the overall user experience when making changes

## Troubleshooting

### Colors Not Applying
- Check that environment variables are properly set
- Restart the application after changing variables
- Verify color format (hexadecimal)

### Font Not Loading
- Ensure the font is available or properly loaded
- Check browser console for font loading errors
- Provide fallback fonts

### Inconsistent Styling
- Clear browser cache
- Check for CSS conflicts
- Verify all theme variables are set consistently

## Advanced Customization

For more advanced customization beyond environment variables, you can:
1. Modify the `utils/theme-builder.ts` file
2. Add custom component overrides
3. Implement dynamic theme switching
4. Create theme presets for different use cases

## Support

If you need help with theme customization:
1. Check this documentation
2. Review the example configurations
3. Test with the provided examples
4. Contact support with specific issues 