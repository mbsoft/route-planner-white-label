# Route Planner White Label

A white-label route planning application for logistics, field service optimization, built with Next.js, React, and powered by NextBillion.ai Route Optimization with advanced map visualization and monitoring.

## Features

- **Data Import**: Drag-and-drop file upload for jobs, shipments, and vehicles
  - **CSV Support**: Comma-separated values with proper quoted field handling
  - **Excel Support**: Native support for .xlsx and .xls files
  - **Smart Header Detection**: Automatically detects and handles header rows
- **Interactive Mapping**: Visual data mapping interface with column mapping
- **Advanced Map Visualization**: NextBillion.ai and DeckGL-powered map with markers, tooltips, and hover effects
- **Step-by-Step Workflow**: Guided import process with stepper navigation
- **Responsive Design**: Modern UI built with Material-UI components
- **White-Label Ready**: Easily customizable for different brands and use cases
- **Role-Based Authentication**: Admin and User roles with different permission levels
- **Multi-Language Support**: Internationalization (i18n) with support for multiple languages

## Internationalization (i18n)

The application supports multiple languages to accommodate global users. The language switcher is available in the header navigation.

### Supported Languages

The application currently supports the following languages:

- **🇺🇸 🇨🇦 English (en)** - Default language
- **🇨🇦 French Canadian (ca-FR)** - Canadian French with proper terminology
- **🇲🇽 Spanish (es-MX)** - Mexican Spanish
- **🇧🇷 Portuguese (pt-BR)** - Brazilian Portuguese

### Language Features

- **Complete UI Translation**: All user interface elements are translated
- **Cultural Adaptation**: Translations consider cultural context and regional terminology
- **Persistent Language Selection**: User's language preference is saved and restored
- **Real-time Language Switching**: Change languages instantly without page reload
- **Comprehensive Coverage**: Navigation, forms, error messages, and documentation

### Adding New Languages

To add support for additional languages:

1. **Update Language Type**: Add the new language code to the `Language` type in `contexts/language-context.tsx`
2. **Create Translations**: Add a new translation object following the existing pattern
3. **Update Language Loading**: Add the new language case to the switch statement
4. **Add to Switcher**: Include the new language in the language switcher component
5. **Test Implementation**: Verify translations load correctly and UI updates properly

### Translation Structure

Translations are organized into logical categories:
- **navigation**: Menu items and navigation elements
- **header**: Page headers and titles
- **buttons**: Action buttons and controls
- **dataImport**: Import functionality and messages
- **analysis**: Route analysis and optimization results
- **errors/success**: User feedback messages
- **information**: Documentation and help content

## Authentication & Authorization

The application supports two user roles with different permission levels:

### Admin Role
- Full access to all features
- Can delete optimization results
- Can save and clear mapping preferences
- Can access all administrative functions

### User Role
- Can view and run optimizations
- Can view optimization history (read-only)
- Cannot delete optimization results
- Cannot save or clear mapping preferences
- Limited to basic route planning functionality

### Environment Variables
Set the following environment variables for authentication and configuration:

```bash
# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password_here
USER_USERNAME=user
USER_PASSWORD=your_secure_user_password_here

# Company Branding
COMPANY_NAME=Your Company Name
COMPANY_LOGO=/path/to/logo.svg
COMPANY_COLOR=#D36784

# Theme Customization (Optional)
# See docs/THEME_CUSTOMIZATION.md for complete customization guide
THEME_PRIMARY_COLOR=#1976d2
THEME_SECONDARY_COLOR=#42a5f5
THEME_FONT_FAMILY="Inter", sans-serif
THEME_BORDER_RADIUS=8px

# CSV Import Configuration
# Set to 'true' to show CSV file upload panels alongside database import
# Set to 'false' or leave unset to only show database import
NEXT_PUBLIC_ENABLE_CSV_IMPORT=false
```

## Prerequisites

