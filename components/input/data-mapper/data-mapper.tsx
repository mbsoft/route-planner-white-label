'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { DataMapperTable } from './data-mapper-table'
import { useInputStore } from '../../../models/input/store'
import { InputType } from '../../../models/input/input-core'
import ErrorPanel from './error-panel'
import { confirm } from '@ncc/common/client'

interface DataMapperProps {
  headers: string[]
  rows: string[][]
  attachedRows: string[][]
  inputType: InputType
}

export const DataMapper = function ({
  headers,
  rows,
  inputType,
  attachedRows,
}: DataMapperProps) {
  const store = useInputStore()
  const { isTableEditable } = store.inputPhase
  const { errors } = store.inputCore
  const [dataBeforeEdit, setDataBeforeEdit] = useState<{
    rows: string[][]
    attachedRows: string[][]
  }>({ rows, attachedRows })
  const [highlightCell, setHighlightCell] = useState<{
    row: number
    col: number
  } | null>(null)

  function onCellChange(row: number, col: number, value: string) {
    const newRows = [...rows]
    if (newRows[row]) {
      newRows[row] = [...newRows[row]]
      newRows[row][col] = value
    }
    store.inputCore.setRawData(inputType, {
      header: headers,
      rows: newRows,
      attachedRows,
    })
  }

  function onRepeatToAll(row: number, col: number, value: string) {
    const newRows = rows.map((r, i) => {
      const updated = [...r]
      updated[col] = value
      return updated
    })
    
    // If we're in editing mode, we need to update the parent's editing state
    // For now, we'll update the store directly since the DataMapper doesn't have access to the parent's editing state
    store.inputCore.setRawData(inputType, {
      header: headers,
      rows: newRows,
      attachedRows,
    })
  }

  function onItemHover(errorInfo: { rowIndex: number; columnIndex: number } | null) {
    if (errorInfo) {
      setHighlightCell({
        row: errorInfo.rowIndex,
        col: errorInfo.columnIndex,
      })
    } else {
      setHighlightCell(null)
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <ErrorPanel
        errors={errors[inputType]}
        style={{
          position: 'absolute',
          top: '65px',
          right: '120px',
          zIndex: 100,
        }}
        onItemHover={onItemHover}
      />
      {/* Table container with fixed height for 10 rows, scrollable */}
      <Box sx={{ height: '400px', overflowY: 'auto', flex: 'none' }}>
        <DataMapperTable
          inputType={inputType}
          isEditing={isTableEditable}
          highlightCell={highlightCell}
          onCellChange={onCellChange}
          onRepeatToAll={onRepeatToAll}
        />
      </Box>
    </Box>
  )
} 