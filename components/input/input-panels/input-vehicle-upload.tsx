'use client'

import { useState } from 'react'
import { FileDropZone } from './file-drop-zone'
import { DataTable } from './data-table'
import { useInputStore } from '../../../models/input/store'

export const InputVehicleUpload = () => {
  const store = useInputStore()
  const { vehicle } = store.inputCore

  const handleDataUpload = (header: string[], data: string[][]) => {
    store.inputCore.setRawData('vehicle', {
      header,
      rows: data,
      attachedRows: [],
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3
        style={{
          color: '#585656',
          fontSize: '16px',
          marginBottom: '13px',
          fontWeight: '500',
        }}
      >
        Import Vehicle Fleet Data
      </h3>

      <p
        style={{
          color: '#666',
          fontSize: '14px',
          marginBottom: '20px',
        }}
      >
        Upload your vehicle fleet information including capacity, working hours, and constraints.
      </p>

      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <FileDropZone
          onDataUpload={handleDataUpload}
          sampleLink="https://static.nextbillion.io/ncc/route-planner-v2/data/vehicle_sample_data.zip"
        />
      </div>

      {/* Remove DataTable rendering here */}
    </div>
  )
} 