'use client'

import { useState } from 'react'
import { FileDropZone } from './file-drop-zone'
import { DataTable } from './data-table'
import { useInputStore } from '../../../models/input/store'

const ORDER_TYPE_OPTIONS = [
  { label: 'Job (either pickup or delivery)', value: 'job' },
  { label: 'Shipment (both pickup & delivery)', value: 'shipment' },
]

export const InputJobUpload = () => {
  const [orderType, setOrderType] = useState<'job' | 'shipment'>('job')
  const store = useInputStore()

  const handleDataUpload = (header: string[], data: string[][]) => {
    const inputType = orderType === 'job' ? 'job' : 'shipment'
    store.inputCore.setRawData(inputType, {
      header,
      rows: data,
      attachedRows: [],
    })
  }

  const getSampleLink = () => {
    return orderType === 'job'
      ? 'https://static.nextbillion.io/ncc/route-planner-v2/data/job_sample_data.zip'
      : 'https://static.nextbillion.io/ncc/route-planner-v2/data/shipment_sample_data.zip'
  }

  const currentData = orderType === 'job' ? store.inputCore.job.rawData : store.inputCore.shipment.rawData

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
        Are you uploading a Job or a Shipment?
      </h3>

      <div
        style={{
          display: 'flex',
          marginBottom: '20px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {ORDER_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setOrderType(option.value as 'job' | 'shipment')}
            style={{
              flex: 1,
              padding: '10px 20px',
              border: 'none',
              backgroundColor: orderType === option.value ? '#1976d2' : '#f5f5f5',
              color: orderType === option.value ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <FileDropZone onDataUpload={handleDataUpload} sampleLink={getSampleLink()} />
      </div>

      {/* Remove DataTable rendering here */}
    </div>
  )
} 