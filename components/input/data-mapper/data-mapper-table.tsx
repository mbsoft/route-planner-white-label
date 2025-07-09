import React, { useEffect, useMemo, useRef, useState } from 'react'
import { TableCell, TableRow, Box, InputBase, Typography } from '@mui/material'
import { MapSelector } from './map-selector'
import { InputType } from '../../../models/input/input-core'
import { useCurrentInput } from '../../../hooks/input/use-current-input'
import { useInputStore } from '../../../models/input/store'
import { DataMapperCell } from './data-mapper-cell'
import { MapConfig } from '../../../models/input/input-core'
import { DataMapOption } from './mapping-config/options/interface'
import { MapInputType } from './mapping-config/interface'
import { DeleteOutline } from '@mui/icons-material'

type DataMapperTableProps = {
  inputType: InputType
  isEditing: boolean
  highlightCell: { row: number; col: number } | null
  onCellChange: (row: number, col: number, value: string) => void
  onRepeatToAll?: (row: number, col: number, value: string) => void // New prop
}

function isTimestamp(
  cellIndex: number,
  mapConfig: MapConfig,
  dataOptionMap: Record<string, DataMapOption>,
) {
  const config = mapConfig.dataMappings.find(
    (mapping) => mapping.index === cellIndex,
  )
  if (config) {
    const option = dataOptionMap[config.value]
    if (
      option &&
      (option.type === MapInputType.SingleTimeWindowStart ||
        option.type === MapInputType.SingleTimeWindowEnd ||
        option.type === MapInputType.TimeWindowStart ||
        option.type === MapInputType.TimeWindowEnd)
    ) {
      return true
    }
  }
  return false
}

