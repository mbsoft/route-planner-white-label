'use client'

import {useState, useEffect} from 'react'
import {useWhiteLabelContext} from '../white-label-layout'
import {InputOption, InputPage} from '../../models/input/input-phrase'
import InputToolbar from '../../components/input/input-toolbar'
import {InputImportPage} from '../../components/input/input-import-page'
import {ApiDemo} from '../../components/api-demo'

export default function Index() {
  const {apiKey, isLoading, error} = useWhiteLabelContext()
  const [currentPage, setCurrentPage] = useState<InputPage>(InputPage.IMPORT)
  const [currentPhase, setCurrentPhase] = useState<InputOption>(InputOption.PREFERENCE)

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading Route Planner...
        <br />
        <small>Checking API configuration...</small>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'red',
        fontSize: '18px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h2>Configuration Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const handlePhaseChange = (phase: InputOption) => {
    setCurrentPhase(phase)
  }

  const handleNextPhase = () => {
    const phases = [InputOption.PREFERENCE, InputOption.ORDER, InputOption.VEHICLE, InputOption.DEPOT]
    const currentIndex = phases.indexOf(currentPhase)
    
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1])
    } else {
      // Move to preview page
      setCurrentPage(InputPage.PREVIEW)
    }
  }

  if (currentPage === InputPage.PREVIEW) {
    return (
      <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
        <InputToolbar currentPhase={currentPhase} onPhaseChange={handlePhaseChange} />
        
        <div style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2>Route Preview</h2>
          <p>Routes have been generated successfully!</p>
          <button
            onClick={() => setCurrentPage(InputPage.IMPORT)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Back to Input
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <InputToolbar currentPhase={currentPhase} onPhaseChange={handlePhaseChange} />
      
      <div style={{flex: 1, display: 'flex'}}>
        <div style={{flex: 1}}>
          <InputImportPage currentPhase={currentPhase} onNextPhase={handleNextPhase} />
        </div>
        
        <div style={{
          width: '300px',
          borderLeft: '1px solid #e0e0e0',
          padding: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>API Status</h3>
          <div style={{
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            marginBottom: '20px'
          }}>
            <p style={{color: 'green', fontWeight: 'bold', margin: 0}}>
              ✓ API Key: {apiKey ? 'Configured' : 'Missing'}
            </p>
          </div>
          
          <ApiDemo />
        </div>
      </div>
    </div>
  )
} 