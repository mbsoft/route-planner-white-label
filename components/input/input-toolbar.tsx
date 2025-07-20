'use client'

import {useState, useMemo} from 'react'
import {InputOption} from '../../models/input/input-phrase'
import { useWhiteLabelContext } from '../../app/white-label-layout'
import { useLanguage } from '../../contexts/language-context'

interface InputToolbarProps {
  currentPhase: InputOption
  onPhaseChange: (phase: InputOption) => void
}

export default function InputToolbar({currentPhase, onPhaseChange}: InputToolbarProps) {
  const [isDebugMode, setIsDebugMode] = useState(false)
  const { companyColor } = useWhiteLabelContext()
  const { t, language } = useLanguage()

  const phases = useMemo(() => [
    {key: InputOption.PREFERENCE, label: t('inputToolbar.preferences')},
    {key: InputOption.ORDER, label: t('inputToolbar.orders')},
    {key: InputOption.VEHICLE, label: t('inputToolbar.vehicles')},
    {key: InputOption.DEPOT, label: t('inputToolbar.depots')},
  ], [t, language])

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
        {t('inputToolbar.routePlannerWhiteLabel')}
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
              backgroundColor: currentPhase === phase.key ? companyColor : '#f5f5f5',
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
          {t('inputToolbar.debug')}
        </button>
      </div>
    </div>
  )
} 