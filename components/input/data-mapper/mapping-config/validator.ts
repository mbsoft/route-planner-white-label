import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export const VALID_TIME_FORMATS = [
  'YYYY-MM-DDTHH:mm:ss.SSSZ',
  'YYYY-MM-DDTHH:mm:ssZ',
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DDTHH:mm',
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD HH:mm',
  'YYYY/MM/DD HH:mm:ss',
  'YYYY/MM/DD HH:mm',
  'DD-MM-YYYY HH:mm:ss',
  'DD-MM-YYYY HH:mm',
  'MMM DD, YYYY HH:mm:ss',
  'MMM DD, YYYY HH:mm',
  'DD MMM YYYY HH:mm:ss',
  'DD MMM YYYY HH:mm',
  'MMMM D, YYYY HH:mm:ss',
  'MMMM D, YYYY HH:mm',
  'D MMMM YYYY HH:mm:ss',
  'D MMMM YYYY HH:mm',
  'YYYY MMM DD HH:mm:ss.SSS zzz',
  "YYYY-MM-DD'T'HH:mm:ss.SSSZ",
  'MM/DD/YYYY HH:mm:ss ZZZZ',
  'MMMM DD, YYYY HH:mm:ss A',
  'MM-DD-YYYY HH:mm:ss A',
]

function isValidLongitude(lng: string) {
  if (typeof lng === 'string' && lng.includes(',')) {
    return false
  }
  const numLng = parseFloat(lng)
  return !isNaN(numLng) && numLng >= -180 && numLng <= 180
}

function isValidLatitude(lat: string) {
  if (typeof lat === 'string' && lat.includes(',')) {
    return false
  }
  const numLat = parseFloat(lat)
  return !isNaN(numLat) && numLat >= -90 && numLat <= 90
}

export const positiveNumberValidator = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedVal = value.trim()
  const parsedValue = Number(trimmedVal)
  if (isNaN(parsedValue)) {
    return [`${fieldName} ${value} is not a valid number`]
  }
  if (parsedValue > 0) {
    return []
  }
  return [`${fieldName} Only positive integers are allowed`]
}

export const nonNegativeNumberValidator = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedVal = value.trim()
  const parsedValue = Number(trimmedVal)
  if (isNaN(parsedValue)) {
    return [`${fieldName} ${value} is not a valid number`]
  }
  if (parsedValue >= 0) {
    return []
  }
  return [`${fieldName} Only non-negative integers are allowed`]
}

export const capacityValidator = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedVal = value.trim()
  const parsedValue = Number(trimmedVal)
  if (value === '') {
    return []
  }
  if (isNaN(parsedValue)) {
    return [`${fieldName} ${value} is not a valid number`]
  }
  if (parsedValue >= 0) {
    return []
  }
  return [`${fieldName} Only integers are allowed`]
}

export const arrayValidator = (
  validator: (value: string, rowIndex: number, fieldName: string) => string[],
): ((value: string, rowIndex: number, fieldName: string) => string[]) => {
  return (value: string, rowIndex: number, fieldName: string) => {
    try {
      const parsedValue = JSON.parse(value)
      if (Array.isArray(parsedValue)) {
        const results = parsedValue.map((v) =>
          validator(v, rowIndex, fieldName),
        )
        return results.flat()
      }
    } catch (error) {
      return [`${fieldName} ${value} is not a valid array`]
    }
    return [`${fieldName} ${value} is not a valid array`]
  }
}

export const skillsFunc = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return []
  }
  try {
    const parsedValue = JSON.parse(trimmedValue)
    if (Array.isArray(parsedValue)) {
      return []
    }
  } catch (error) {
    // If it's not JSON, check if it's a comma-separated string
    const skills = trimmedValue.split(',').map((skill) => skill.trim())
    if (skills.length > 0 && skills.every((skill) => skill.length > 0)) {
      return []
    }
  }
  return [`${fieldName} ${value} is not a valid skills format`]
}

export const latitudeFunc = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return []
  }
  if (!isValidLatitude(trimmedValue)) {
    return [`${fieldName} ${value} is not a valid latitude`]
  }
  return []
}

export const longitudeFunc = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return []
  }
  if (!isValidLongitude(trimmedValue)) {
    return [`${fieldName} ${value} is not a valid longitude`]
  }
  return []
}

