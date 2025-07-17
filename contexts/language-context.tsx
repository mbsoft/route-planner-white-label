'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

type Language = 'en' | 'es-MX'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoading: boolean
  renderKey: number
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

// Import locale files directly
const enTranslations = {
  "navigation": {
    "routePlanner": "Route Planner",
    "routeAnalysis": "Route Analysis",
    "information": "Information",
    "logout": "Logout",
    "admin": "ADMIN"
  },
  "header": {
    "planManageMonitor": "Plan, manage and monitor your routes",
    "routePlanAnalysis": "Route Plan Analysis",
    "informationDocumentation": "Information & Documentation",
    "editRoute": "Edit Route"
  },
  "sidebar": {
    "collapseSidebar": "Collapse sidebar",
    "expandSidebar": "Expand sidebar"
  },
  "footer": {
    "poweredBy": "powered by NextBillion.ai",
    "version": "Version 1.0.0",
    "lastUpdated": "Last updated"
  },
  "loading": {
    "loadingRoutePlanner": "Loading Route Planner...",
    "checkingApiConfig": "Checking API configuration..."
  },
  "buttons": {
    "import": "Import",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next",
    "reset": "Reset",
    "add": "Add",
    "clear": "Clear"
  },
  "dataImport": {
    "importJobsFromDatabase": "Import Jobs from Database",
    "importVehiclesFromDatabase": "Import Vehicles from Database",
    "startTimeOptional": "Start Time (optional)",
    "endTimeOptional": "End Time (optional)",
    "searchDescriptionOptional": "Search Description (optional)",
    "enterSearchTerm": "Enter search term...",
    "leaveEmptyToImportAll": "Leave empty to import all records",
    "caseInsensitiveSearch": "Case insensitive search in job descriptions",
    "caseInsensitiveSearchVehicles": "Case insensitive search in vehicle descriptions",
    "recordsWillBeImported": "records will be imported",
    "recordWillBeImported": "record will be imported",
    "importJobData": "Import Job Data",
    "importVehicleData": "Import Vehicle Data",
    "recordsLoaded": "records loaded",
    "fromDatabase": "(from database)",
    "selectField": "Select field",
    "addAttribute": "Add attribute",
    "editTable": "Edit table",
    "saveChanges": "Save changes",
    "cancelEditing": "Cancel editing",
    "deleteImportedData": "Delete imported data",
    "resetMapping": "Reset Mapping",
    "confirmDeletion": "Confirm Deletion",
    "deleteConfirmation": "Are you sure you want to delete all imported {type} data? This action cannot be undone.",
    "areYouSure": "Are you sure?",
    "deleteConfirmationGeneric": "This will delete all imported data. This action cannot be undone."
  },
  "table": {
    "selectAllRows": "Select all rows",
    "selectRow": "Select row",
    "vehicle": "Vehicle",
    "description": "Description",
    "start": "Start",
    "end": "End",
    "stops": "Stops",
    "distance": "Distance",
    "drive": "Drive",
    "delivery": "Delivery",
    "departure": "Departure",
    "id": "ID",
    "startLocation": "Start Location",
    "endLocation": "End Location",
    "serviceTime": "Service Time"
  },
  "analysis": {
    "optimizationResults": "Optimization Results",
    "noResults": "No optimization results found",
    "viewResult": "View Result",
    "editTitle": "Edit Title",
    "deleteResult": "Delete Result",
    "downloadResults": "Download Results",
    "shareResults": "Share Results",
    "optimizationHistory": "Optimization History",
    "jobId": "Job ID",
    "title": "Title",
    "status": "Status",
    "createdAt": "Created At",
    "actions": "Actions",
    "completed": "Completed",
    "failed": "Failed",
    "pending": "Pending",
    "routeDetails": "Route Details",
    "routeSummary": "Route Summary",
    "stepDetails": "Step Details",
    "totalDistance": "Total Distance",
    "totalTime": "Total Time",
    "totalStops": "Total Stops",
    "vehicleUtilization": "Vehicle Utilization",
    "capacityUtilization": "Capacity Utilization",
    "timeUtilization": "Time Utilization"
  },
  "map": {
    "mapView": "Map View",
    "showJobMarkers": "Jobs/Shipments",
    "showVehicleMarkers": "Vehicles",
    "showRoutes": "Routes"
  },
  "preferences": {
    "preferences": "Preferences",
    "saveMapping": "Save Mapping",
    "clearPreferences": "Clear Preferences",
    "routingOptions": "Routing Options",
    "avoidOptions": "Avoid Options",
    "hazmatTypes": "Hazardous Material Types",
    "truckMode": "Truck Mode",
    "carMode": "Car Mode",
    "bikeMode": "Bike Mode",
    "footMode": "Foot Mode"
  },
  "hazmatTypes": {
    "explosives": "Explosives",
    "gases": "Gases",
    "flammableLiquids": "Flammable Liquids",
    "flammableSolids": "Flammable Solids",
    "oxidizingSubstances": "Oxidizing Substances",
    "toxicSubstances": "Toxic Substances",
    "radioactiveMaterials": "Radioactive Materials",
    "corrosiveSubstances": "Corrosive Substances",
    "miscellaneous": "Miscellaneous"
  },
  "avoidOptions": {
    "highways": "Highways",
    "tolls": "Tolls",
    "ferries": "Ferries",
    "indoor": "Indoor",
    "dirtRoads": "Dirt Roads"
  },
  "errors": {
    "failedToFetch": "Failed to fetch data",
    "failedToSave": "Failed to save changes",
    "failedToDelete": "Failed to delete",
    "unknownError": "Unknown error occurred",
    "networkError": "Network error",
    "validationError": "Validation error"
  },
  "success": {
    "changesSaved": "Changes saved successfully",
    "dataDeleted": "Data deleted successfully",
    "optimizationComplete": "Optimization completed successfully"
  },
  "language": {
    "english": "English",
    "spanish": "Español",
    "selectLanguage": "Select Language"
  },
  "information": {
    "pageTitle": "Route Planning & Optimization Platform",
    "welcomeMessage": "Welcome to the {companyName} Route Planning Platform, a comprehensive white-label solution powered by NextBillion.ai's advanced optimization engine. This platform provides intelligent route planning, real-time optimization, and detailed analytics for fleet management operations.",
    "routeOptimization": "Route Optimization",
    "routeOptimizationDesc": "Advanced algorithms optimize routes for:",
    "minTravelTime": "Minimum travel time and distance",
    "vehicleCapacity": "Vehicle capacity constraints",
    "timeWindow": "Time window compliance",
    "multiFuel": "Multi-fuel type support",
    "dataImport": "Data Import & Management",
    "dataImportDesc": "Flexible data import options:",
    "csvExcel": "CSV/Excel file upload",
    "databaseIntegration": "Database integration",
    "realTimeMapping": "Real-time data mapping",
    "bulkValidation": "Bulk data validation",
    "analytics": "Analytics & Reporting",
    "analyticsDesc": "Comprehensive analytics features:",
    "fuelMetrics": "Fuel delivery metrics",
    "routePerformance": "Route performance analysis",
    "optimizationHistory": "Optimization history",
    "exportCapabilities": "Export capabilities",
    "whiteLabelTitle": "White Label Customization Guide",
    "whiteLabelDesc": "This platform is designed as a white-label solution, allowing complete customization of branding, styling, and functionality to match your organization's identity and requirements.",
    "brandingTitle": "Branding & Visual Customization",
    "logoIdentity": "Logo & Company Identity:",
    "replaceLogo": "Replace default logo with your company logo",
    "setCompanyLogo": "Set COMPANY_LOGO environment variable or update company_logo.svg in the public directory",
    "colorScheme": "Color Scheme Customization:",
    "setCompanyColor": "Set COMPANY_COLOR environment variable to customize the primary color scheme throughout the application",
    "companyName": "Company Name:",
    "setCompanyName": "Set COMPANY_NAME environment variable to display your company name throughout the application",
    "technicalTitle": "Technical Implementation",
    "environmentVariables": "Environment Variables:",
    "envVarsDesc": "Configure the following environment variables in your deployment environment:",
    "companyLogoVar": "COMPANY_LOGO - Path to your company logo image",
    "companyColorVar": "COMPANY_COLOR - Primary brand color (hex format, e.g., #D36784)",
    "companyNameVar": "COMPANY_NAME - Your company name for display purposes",
    "deploymentTitle": "Deployment & Configuration",
    "vercelDeployment": "Vercel Deployment:",
    "vercelSteps": "1. Set environment variables in Vercel dashboard\n2. Deploy your application\n3. Configure custom domain if needed",
    "otherPlatforms": "Other Platforms:",
    "otherPlatformsDesc": "Similar environment variable configuration applies to other deployment platforms",
    "i18nGuide": "Internationalization (i18n) Guide",
    "i18nDescription": "The platform supports multiple languages using next-intl. Currently, English and Spanish (Mexican) are supported, and you can easily add additional languages to accommodate your global user base.",
    "addingNewLanguages": "Adding New Languages",
    "currentLanguages": "Current Languages:",
    "englishDefault": "English (en) - Default language",
    "spanishMexican": "Spanish Mexican (es-MX)",
    "locatedIn": "Located in",
    "stepsToAdd": "Steps to Add a New Language:",
    "step1": "Create new directory: /locales/[language-code]/",
    "step2": "Copy common.json from /locales/en/ to new directory",
    "step3": "Translate all values in the JSON file",
    "step4": "Update middleware.ts to include new locale",
    "step5": "Test the new language implementation",
    "exampleLanguageCodes": "Example Language Codes:",
    "french": "French: fr or fr-FR",
    "german": "German: de or de-DE",
    "italian": "Italian: it or it-IT",
    "portuguese": "Portuguese: pt or pt-BR",
    "chinese": "Chinese: zh-CN or zh-TW",
    "japanese": "Japanese: ja or ja-JP",
    "translationFileStructure": "Translation File Structure",
    "fileOrganization": "File Organization:",
    "translationCategories": "Translation Categories:",
    "navigationCategory": "navigation - Menu and navigation items",
    "navigationDesc": "header, sidebar, footer content",
    "buttonsCategory": "buttons - Action buttons and controls",
    "buttonsDesc": "save, cancel, delete, import, etc.",
    "dataImportCategory": "dataImport - Import functionality",
    "dataImportDesc": "CSV import, mapping, validation",
    "optimizationCategory": "optimization - Route optimization terms",
    "optimizationDesc": "algorithms, constraints, preferences",
    "messagesCategory": "errors/success - User feedback messages",
    "messagesDesc": "validation, network, completion messages",
    "languageCategory": "language - Language selection UI",
    "languageDesc": "language names and selection interface",
    "implementationConfig": "Implementation & Configuration",
    "technicalImplementation": "Technical Implementation:",
    "configurationSteps": "Configuration Steps:",
    "updateMiddleware": "Update middleware.ts",
    "updateMiddlewareDesc": "Add your new locale to the locales array and configure routing",
    "createI18nConfig": "Create i18n configuration",
    "createI18nConfigDesc": "Set up locale detection and routing preferences",
    "addLanguageSelector": "Add language selector",
    "addLanguageSelectorDesc": "Implement UI component for users to switch languages",
    "testImplementation": "Test implementation",
    "testImplementationDesc": "Verify translations load correctly and URLs work properly",
    "translationBestPractices": "Translation Best Practices:",
    "useNestedKeys": "Use nested keys for organization",
    "useNestedKeysDesc": "Group related translations under common parent keys",
    "keepKeysDescriptive": "Keep keys descriptive and consistent",
    "keepKeysDescriptiveDesc": "Use clear naming conventions across all language files",
    "considerCulturalContext": "Consider cultural context",
    "considerCulturalContextDesc": "Adapt content for cultural differences, not just language",
    "testLongerText": "Test with longer text",
    "testLongerTextDesc": "Some languages require more space for equivalent content"
  }
}