export function DataMapperTable(props: DataMapperTableProps) {
  const { isEditing, highlightCell } = props
  const [edittingValue, setEdittingValue] = useState<string>('')
  const [edittingCell, setEdittingCell] = useState<{ row: number; col: number }>({
    row: -1,
    col: -1,
  })
  const store = useInputStore()
  const { scrollTableToRight } = store.inputPhase
  const tableRef = useRef<HTMLDivElement>(null)
  const [columnWidths, setColumnWidths] = useState<number[]>([])
  const lastEdittingCell = useRef<{ row: number; col: number }>({
    row: -1,
    col: -1,
  })
  const {
    header,
    rows,
    attachedRows,
    columns,
    inputType,
    mapConfig,
    dataOptionMap,
  } = useCurrentInput(props.inputType)

  const innerColumns = useMemo(() => {
    const dataColumns = header.map((header: string, index: number) => {
      return {
        field: header,
        headerName: header,
        isAttribute: false,
      }
    })
    const attachedSampleRow = attachedRows[0] || []

    const attachedColumns = attachedSampleRow.map((row: string, index: number) => {
      return {
        headerName: `Attribute ${index + 1}`,
        field: `_attribute_${index + 1}`,
        isAttribute: true,
      }
    })

    return [...dataColumns, ...attachedColumns]
  }, [columns, attachedRows])

  useEffect(() => {
    setColumnWidths(innerColumns.map((column) => 240))
  }, [innerColumns])

  const setScrollTableToRightRef = useRef(store.inputPhase.setScrollTableToRight)
  setScrollTableToRightRef.current = store.inputPhase.setScrollTableToRight

  useEffect(() => {
    if (scrollTableToRight) {
      if (tableRef.current && tableRef.current.lastChild) {
        const lastChild = tableRef.current.lastChild as HTMLElement
        lastChild.scrollTo({
          left: 10000,
          behavior: 'instant',
        })
      }
    }
    setScrollTableToRightRef.current(false)
  }, [scrollTableToRight, tableRef])

  function onHeaderResize(index: number, width: number) {
    setColumnWidths((prev) => {
      const newWidths = [...prev]
      newWidths[index] = width > 240 ? width : 240
      return newWidths
    })
  }

  const innerRows = useMemo(() => {
    return rows.map((row: string[], index: number) => {
      if (attachedRows[index]) {
        row = row.concat(attachedRows[index])
      }

      return [...row]
    })
  }, [rows, innerColumns, attachedRows, columns.length])

  useEffect(() => {
    if (highlightCell && tableRef.current) {
      const cell = tableRef.current.querySelector(
        `#cell-${highlightCell.row}-${highlightCell.col}`,
      )
      if (cell) {
        cell.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [highlightCell])

  useEffect(() => {
    if (
      edittingCell.row == -1 &&
      edittingCell.col == -1 &&
      lastEdittingCell.current.row != -1 &&
      lastEdittingCell.current.col != -1
    ) {
      props.onCellChange(
        lastEdittingCell.current.row,
        lastEdittingCell.current.col,
        edittingValue,
      )
      setEdittingValue('')
    }
    lastEdittingCell.current = edittingCell
  }, [edittingCell, props])

  const onCopyAttributeColumn = (columnIndex: number, rowIndex: number) => {
    store.inputCore.copyAttributeColumn(inputType, {
      columnIndex,
      rowIndex,
    })
  }

  return (
    <Box sx={{ height: '100%', overflow: 'scroll' }} ref={tableRef}>
      <Box sx={{ display: 'table', width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'table-row', backgroundColor: '#FFF' }}>
          {innerColumns.map((column, index) => (
            <Box
              key={`${index}`}
              sx={{
                display: 'table-cell',
                width: columnWidths[index],
                minWidth: '240px',
                border: 'none',
                borderRadius: '0px',
                padding: '0px',
                borderRight: '1px solid #e0e0e0',
                borderTop: '1px solid #e0e0e0',
                borderBottom: '1px solid #e0e0e0',
                '&:first-child': {
                  borderLeft: '1px solid #e0e0e0',
                },
              }}
            >
              <MapperTableHeader
                isEditing={isEditing}
                inputType={inputType}
                isAttribute={column.isAttribute}
                index={index}
                headerName={column.headerName}
                onResize={onHeaderResize}
              />
            </Box>
          ))}
        </Box>

        {/* CSV Header Row Reference */}
        <Box sx={{ display: 'table-row', backgroundColor: '#f8f9fa' }}>
          {innerColumns.map((column, index) => (
            <Box
              key={`csv-header-${index}`}
              sx={{
                display: 'table-cell',
                width: columnWidths[index],
                minWidth: '240px',
                border: 'none',
                borderRadius: '0px',
                padding: '8px 12px',
                borderRight: '1px solid #e0e0e0',
                borderBottom: '1px solid #e0e0e0',
                '&:first-child': {
                  borderLeft: '1px solid #e0e0e0',
                },
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#666',
                fontWeight: '500',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={column.isAttribute ? column.headerName : (header[index] || '')}
            >
              {column.isAttribute ? column.headerName : (header[index] || '')}
            </Box>
          ))}
        </Box>
        {/* End CSV Header Row Reference */}

        {/* Rows */}
        {innerRows.map((row: string[], rowIndex: number) => (
          <Box key={rowIndex} sx={{ display: 'table-row' }}>
            {innerColumns.map((column, colIndex: number) => (
              <Box
                key={`${rowIndex}-${colIndex}`}
                id={`cell-${rowIndex}-${colIndex}`}
                sx={{
                  display: 'table-cell',
                  width: columnWidths[colIndex],
                  minWidth: '240px',
                  border: 'none',
                  borderRadius: '0px',
                  padding: '0px',
                  borderRight: '1px solid #e0e0e0',
                  borderBottom: '1px solid #e0e0e0',
                  '&:first-child': {
                    borderLeft: '1px solid #e0e0e0',
                  },
                  backgroundColor: highlightCell?.row === rowIndex && highlightCell?.col === colIndex ? '#fff3cd' : 'transparent',
                }}
              >
                <DataMapperCell
                  value={row[colIndex] || ''}
                  isEditing={isEditing}
                  isTimestamp={isTimestamp(colIndex, mapConfig, dataOptionMap || {})}
                  onValueChange={(value) => {
                    if (isEditing) {
                      props.onCellChange(rowIndex, colIndex, value)
                    }
                  }}
                  onCopy={() => onCopyAttributeColumn(colIndex, rowIndex)}
                  onRepeatToAll={props.onRepeatToAll ? (value) => props.onRepeatToAll!(rowIndex, colIndex, value) : undefined}
                />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function MapperTableHeader(props: {
  isAttribute: boolean
  index: number
  headerName: string
  inputType: InputType
  isEditing: boolean
  onResize: (index: number, width: number) => void
}) {
  const { isAttribute, index, headerName, inputType, isEditing } = props
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setStartX(e.clientX)
    setStartWidth(240) // Default width
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const newWidth = Math.max(240, startWidth + deltaX)
      props.onResize(index, newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, startX, startWidth, index, props])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '40px',
        padding: '0 8px',
        position: 'relative',
        backgroundColor: isAttribute ? '#f5f5f5' : '#fff',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {!isEditing && (
          <MapSelector
            index={index}
            inputType={inputType}
            headerName={headerName}
          />
        )}
        {isEditing && (
          <Typography variant="body2" sx={{ fontSize: '12px' }}>
            {headerName}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: '4px',
          height: '100%',
          cursor: 'col-resize',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
        }}
        onMouseDown={handleResizeMouseDown}
      />
    </Box>
  )
} 