import {MapInputType, VehicleMapOption} from '../interface'
import {DataMapOption, MenuInfo} from './interface'
import {
  positiveNumberValidator,
  skillsFunc,
  longlatFunc,
  latitudeFunc,
  longitudeFunc,
  timeFunc,
  capacityValidator,
  arrayValidator,
  latlongFunc,
  alternativeCapacityValidator,
} from '../validator'

export const VEHICLE_OPTIONS: DataMapOption[] = [
  {
    label: 'ID',
    value: VehicleMapOption.ID,
    required: true,
  },
  {
    label: 'Description',
    value: VehicleMapOption.Description,
    type: MapInputType.Description,
  },
  {
    label: 'Max Tasks',
    value: VehicleMapOption.MaxTasks,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Skills',
    value: VehicleMapOption.Skills,
    type: MapInputType.Skills,
    validators: [skillsFunc],
  },
  {
    label: 'Start Location (Lat,Lng)',
    value: VehicleMapOption.StartLocationLatLng,
    type: MapInputType.LocationLatLng,
    required: true,
    validators: [latlongFunc],
    extra: {
      parent: 'start_location',
      alternativeTo: 'start_location#lngLat',
    },
  },
  {
    label: 'Start Location (Lng,Lat)',
    value: VehicleMapOption.StartLocationLngLat,
    type: MapInputType.LocationLngLat,
    required: true,
    validators: [longlatFunc],
    extra: {
      parent: 'start_location',
      alternativeTo: 'start_location',
    },
  },
  {
    label: 'Start Location Lat',
    value: VehicleMapOption.StartLocationLat,
    extra: {
      parent: 'start_location',
      alternativeTo: 'start_location',
    },
    required: true,
    type: MapInputType.LocationLat,
    validators: [latitudeFunc],
  },
  {
    label: 'Start Location Lng',
    value: VehicleMapOption.StartLocationLng,
    extra: {
      parent: 'start_location',
      alternativeTo: 'start_location',
    },
    required: true,
    type: MapInputType.LocationLng,
    validators: [longitudeFunc],
  },
  {
    label: 'End Location (Lat,Lng)',
    value: VehicleMapOption.EndLocationLatLng,
    type: MapInputType.LocationLatLng,
    required: true,
    validators: [latlongFunc],
    extra: {
      parent: 'end_location',
    },
  },
  {
    label: 'End Location (Lng,Lat)',
    value: VehicleMapOption.EndLocationLngLat,
    type: MapInputType.LocationLngLat,
    required: true,
    validators: [longlatFunc],
    extra: {
      parent: 'end_location',
    },
  },
  {
    label: 'End Location Lat',
    value: VehicleMapOption.EndLocationLat,
    extra: {
      parent: 'end_location',
      alternativeTo: 'end_location',
    },
    required: true,
    type: MapInputType.LocationLat,
    validators: [latitudeFunc],
  },
  {
    label: 'End Location Lng',
    value: VehicleMapOption.EndLocationLng,
    extra: {
      parent: 'end_location',
      alternativeTo: 'end_location',
    },
    required: true,
    type: MapInputType.LocationLng,
    validators: [longitudeFunc],
  },
  {
    label: 'Start Time',
    value: VehicleMapOption.StartTime,
    type: MapInputType.SingleTimeWindowStart,
    validators: [timeFunc],
  },
  {
    label: 'End Time',
    value: VehicleMapOption.EndTime,
    type: MapInputType.SingleTimeWindowEnd,
    validators: [timeFunc],
  },
  {
    label: 'Depot ID',
    value: VehicleMapOption.DepotID,
  },
  {
    label: 'Start Depot IDs',
    value: VehicleMapOption.StartDepotIDs,
    type: MapInputType.Start_Depot_IDs,
    extra: {
      parent: 'start_depot_ids',
      divider: true,
    },
  },
  {
    label: 'Start Depot ID 1',
    value: VehicleMapOption.StartDepotID1,
    type: MapInputType.Start_Depot_IDs,
    extra: {
      index: 0,
      parent: 'start_depot_ids',
      incrementIndex: true,
      maxLength: 5,
      baseLabel: 'Start Depot ID',
      alternativeTo: 'start_depot_ids',
    },
  },
  {
    label: 'End Depot IDs',
    value: VehicleMapOption.EndDepotIDs,
    type: MapInputType.End_Depot_IDs,
    extra: {
      parent: 'end_depot_ids',
      divider: true,
    },
  },
  {
    label: 'End Depot ID 1',
    value: VehicleMapOption.EndDepotID1,
    type: MapInputType.End_Depot_IDs,
    extra: {
      index: 0,
      parent: 'end_depot_ids',
      incrementIndex: true,
      maxLength: 5,
      baseLabel: 'End Depot ID',
      alternativeTo: 'end_depot_ids',
    },
  },
  {
    label: 'Capacities',
    value: VehicleMapOption.Capacities,
    type: MapInputType.Capacity,
    validators: [arrayValidator(positiveNumberValidator)],
    extra: {
      divider: true,
      parent: 'capacity',
    },
  },
  {
    label: 'Alternative Capacities',
    value: VehicleMapOption.AlternativeCapacities,
    type: MapInputType.AlternativeCapacity,
    validators: [alternativeCapacityValidator],
    extra: {
      divider: true,
      parent: 'alternative_capacities',
    },
  },
  {
    label: 'Capacity 1',
    value: VehicleMapOption.Capacity1,
    type: MapInputType.Capacity,
    extra: {
      index: 0,
      parent: 'capacity',
      alternativeTo: 'capacity',
    },
    validators: [positiveNumberValidator],
  },
  {
    label: 'Capacity 2',
    value: VehicleMapOption.Capacity2,
    type: MapInputType.Capacity,
    extra: {
      index: 1,
      parent: 'capacity',
      alternativeTo: 'capacity',
    },
    validators: [positiveNumberValidator],
  },
  {
    label: 'Capacity 3',
    value: VehicleMapOption.Capacity3,
    type: MapInputType.Capacity,
    extra: {
      index: 2,
      parent: 'capacity',
      incrementIndex: true,
      maxLength: 5,
      baseLabel: 'Capacity',
      alternativeTo: 'capacity',
    },
    validators: [positiveNumberValidator],
  },
  {
    label: 'Speed Factor',
    value: VehicleMapOption.SpeedFactor,
    type: MapInputType.Float,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Fixed Cost',
    value: VehicleMapOption.FixedCost,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Cost Per Hour',
    value: VehicleMapOption.CostPerHour,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Cost Per Km.',
    value: VehicleMapOption.CostPerKm,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Max Travel Cost',
    value: VehicleMapOption.MaxTravelCost,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
]

export const VEHICLE_OPTIONS_MAP: Record<string, DataMapOption> = {
  [VehicleMapOption.ID]: {
    label: 'ID',
    value: VehicleMapOption.ID,
    required: true,
  },
  [VehicleMapOption.Description]: {
    label: 'Description',
    value: VehicleMapOption.Description,
    type: MapInputType.Description,
  },
  [VehicleMapOption.MaxTasks]: {
    label: 'Max Tasks',
    value: VehicleMapOption.MaxTasks,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [VehicleMapOption.Skills]: {
    label: 'Skills',
    value: VehicleMapOption.Skills,
    type: MapInputType.Skills,
    validators: [skillsFunc],
  },
  [VehicleMapOption.StartLocationLngLat]: {
    label: 'Start Location',
    value: VehicleMapOption.StartLocationLngLat,
    type: MapInputType.LocationLngLat,
    required: true,
    validators: [longlatFunc],
    extra: {
      parent: 'start_location',
      alternativeTo: 'start_location#lngLat',
    },
  },
  [VehicleMapOption.StartLocationLatLng]: {
    label: 'Start Location (Lat,Lng)',
    value: VehicleMapOption.StartLocationLatLng,
    type: MapInputType.LocationLatLng,
    required: true,
    validators: [latlongFunc],
    extra: {
      parent: 'start_location',
      alternativeTo: 'start_location',
    },
  },
  [VehicleMapOption.StartLocationLat]: {
    label: 'Start Location Lat',
    value: VehicleMapOption.StartLocationLat,
    extra: {
      parent: 'start_location',
      alternativeTo: 'start_location',
    },
    required: true,
    type: MapInputType.LocationLat,
    validators: [latitudeFunc],
  },
  [VehicleMapOption.StartLocationLng]: {
    label: 'Start Location Lng',
    value: VehicleMapOption.StartLocationLng,
    extra: {
      parent: 'start_location',
      alternativeTo: 'start_location',
    },
    required: true,
    type: MapInputType.LocationLng,
    validators: [longitudeFunc],
  },
  [VehicleMapOption.EndLocationLngLat]: {
    label: 'End Location',
    value: VehicleMapOption.EndLocationLngLat,
    type: MapInputType.LocationLngLat,
    required: true,
    validators: [longlatFunc],
    extra: {
      parent: 'end_location',
    },
  },
  [VehicleMapOption.EndLocationLatLng]: {
    label: 'End Location (Lat,Lng)',
    value: VehicleMapOption.EndLocationLatLng,
    type: MapInputType.LocationLatLng,
    required: true,
    validators: [latlongFunc],
    extra: {
      parent: 'end_location',
    },
  },
  [VehicleMapOption.EndLocationLat]: {
    label: 'End Location Lat',
    value: VehicleMapOption.EndLocationLat,
    extra: {
      parent: 'end_location',
      alternativeTo: 'end_location',
    },
    required: true,
    type: MapInputType.LocationLat,
    validators: [latitudeFunc],
  },
  [VehicleMapOption.EndLocationLng]: {
    label: 'End Location Lng',
    value: VehicleMapOption.EndLocationLng,
    extra: {
      parent: 'end_location',
      alternativeTo: 'end_location',
    },
    required: true,
    type: MapInputType.LocationLng,
    validators: [longitudeFunc],
  },
  [VehicleMapOption.StartTime]: {
    label: 'Start Time',
    value: VehicleMapOption.StartTime,
    type: MapInputType.SingleTimeWindowStart,
    validators: [timeFunc],
  },
  [VehicleMapOption.EndTime]: {
    label: 'End Time',
    value: VehicleMapOption.EndTime,
    type: MapInputType.SingleTimeWindowEnd,
    validators: [timeFunc],
  },
  [VehicleMapOption.DepotID]: {
    label: 'Depot ID',
    value: VehicleMapOption.DepotID,
  },
  [VehicleMapOption.StartDepotIDs]: {
    label: 'Start Depot IDs',
    value: VehicleMapOption.StartDepotIDs,
    type: MapInputType.Start_Depot_IDs,
    extra: {
      parent: 'start_depot_ids',
      divider: true,
    },
  },
  [VehicleMapOption.StartDepotID1]: {
    label: 'Start Depot ID 1',
    value: VehicleMapOption.StartDepotID1,
    type: MapInputType.Start_Depot_IDs,
    extra: {
      index: 0,
      parent: 'start_depot_ids',
      incrementIndex: true,
      maxLength: 5,
      baseLabel: 'Start Depot ID',
      alternativeTo: 'start_depot_ids',
    },
  },
  [VehicleMapOption.EndDepotIDs]: {
    label: 'End Depot IDs',
    value: VehicleMapOption.EndDepotIDs,
    type: MapInputType.End_Depot_IDs,
    extra: {
      parent: 'end_depot_ids',
      divider: true,
    },
  },
  [VehicleMapOption.EndDepotID1]: {
    label: 'End Depot ID 1',
    value: VehicleMapOption.EndDepotID1,
    type: MapInputType.End_Depot_IDs,
    extra: {
      index: 0,
      parent: 'end_depot_ids',
      incrementIndex: true,
      maxLength: 5,
      baseLabel: 'End Depot ID',
      alternativeTo: 'end_depot_ids',
    },
  },
  [VehicleMapOption.Capacities]: {
    label: 'Capacities',
    value: VehicleMapOption.Capacities,
    type: MapInputType.Capacity,
    validators: [positiveNumberValidator],
    extra: {
      divider: true,
      parent: 'capacity',
    },
  },
  [VehicleMapOption.AlternativeCapacities]: {
    label: 'Alternative Capacities',
    value: VehicleMapOption.AlternativeCapacities,
    type: MapInputType.AlternativeCapacity,
    validators: [alternativeCapacityValidator],
    extra: {
      divider: true,
      parent: 'alternative_capacities',
    },
  },
  [VehicleMapOption.Capacity1]: {
    label: 'Capacity 1',
    value: VehicleMapOption.Capacity1,
    type: MapInputType.Capacity,
    extra: {
      index: 0,
      parent: 'capacity',
      alternativeTo: 'capacity',
    },
    validators: [capacityValidator],
  },
  [VehicleMapOption.Capacity2]: {
    label: 'Capacity 2',
    value: VehicleMapOption.Capacity2,
    type: MapInputType.Capacity,
    extra: {
      index: 1,
      parent: 'capacity',
      alternativeTo: 'capacity',
    },
    validators: [capacityValidator],
  },
  [VehicleMapOption.Capacity3]: {
    label: 'Capacity 3',
    value: VehicleMapOption.Capacity3,
    type: MapInputType.Capacity,
    extra: {
      index: 2,
      parent: 'capacity',
      incrementIndex: true,
      maxLength: 5,
      baseLabel: 'Capacity',
      alternativeTo: 'capacity',
    },
    validators: [capacityValidator],
  },
  [VehicleMapOption.SpeedFactor]: {
    label: 'Speed Factor',
    value: VehicleMapOption.SpeedFactor,
    type: MapInputType.Float,
    validators: [positiveNumberValidator],
  },
  [VehicleMapOption.FixedCost]: {
    label: 'Fixed Cost',
    value: VehicleMapOption.FixedCost,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [VehicleMapOption.CostPerHour]: {
    label: 'Cost Per Hour',
    value: VehicleMapOption.CostPerHour,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [VehicleMapOption.CostPerKm]: {
    label: 'Cost Per Km.',
    value: VehicleMapOption.CostPerKm,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [VehicleMapOption.MaxTravelCost]: {
    label: 'Max Travel Cost',
    value: VehicleMapOption.MaxTravelCost,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
}

export const VEHICLE_OPTION_MENU_LIST: MenuInfo[] = [
  {
    label: 'ID',
    value: VehicleMapOption.ID,
    required: true,
  },
  {
    label: 'Description',
    value: VehicleMapOption.Description,
  },
  {
    label: 'Max Tasks',
    value: VehicleMapOption.MaxTasks,
  },
  {
    label: 'Skills',
    value: VehicleMapOption.Skills,
  },
  {
    label: 'Start Location (Lat,Lng)',
    value: VehicleMapOption.StartLocationLatLng,
    required: true,
  },
  {
    label: 'Start Location (Lng,Lat)',
    value: VehicleMapOption.StartLocationLngLat,
    required: true,
  },
  {
    label: 'Start Location Lat',
    value: VehicleMapOption.StartLocationLat,
    required: true,
  },
  {
    label: 'Start Location Lng',
    value: VehicleMapOption.StartLocationLng,
    required: true,
  },
  {
    label: 'End Location (Lat,Lng)',
    value: VehicleMapOption.EndLocationLatLng,
    required: true,
  },
  {
    label: 'End Location (Lng,Lat)',
    value: VehicleMapOption.EndLocationLngLat,
    required: true,
  },
  {
    label: 'End Location Lat',
    value: VehicleMapOption.EndLocationLat,
    required: true,
  },
  {
    label: 'End Location Lng',
    value: VehicleMapOption.EndLocationLng,
    required: true,
  },
  {
    label: 'Start Time',
    value: VehicleMapOption.StartTime,
  },
  {
    label: 'End Time',
    value: VehicleMapOption.EndTime,
  },
  {
    label: 'Depot ID',
    value: VehicleMapOption.DepotID,
  },
  {
    label: 'Start Depot IDs',
    value: VehicleMapOption.StartDepotIDs,
  },
  {
    label: 'Start Depot ID 1',
    value: VehicleMapOption.StartDepotID1,
  },
  {
    label: 'End Depot IDs',
    value: VehicleMapOption.EndDepotIDs,
  },
  {
    label: 'End Depot ID 1',
    value: VehicleMapOption.EndDepotID1,
  },
  {
    label: 'Capacities',
    value: VehicleMapOption.Capacities,
  },
  {
    label: 'Alternative Capacities',
    value: VehicleMapOption.AlternativeCapacities,
  },
  {
    label: 'Capacity 1',
    value: VehicleMapOption.Capacity1,
  },
  {
    label: 'Capacity 2',
    value: VehicleMapOption.Capacity2,
  },
  {
    label: 'Capacity 3',
    value: VehicleMapOption.Capacity3,
  },
  {
    label: 'Speed Factor',
    value: VehicleMapOption.SpeedFactor,
  },
  {
    label: 'Fixed Cost',
    value: VehicleMapOption.FixedCost,
  },
  {
    label: 'Cost Per Hour',
    value: VehicleMapOption.CostPerHour,
  },
  {
    label: 'Cost Per Km.',
    value: VehicleMapOption.CostPerKm,
  },
  {
    label: 'Max Travel Cost',
    value: VehicleMapOption.MaxTravelCost,
  },
] 