import {
  VehicleMapOption,
  JobMapOption,
  ShipmentMapOption,
} from '../interface'

import {MapInputType} from '../interface'

export type MenuInfo = {
  label?: string
  value: string
  addable?: boolean
  required?: boolean
  children?: MenuInfo[]
  disabled?: boolean
}

export interface DataMapOption {
  label: string
  value: DataMapOptionType
  type?: MapInputType
  required?: boolean
  extra?: Record<string, any>
  realKey?: string
  validators?: ((
    value: string,
    rowIndex: number,
    fieldName: string,
  ) => string[])[]
}

export type DataMapOptionType =
  | VehicleMapOption
  | JobMapOption
  | ShipmentMapOption 