const esMxTranslations = {
  "navigation": {
    "routePlanner": "Planificador de Rutas",
    "routeAnalysis": "Análisis de Rutas",
    "information": "Información",
    "logout": "Cerrar Sesión",
    "admin": "ADMIN"
  },
  "header": {
    "planManageMonitor": "Planifica, gestiona y monitorea tus rutas",
    "routePlanAnalysis": "Análisis de Plan de Ruta",
    "informationDocumentation": "Información y Documentación",
    "editRoute": "Editar Ruta"
  },
  "sidebar": {
    "collapseSidebar": "Contraer barra lateral",
    "expandSidebar": "Expandir barra lateral"
  },
  "footer": {
    "poweredBy": "impulsado por NextBillion.ai",
    "version": "Versión 1.0.0",
    "lastUpdated": "Última actualización"
  },
  "loading": {
    "loadingRoutePlanner": "Cargando Planificador de Rutas...",
    "checkingApiConfig": "Verificando configuración de API..."
  },
  "buttons": {
    "import": "Importar",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "close": "Cerrar",
    "confirm": "Confirmar",
    "back": "Atrás",
    "next": "Siguiente",
    "reset": "Restablecer",
    "add": "Agregar",
    "clear": "Limpiar"
  },
  "dataImport": {
    "importJobsFromDatabase": "Importar Trabajos desde Base de Datos",
    "importVehiclesFromDatabase": "Importar Vehículos desde Base de Datos",
    "startTimeOptional": "Hora de Inicio (opcional)",
    "endTimeOptional": "Hora de Fin (opcional)",
    "searchDescriptionOptional": "Buscar Descripción (opcional)",
    "enterSearchTerm": "Ingrese término de búsqueda...",
    "leaveEmptyToImportAll": "Dejar vacío para importar todos los registros",
    "caseInsensitiveSearch": "Búsqueda insensible a mayúsculas en descripciones de trabajos",
    "caseInsensitiveSearchVehicles": "Búsqueda insensible a mayúsculas en descripciones de vehículos",
    "recordsWillBeImported": "registros serán importados",
    "recordWillBeImported": "registro será importado",
    "importJobData": "Importar Datos de Trabajos",
    "importVehicleData": "Importar Datos de Vehículos",
    "recordsLoaded": "registros cargados",
    "fromDatabase": "(desde base de datos)",
    "selectField": "Seleccionar campo",
    "addAttribute": "Agregar atributo",
    "editTable": "Editar tabla",
    "saveChanges": "Guardar cambios",
    "cancelEditing": "Cancelar edición",
    "deleteImportedData": "Eliminar datos importados",
    "resetMapping": "Restablecer Mapeo",
    "confirmDeletion": "Confirmar Eliminación",
    "deleteConfirmation": "¿Está seguro de que desea eliminar todos los datos de {type} importados? Esta acción no se puede deshacer.",
    "areYouSure": "¿Está seguro?",
    "deleteConfirmationGeneric": "Esto eliminará todos los datos importados. Esta acción no se puede deshacer."
  },
  "table": {
    "selectAllRows": "Seleccionar todas las filas",
    "selectRow": "Seleccionar fila",
    "vehicle": "Vehículo",
    "description": "Descripción",
    "start": "Inicio",
    "end": "Fin",
    "stops": "Paradas",
    "distance": "Distancia",
    "drive": "Conducir",
    "delivery": "Entrega",
    "departure": "Salida",
    "id": "ID",
    "startLocation": "Ubicación de Inicio",
    "endLocation": "Ubicación de Fin",
    "serviceTime": "Tiempo de Servicio"
  },
  "analysis": {
    "optimizationResults": "Resultados de Optimización",
    "noResults": "No se encontraron resultados de optimización",
    "viewResult": "Ver Resultado",
    "editTitle": "Editar Título",
    "deleteResult": "Eliminar Resultado",
    "downloadResults": "Descargar Resultados",
    "shareResults": "Compartir Resultados",
    "optimizationHistory": "Historial de Optimización",
    "jobId": "ID de Trabajo",
    "title": "Título",
    "status": "Estado",
    "createdAt": "Creado En",
    "actions": "Acciones",
    "completed": "Completado",
    "failed": "Fallido",
    "pending": "Pendiente",
    "routeDetails": "Detalles de Ruta",
    "routeSummary": "Resumen de Ruta",
    "stepDetails": "Detalles de Paso",
    "totalDistance": "Distancia Total",
    "totalTime": "Tiempo Total",
    "totalStops": "Paradas Totales",
    "vehicleUtilization": "Utilización de Vehículo",
    "capacityUtilization": "Utilización de Capacidad",
    "timeUtilization": "Utilización de Tiempo"
  },
  "map": {
    "mapView": "Vista de Mapa",
    "showJobMarkers": "Trabajos/Envíos",
    "showVehicleMarkers": "Vehículos",
    "showRoutes": "Rutas"
  },
  "preferences": {
    "preferences": "Preferencias",
    "saveMapping": "Guardar Mapeo",
    "clearPreferences": "Limpiar Preferencias",
    "routingOptions": "Opciones de Enrutamiento",
    "avoidOptions": "Opciones de Evitar",
    "hazmatTypes": "Tipos de Materiales Peligrosos",
    "truckMode": "Modo Camión",
    "carMode": "Modo Auto",
    "bikeMode": "Modo Bicicleta",
    "footMode": "Modo Peatón"
  },
  "hazmatTypes": {
    "explosives": "Explosivos",
    "gases": "Gases",
    "flammableLiquids": "Líquidos Inflamables",
    "flammableSolids": "Sólidos Inflamables",
    "oxidizingSubstances": "Sustancias Oxidantes",
    "toxicSubstances": "Sustancias Tóxicas",
    "radioactiveMaterials": "Materiales Radiactivos",
    "corrosiveSubstances": "Sustancias Corrosivas",
    "miscellaneous": "Varias"
  },
  "avoidOptions": {
    "highways": "Autopistas",
    "tolls": "Peajes",
    "ferries": "Ferrocarriles",
    "indoor": "Interior",
    "dirtRoads": "Campos de tierra"
  },
  "errors": {
    "failedToFetch": "Error al obtener datos",
    "failedToSave": "Error al guardar cambios",
    "failedToDelete": "Error al eliminar",
    "unknownError": "Error desconocido",
    "networkError": "Error de red",
    "validationError": "Error de validación"
  },
  "success": {
    "changesSaved": "Cambios guardados exitosamente",
    "dataDeleted": "Datos eliminados exitosamente",
    "optimizationComplete": "Optimización completada exitosamente"
  },
  "language": {
    "english": "English",
    "spanish": "Español",
    "selectLanguage": "Seleccionar Idioma"
  },
  "information": {
    "pageTitle": "Plataforma de Planificación y Optimización de Rutas",
    "welcomeMessage": "Bienvenido a la Plataforma de Planificación de Rutas de {companyName}, una solución white-label integral impulsada por el motor de optimización avanzado de NextBillion.ai. Esta plataforma proporciona planificación inteligente de rutas, optimización en tiempo real y análisis detallados para operaciones de gestión de flotas.",
    "routeOptimization": "Optimización de Rutas",
    "routeOptimizationDesc": "Los algoritmos avanzados optimizan las rutas para:",
    "minTravelTime": "Tiempo y distancia mínimos de viaje",
    "vehicleCapacity": "Restricciones de capacidad del vehículo",
    "timeWindow": "Cumplimiento de ventanas de tiempo",
    "multiFuel": "Soporte para múltiples tipos de combustible",
    "dataImport": "Importación y Gestión de Datos",
    "dataImportDesc": "Opciones flexibles de importación de datos:",
    "csvExcel": "Carga de archivos CSV/Excel",
    "databaseIntegration": "Integración con base de datos",
    "realTimeMapping": "Mapeo de datos en tiempo real",
    "bulkValidation": "Validación masiva de datos",
    "analytics": "Análisis e Informes",
    "analyticsDesc": "Características integrales de análisis:",
    "fuelMetrics": "Métricas de entrega de combustible",
    "routePerformance": "Análisis de rendimiento de rutas",
    "optimizationHistory": "Historial de optimización",
    "exportCapabilities": "Capacidades de exportación",
    "whiteLabelTitle": "Guía de Personalización White Label",
    "whiteLabelDesc": "Esta plataforma está diseñada como una solución white-label, permitiendo la personalización completa de marca, estilo y funcionalidad para que coincida con la identidad y requisitos de su organización.",
    "brandingTitle": "Personalización de Marca y Visual",
    "logoIdentity": "Logo e Identidad de la Empresa:",
    "replaceLogo": "Reemplazar el logo predeterminado con el logo de su empresa",
    "setCompanyLogo": "Establecer la variable de entorno COMPANY_LOGO o actualizar company_logo.svg en el directorio público",
    "colorScheme": "Personalización del Esquema de Colores:",
    "setCompanyColor": "Establecer la variable de entorno COMPANY_COLOR para personalizar el esquema de colores primario en toda la aplicación",
    "companyName": "Nombre de la Empresa:",
    "setCompanyName": "Establecer la variable de entorno COMPANY_NAME para mostrar el nombre de su empresa en toda la aplicación",
    "technicalTitle": "Implementación Técnica",
    "environmentVariables": "Variables de Entorno:",
    "envVarsDesc": "Configure las siguientes variables de entorno en su entorno de implementación:",
    "companyLogoVar": "COMPANY_LOGO - Ruta a la imagen del logo de su empresa",
    "companyColorVar": "COMPANY_COLOR - Color de marca primario (formato hex, ej., #D36784)",
    "companyNameVar": "COMPANY_NAME - Nombre de su empresa para propósitos de visualización",
    "deploymentTitle": "Implementación y Configuración",
    "vercelDeployment": "Implementación en Vercel:",
    "vercelSteps": "1. Establecer variables de entorno en el panel de Vercel\n2. Implementar su aplicación\n3. Configurar dominio personalizado si es necesario",
    "otherPlatforms": "Otras Plataformas:",
    "otherPlatformsDesc": "Configuración similar de variables de entorno se aplica a otras plataformas de implementación",
    "i18nGuide": "Guía de Internacionalización (i18n)",
    "i18nDescription": "La plataforma soporta múltiples idiomas usando next-intl. Actualmente, se admiten inglés y español (mexicano), y puedes agregar fácilmente idiomas adicionales para acomodar a tu base de usuarios global.",
    "addingNewLanguages": "Agregando Nuevos Idiomas",
    "currentLanguages": "Idiomas Actuales:",
    "englishDefault": "Inglés (en) - Idioma predeterminado",
    "spanishMexican": "Español Mexicano (es-MX)",
    "locatedIn": "Ubicado en",
    "stepsToAdd": "Pasos para Agregar un Nuevo Idioma:",
    "step1": "Crear nuevo directorio: /locales/[código-idioma]/",
    "step2": "Copiar common.json de /locales/en/ al nuevo directorio",
    "step3": "Traducir todos los valores en el archivo JSON",
    "step4": "Actualizar middleware.ts para incluir el nuevo locale",
    "step5": "Probar la implementación del nuevo idioma",
    "exampleLanguageCodes": "Códigos de Idioma de Ejemplo:",
    "french": "Francés: fr o fr-FR",
    "german": "Alemán: de o de-DE",
    "italian": "Italiano: it o it-IT",
    "portuguese": "Portugués: pt o pt-BR",
    "chinese": "Chino: zh-CN o zh-TW",
    "japanese": "Japonés: ja o ja-JP",
    "translationFileStructure": "Estructura de Archivos de Traducción",
    "fileOrganization": "Organización de Archivos:",
    "translationCategories": "Categorías de Traducción:",
    "navigationCategory": "navigation - Elementos de menú y navegación",
    "navigationDesc": "contenido de encabezado, barra lateral, pie de página",
    "buttonsCategory": "buttons - Botones de acción y controles",
    "buttonsDesc": "guardar, cancelar, eliminar, importar, etc.",
    "dataImportCategory": "dataImport - Funcionalidad de importación",
    "dataImportDesc": "importación CSV, mapeo, validación",
    "optimizationCategory": "optimization - Términos de optimización de rutas",
    "optimizationDesc": "algoritmos, restricciones, preferencias",
    "messagesCategory": "errors/success - Mensajes de retroalimentación del usuario",
    "messagesDesc": "mensajes de validación, red, finalización",
    "languageCategory": "language - UI de selección de idioma",
    "languageDesc": "nombres de idiomas e interfaz de selección",
    "implementationConfig": "Implementación y Configuración",
    "technicalImplementation": "Implementación Técnica:",
    "configurationSteps": "Pasos de Configuración:",
    "updateMiddleware": "Actualizar middleware.ts",
    "updateMiddlewareDesc": "Agregar tu nuevo locale al array de locales y configurar enrutamiento",
    "createI18nConfig": "Crear configuración i18n",
    "createI18nConfigDesc": "Configurar detección de locale y preferencias de enrutamiento",
    "addLanguageSelector": "Agregar selector de idioma",
    "addLanguageSelectorDesc": "Implementar componente UI para que los usuarios cambien idiomas",
    "testImplementation": "Probar implementación",
    "testImplementationDesc": "Verificar que las traducciones se cargan correctamente y las URLs funcionan correctamente",
    "translationBestPractices": "Mejores Prácticas de Traducción:",
    "useNestedKeys": "Usar claves anidadas para organización",
    "useNestedKeysDesc": "Agrupar traducciones relacionadas bajo claves padre comunes",
    "keepKeysDescriptive": "Mantener claves descriptivas y consistentes",
    "keepKeysDescriptiveDesc": "Usar convenciones de nomenclatura claras en todos los archivos de idioma",
    "considerCulturalContext": "Considerar contexto cultural",
    "considerCulturalContextDesc": "Adaptar contenido para diferencias culturales, no solo idioma",
    "testLongerText": "Probar con texto más largo",
    "testLongerTextDesc": "Algunos idiomas requieren más espacio para contenido equivalente"
  }
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en')
  const [translations, setTranslations] = useState<any>(enTranslations)
  const [isLoading, setIsLoading] = useState(false)
  const [renderKey, setRenderKey] = useState(0)

  // Load translations based on current language
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true)
      try {
        // Use direct imports instead of fetch
        const newTranslations = language === 'en' ? enTranslations : esMxTranslations
        setTranslations(newTranslations)
        // Force re-render by updating the render key
        setRenderKey(prev => prev + 1)
      } catch (error) {
        // Keep existing translations if loading fails
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [language])

  // Load saved language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es-MX')) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('preferred-language', lang)
  }

  // Translation function
  const t = useCallback((key: string): string => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Return the key if translation not found
        return key
      }
    }
    
    const result = typeof value === 'string' ? value : key
    return result
  }, [translations, language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading, renderKey }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 