- Node.js 18.0.0 or higher (required for Next.js 14+)
- npm 8.0.0 or higher
- NextBillion.ai API key for map tiles

## Documentation

For detailed technical documentation, API references, and advanced configuration options, see:

- **[Complete Technical Documentation](docs/DOCUMENTATION.md)** - Database schema, API endpoints, authentication, and more

## Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/mbsoft/route-planner-white-label.git
   cd route-planner-white-label
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your NextBillion.ai API key:
   ```
   NEXTBILLION_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

For production deployment on Vercel, see our deployment guides:

- **[Quick Start Guide](docs/DEPLOYMENT_QUICKSTART.md)** - Get deployed in minutes
- **[Complete Deployment Guide](docs/VERCEL_DEPLOYMENT.md)** - Detailed setup and troubleshooting

## Usage

### 1. Import Data
- **Database Import**: Import jobs and vehicles directly from the database (primary method)
- **File Upload**: Drag and drop files containing your logistics data (optional, controlled by `NEXT_PUBLIC_ENABLE_CSV_IMPORT`)
- **Supported formats**: CSV (.csv), Excel (.xlsx, .xls)
- The app will automatically detect and parse your file structure
- **Smart parsing**: Handles quoted fields, empty cells, and mixed data types

### 2. Map Data Columns
- Use the interactive mapping interface to map your file columns to the required fields
- Required fields for jobs: latitude, longitude, id (optional), description (optional)
- The app supports various column naming conventions (lat/lng, latitude/longitude, etc.)

### 3. Visualize on Map
- After mapping jobs, press "Next" to see markers on the map
- Hover over markers to see tooltip information
- The map uses NextBillion.ai tiles for high-quality map data

## Data Format

### Jobs CSV Example
```csv
id,description,latitude,longitude,service_time
JOB001,Delivery to Downtown,40.7128,-74.0060,300
JOB002,Pickup from Warehouse,40.7589,-73.9851,180
```

### Vehicles CSV Example
```csv
id,capacity,start_lat,start_lng,end_lat,end_lng
VEH001,1000,40.7128,-74.0060,40.7128,-74.0060
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application page
│   └── white-label-layout.tsx
├── components/            # React components
│   └── input/            # Input and mapping components
├── models/               # State management (Zustand)
├── utils/                # Utility functions
├── interface/            # TypeScript interfaces
└── actions/              # Business logic actions
```

## Customization

### CSV Import Configuration
The application supports two data import methods:
- **Database Import**: Primary method for importing jobs and vehicles from the database
- **CSV/File Import**: Optional method for uploading files directly

To enable CSV file upload alongside database import:
```bash
NEXT_PUBLIC_ENABLE_CSV_IMPORT=true
```

When disabled (default), only the database import option is available, providing a cleaner interface focused on database-driven workflows.

### Branding & Theme Customization
- Update colors and styling in the Material-UI theme
- Comprehensive theme customization via environment variables
- Customize colors, typography, spacing, and component styling
- See `docs/THEME_CUSTOMIZATION.md` for detailed customization guide
- Modify the layout component for custom branding
- Replace logos and assets as needed

### Map Configuration
- Customize map styles by modifying the NextBillion.ai style URL
- Adjust marker colors and styling in the InputMap component
- Add custom map layers as needed

### Data Processing
- Extend the data mapping logic in the models
- Add validation rules for your specific data format
- Implement custom data transformations

## API Integration

The app is designed to be easily integrated with route optimization APIs. Key integration points:

- **Data Export**: The mapped data can be exported in the format required by your optimization engine
- **Results Import**: Add components to import and visualize optimization results
- **Real-time Updates**: Extend the state management for real-time data updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Material-UI](https://mui.com/)
- Map visualization powered by [DeckGL](https://deck.gl/) and [NextBillion.ai](https://nextbillion.ai/)
- Route Optimization, Routing and Map tiles provided by [NextBillion.ai](https://nextbillion.ai/) 