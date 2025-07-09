import React, { useMemo, useState, useCallback } from 'react'
import { Button, IconButton, Box, Typography } from '@mui/material'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { MenuInfo } from './mapping-config/options/interface'
import { useCurrentInput } from '../../../hooks/input/use-current-input'
import { useInputStore } from '../../../models/input/store'
import { InputType } from '../../../models/input/input-core'
import MappingPopover from './mapping-popover'

type MapSelectorProps = {
  index: number
  inputType: InputType
  headerName: string
}

export function MapSelector({ index, inputType, headerName }: MapSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const store = useInputStore()
  const { dataOptionMenuList } = useCurrentInput(inputType)
  const { mapConfig } = store.inputCore[inputType]

  const currentMapping = useMemo(() => {
    return mapConfig.dataMappings.find((mapping) => mapping.index === index)
  }, [mapConfig.dataMappings, index])

  const currentOption = useMemo(() => {
    if (!currentMapping || !dataOptionMenuList) return null
    return dataOptionMenuList.find((option) => option.value === currentMapping.value)
  }, [currentMapping, dataOptionMenuList])

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const onSelectDataMapMenuInfo = useCallback((option: MenuInfo) => {
    const newMappings = mapConfig.dataMappings.filter((mapping) => mapping.index !== index)
    newMappings.push({
      index,
      value: option.value,
    })
    
    store.inputCore.setMapConfig(inputType, {
      ...mapConfig,
      dataMappings: newMappings,
    })
    handleClose()
  }, [mapConfig, index, inputType, store.inputCore, handleClose])

  const onClearMapping = useCallback(() => {
    const newMappings = mapConfig.dataMappings.filter((mapping) => mapping.index !== index)
    store.inputCore.setMapConfig(inputType, {
      ...mapConfig,
      dataMappings: newMappings,
    })
  }, [mapConfig, index, inputType, store.inputCore])

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Button
          onClick={handleClick}
          variant="text"
          size="small"
          sx={{
            flex: 1,
            justifyContent: 'flex-start',
            textTransform: 'none',
            fontSize: '12px',
            color: currentOption ? '#333' : '#999',
            padding: '4px 8px',
            minHeight: '32px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
          endIcon={<ArrowDropDownIcon sx={{ fontSize: '16px', color: '#666' }} />}
        >
          <Typography variant="body2" sx={{ fontSize: '12px' }}>
            {currentOption?.label || 'Select field'}
          </Typography>
        </Button>
        {currentMapping && (
          <IconButton
            size="small"
            onClick={onClearMapping}
            sx={{
              ml: 0.5,
              width: '16px',
              height: '16px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <CloseOutlinedIcon sx={{ fontSize: '12px' }} />
          </IconButton>
        )}
      </Box>

      <MappingPopover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        dataOptionMenuList={dataOptionMenuList || []}
        onSelectDataMapOption={onSelectDataMapMenuInfo}
        currentMappings={mapConfig.dataMappings}
        currentColumnIndex={index}
      />
    </>
  )
} 