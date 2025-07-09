'use client'

import {useState} from 'react'
import {InputOption} from '../../models/input/input-phrase'

interface InputToolbarProps {
  currentPhase: InputOption
  onPhaseChange: (phase: InputOption) => void
}

export default function InputToolbar({currentPhase, onPhaseChange}: InputToolbarProps) {
  const [isDebugMode, setIsDebugMode] = useState(false)

  const phases = [
    {key: InputOption.PREFERENCE, label: 'Preferences'},
    {key: InputOption.ORDER, label: 'Orders'},
    {key: InputOption.VEHICLE, label: 'Vehicles'},
    {key: InputOption.DEPOT, label: 'Depots'},
  ]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 32px',
      color: '#626B84',
      backgroundColor: 'rgba(244, 244, 247, 1)',
      fontSize: '16px',
      borderBottom: '1px solid #e0e0e0'
    }}>
      <div style={{flex: 1, fontSize: '16px', fontWeight: 'bold'}}>
        Route Planner - White Label
      </div>
      
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        {phases.map((phase) => (
          <button
            key={phase.key}
            onClick={() => onPhaseChange(phase.key)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: currentPhase === phase.key ? '#1976d2' : '#f5f5f5',
              color: currentPhase === phase.key ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {phase.label}
          </button>
        ))}
        
        <button
          onClick={() => setIsDebugMode(!isDebugMode)}
          style={{
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: isDebugMode ? '#ffeb3b' : '#f5f5f5',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Debug
        </button>
      </div>
    </div>
  )
} 