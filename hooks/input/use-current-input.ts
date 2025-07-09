import { useMemo } from 'react'
import { useInputStore } from '../../models/input/store'
import { InputType } from '../../../models/input/input-core'
import {
  VEHICLE_OPTION_MENU_LIST,
  JOB_OPTION_MENU_LIST,
  SHIPMENT_OPTION_MENU_LIST,
  MenuInfo,
  JOB_OPTIONS_MAP,
  SHIPMENT_OPTIONS_MAP,
  VEHICLE_OPTIONS_MAP,
} from '../../components/input/data-mapper/mapping-config/options'

const getDataOptionMenuList = (dataType: InputType) => {
  switch (dataType) {
    case 'vehicle':
      return VEHICLE_OPTION_MENU_LIST
    case 'job':
      return JOB_OPTION_MENU_LIST
    case 'shipment':
      return SHIPMENT_OPTION_MENU_LIST
  }
}

const getDataOptionMap = (dataType: InputType) => {
  switch (dataType) {
    case 'vehicle':
      return VEHICLE_OPTIONS_MAP
    case 'job':
      return JOB_OPTIONS_MAP
    case 'shipment':
      return SHIPMENT_OPTIONS_MAP
  }
}

export const useCurrentInput = (inputType: InputType) => {
  const store = useInputStore()
  const inputData = store.inputCore[inputType]
  
  return useMemo(() => ({
    header: inputData.rawData.header,
    rows: inputData.rawData.rows,
    attachedRows: inputData.rawData.attachedRows,
    columns: inputData.rawData.header,
    inputType,
    mapConfig: inputData.mapConfig,
    dataOptionMap: getDataOptionMap(inputType),
    dataOptionMenuList: getDataOptionMenuList(inputType),
  }), [inputData.rawData.header, inputData.rawData.rows, inputData.rawData.attachedRows, inputData.mapConfig, inputType])
} 