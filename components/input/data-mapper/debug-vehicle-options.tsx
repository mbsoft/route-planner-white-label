import React from 'react'
import { VEHICLE_OPTION_MENU_LIST } from './mapping-config/options/vehicle'

export const DebugVehicleOptions = () => {
  console.log('=== DEBUG: Vehicle Options ===')
  console.log('Total options:', VEHICLE_OPTION_MENU_LIST.length)
  console.log('End Time option:', VEHICLE_OPTION_MENU_LIST.find(option => option.label === 'End Time'))
  console.log('Start Time option:', VEHICLE_OPTION_MENU_LIST.find(option => option.label === 'Start Time'))
  
  const timeOptions = VEHICLE_OPTION_MENU_LIST.filter(option => 
    option.label.includes('Time') || option.value.includes('time')
  )
  console.log('All time-related options:', timeOptions)
  
  return (
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0', margin: '10px' }}>
      <h4>Debug: Vehicle Options</h4>
      <p>Total options: {VEHICLE_OPTION_MENU_LIST.length}</p>
      <p>End Time found: {VEHICLE_OPTION_MENU_LIST.find(option => option.label === 'End Time') ? 'Yes' : 'No'}</p>
      <p>Start Time found: {VEHICLE_OPTION_MENU_LIST.find(option => option.label === 'Start Time') ? 'Yes' : 'No'}</p>
      <div>
        <h5>All Options:</h5>
        <ul>
          {VEHICLE_OPTION_MENU_LIST.map((option, index) => (
            <li key={index} style={{ color: option.label === 'End Time' ? 'red' : 'black' }}>
              {option.label} ({option.value})
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}