export const longlatFunc = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return []
  }
  
  const parts = trimmedValue.split(',').map((part) => part.trim())
  if (parts.length !== 2) {
    return [`${fieldName} ${value} is not a valid longitude,latitude format`]
  }
  
  const [lng, lat] = parts
  if (!isValidLongitude(lng)) {
    return [`${fieldName} ${lng} is not a valid longitude`]
  }
  if (!isValidLatitude(lat)) {
    return [`${fieldName} ${lat} is not a valid latitude`]
  }
  
  return []
}

export function latlongFunc(
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return []
  }
  
  const parts = trimmedValue.split(',').map((part) => part.trim())
  if (parts.length !== 2) {
    return [`${fieldName} ${value} is not a valid latitude,longitude format`]
  }
  
  const [lat, lng] = parts
  if (!isValidLatitude(lat)) {
    return [`${fieldName} ${lat} is not a valid latitude`]
  }
  if (!isValidLongitude(lng)) {
    return [`${fieldName} ${lng} is not a valid longitude`]
  }
  
  return []
}

export const timeFunc = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return []
  }
  
  for (const format of VALID_TIME_FORMATS) {
    if (dayjs(trimmedValue, format, true).isValid()) {
      return []
    }
  }
  
  return [`${fieldName} ${value} is not a valid time format`]
}

export const createNumberRangeValidator = (
  min: number,
  max: number,
  inclusive: boolean = true,
) => {
  return (value: string, rowIndex: number, fieldName: string): string[] => {
    const trimmedVal = value.trim()
    if (trimmedVal === '') {
      return []
    }
    const parsedValue = Number(trimmedVal)
    if (isNaN(parsedValue)) {
      return [`${fieldName} ${value} is not a valid number`]
    }
    if (inclusive) {
      if (parsedValue >= min && parsedValue <= max) {
        return []
      }
    } else {
      if (parsedValue > min && parsedValue < max) {
        return []
      }
    }
    return [`${fieldName} Value must be between ${min} and ${max}${inclusive ? ' (inclusive)' : ''}`]
  }
}

export const parseDepotIds = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return []
  }
  try {
    const parsedValue = JSON.parse(trimmedValue)
    if (Array.isArray(parsedValue)) {
      return []
    }
  } catch (error) {
    // If it's not JSON, check if it's a comma-separated string
    const depotIds = trimmedValue.split(',').map((id) => id.trim())
    if (depotIds.length > 0 && depotIds.every((id) => id.length > 0)) {
      return []
    }
  }
  return [`${fieldName} ${value} is not a valid depot IDs format`]
}

export const parsePickupCapacity = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return []
  }
  try {
    const parsedValue = JSON.parse(trimmedValue)
    if (Array.isArray(parsedValue)) {
      return []
    }
  } catch (error) {
    // If it's not JSON, check if it's a comma-separated string
    const capacities = trimmedValue.split(',').map((cap) => cap.trim())
    if (capacities.length > 0 && capacities.every((cap) => !isNaN(Number(cap)) && Number(cap) >= 0)) {
      return []
    }
  }
  return [`${fieldName} ${value} is not a valid pickup capacity format`]
}

export const parseDeliveryCapacity = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return []
  }
  try {
    const parsedValue = JSON.parse(trimmedValue)
    if (Array.isArray(parsedValue)) {
      return []
    }
  } catch (error) {
    // If it's not JSON, check if it's a comma-separated string
    const capacities = trimmedValue.split(',').map((cap) => cap.trim())
    if (capacities.length > 0 && capacities.every((cap) => !isNaN(Number(cap)) && Number(cap) >= 0)) {
      return []
    }
  }
  return [`${fieldName} ${value} is not a valid delivery capacity format`]
}

export const parseArray = (
  value: string,
  rowIndex: number,
  fieldName: string,
): string[] => {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return []
  }
  try {
    const parsedValue = JSON.parse(trimmedValue)
    if (Array.isArray(parsedValue)) {
      return []
    }
  } catch (error) {
    // If it's not JSON, check if it's a comma-separated string
    const items = trimmedValue.split(',').map((item) => item.trim())
    if (items.length > 0 && items.every((item) => item.length > 0)) {
      return []
    }
  }
  return [`${fieldName} ${value} is not a valid array format`]
} 