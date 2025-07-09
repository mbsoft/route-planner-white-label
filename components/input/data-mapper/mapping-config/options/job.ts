import {MapInputType, JobMapOption} from '../interface'
import {DataMapOption, MenuInfo} from './interface'
import {
  positiveNumberValidator,
  skillsFunc,
  longlatFunc,
  latitudeFunc,
  longitudeFunc,
  timeFunc,
  createNumberRangeValidator,
  latlongFunc,
  nonNegativeNumberValidator,
  parseDepotIds,
  parsePickupCapacity,
  parseDeliveryCapacity,
  parseArray,
} from '../validator'

export const JOB_OPTIONS: DataMapOption[] = [
  {
    label: 'ID',
    value: JobMapOption.ID,
    required: true,
  },
  {
    label: 'Description',
    value: JobMapOption.Description,
    type: MapInputType.Description,
  },
  {
    label: 'Location',
    value: JobMapOption.LocationLatLng,
    required: true,
    type: MapInputType.LocationLatLng,
    extra: {
      parent: 'location',
      alternativeTo: 'location#lngLat',
    },
    validators: [latlongFunc],
  },
  {
    label: 'Location (Lng,Lat)',
    value: JobMapOption.LocationLngLat,
    required: true,
    type: MapInputType.LocationLngLat,
    extra: {
      parent: 'location',
      alternativeTo: 'location',
    },
    validators: [longlatFunc],
  },
  {
    label: 'Location Lat',
    value: JobMapOption.LocationLat,
    required: true,
    type: MapInputType.LocationLat,
    extra: {
      parent: 'location',
      alternativeTo: 'location',
    },
    validators: [latitudeFunc],
  },
  {
    label: 'Location Lng',
    value: JobMapOption.LocationLng,
    required: true,
    type: MapInputType.LocationLng,
    extra: {
      parent: 'location',
      alternativeTo: 'location',
    },
    validators: [longitudeFunc],
  },
  {
    label: 'Service Time',
    value: JobMapOption.ServiceTime,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Skills',
    value: JobMapOption.Skills,
    type: MapInputType.Skills,
    validators: [skillsFunc],
  },
  {
    label: 'Start Time',
    value: JobMapOption.StartTime,
    type: MapInputType.TimeWindowStart,
    validators: [timeFunc],
  },
  {
    label: 'End Time',
    value: JobMapOption.EndTime,
    type: MapInputType.TimeWindowEnd,
    validators: [timeFunc],
  },
  {
    label: 'Depot IDs',
    value: JobMapOption.DepotIDs,
    type: MapInputType.Depot_IDs,
    validators: [parseDepotIds],
  },
  {
    label: 'Depot ID 1',
    value: JobMapOption.DepotID1,
    type: MapInputType.Number,
  },
  {
    label: 'Priority',
    value: JobMapOption.Priority,
    type: MapInputType.Number,
    validators: [createNumberRangeValidator(0, 100, false)],
  },
  {
    label: 'Setup',
    value: JobMapOption.Setup,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Pickup Capacities',
    value: JobMapOption.PickupCapacities,
    type: MapInputType.PickupCapacity,
    validators: [parsePickupCapacity],
  },
  {
    label: 'Pickup Capacity 1',
    value: JobMapOption.PickupCapacity1,
    type: MapInputType.PickupCapacity,
    extra: {
      index: 0,
    },
    validators: [nonNegativeNumberValidator],
  },
  {
    label: 'Pickup Capacity 2',
    value: JobMapOption.PickupCapacity2,
    type: MapInputType.PickupCapacity,
    extra: {
      index: 1,
    },
    validators: [nonNegativeNumberValidator],
  },
  {
    label: 'Pickup Capacity 3',
    value: JobMapOption.PickupCapacity3,
    type: MapInputType.PickupCapacity,
    extra: {
      index: 2,
    },
    validators: [nonNegativeNumberValidator],
  },
  {
    label: 'Delivery Capacities',
    value: JobMapOption.DeliveryCapacities,
    type: MapInputType.DeliveryCapacity,
    validators: [parseDeliveryCapacity],
  },
  {
    label: 'Delivery Capacity 1',
    value: JobMapOption.DeliveryCapacity1,
    type: MapInputType.DeliveryCapacity,
    extra: {
      index: 0,
    },
    validators: [nonNegativeNumberValidator],
  },
  {
    label: 'Delivery Capacity 2',
    value: JobMapOption.DeliveryCapacity2,
    type: MapInputType.DeliveryCapacity,
    extra: {
      index: 1,
    },
    validators: [nonNegativeNumberValidator],
  },
  {
    label: 'Delivery Capacity 3',
    value: JobMapOption.DeliveryCapacity3,
    type: MapInputType.DeliveryCapacity,
    extra: {
      index: 2,
    },
    validators: [nonNegativeNumberValidator],
  },
  // New fields from OpenAPI spec
  {
    label: 'Revenue',
    value: JobMapOption.Revenue,
    type: MapInputType.Revenue,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Outsourcing Cost',
    value: JobMapOption.OutsourcingCost,
    type: MapInputType.OutsourcingCost,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Load Types',
    value: JobMapOption.LoadTypes,
    type: MapInputType.LoadTypes,
    validators: [parseArray],
  },
  {
    label: 'Incompatible Load Types',
    value: JobMapOption.IncompatibleLoadTypes,
    type: MapInputType.IncompatibleLoadTypes,
    validators: [parseArray],
  },
  {
    label: 'Sequence Order',
    value: JobMapOption.SequenceOrder,
    type: MapInputType.SequenceOrder,
    validators: [createNumberRangeValidator(0, 100, false)],
  },
  {
    label: 'Follow LIFO Order',
    value: JobMapOption.FollowLifoOrder,
    type: MapInputType.Boolean,
  },
  {
    label: 'Max Visit Lateness',
    value: JobMapOption.MaxVisitLateness,
    type: MapInputType.MaxVisitLateness,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Volume Width',
    value: JobMapOption.VolumeWidth,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Volume Depth',
    value: JobMapOption.VolumeDepth,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Volume Height',
    value: JobMapOption.VolumeHeight,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Volume Alignment',
    value: JobMapOption.VolumeAlignment,
    type: MapInputType.VolumeAlignment,
  },
  {
    label: 'Joint Order',
    value: JobMapOption.JointOrder,
    type: MapInputType.JointOrder,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Zones',
    value: JobMapOption.Zones,
    type: MapInputType.Zones,
    validators: [parseArray],
  },
  {
    label: 'Zone ID',
    value: JobMapOption.ZoneID,
    type: MapInputType.Number,
  },
  {
    label: 'Metadata Contact',
    value: JobMapOption.MetadataContact,
    type: MapInputType.Metadata,
  },
  {
    label: 'Metadata Notes',
    value: JobMapOption.MetadataNotes,
    type: MapInputType.Metadata,
  },
  {
    label: 'Metadata Meta ID',
    value: JobMapOption.MetadataMetaId,
    type: MapInputType.Metadata,
  },
]

export const JOB_OPTIONS_MAP: Record<string, DataMapOption> = {
  [JobMapOption.ID]: {
    label: 'ID',
    value: JobMapOption.ID,
    required: true,
  },
  [JobMapOption.Description]: {
    label: 'Description',
    value: JobMapOption.Description,
    type: MapInputType.Description,
  },
  [JobMapOption.LocationLatLng]: {
    label: 'Location (Lat,Lng)',
    value: JobMapOption.LocationLatLng,
    required: true,
    type: MapInputType.LocationLatLng,
    extra: {
      parent: 'location',
      alternativeTo: 'location#lngLat',
    },
    validators: [latlongFunc],
  },
  [JobMapOption.LocationLngLat]: {
    label: 'Location (Lng,Lat)',
    value: JobMapOption.LocationLngLat,
    required: true,
    type: MapInputType.LocationLngLat,
    extra: {
      parent: 'location',
      alternativeTo: 'location',
    },
    validators: [longlatFunc],
  },
  [JobMapOption.LocationLat]: {
    label: 'Location Lat',
    value: JobMapOption.LocationLat,
    required: true,
    type: MapInputType.LocationLat,
    extra: {
      parent: 'location',
      alternativeTo: 'location',
    },
    validators: [latitudeFunc],
  },
  [JobMapOption.LocationLng]: {
    label: 'Location Lng',
    value: JobMapOption.LocationLng,
    required: true,
    type: MapInputType.LocationLng,
    extra: {
      parent: 'location',
      alternativeTo: 'location',
    },
    validators: [longitudeFunc],
  },
  [JobMapOption.ServiceTime]: {
    label: 'Service Time',
    value: JobMapOption.ServiceTime,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [JobMapOption.Skills]: {
    label: 'Skills',
    value: JobMapOption.Skills,
    type: MapInputType.Skills,
    validators: [skillsFunc],
  },
  [JobMapOption.StartTime]: {
    label: 'Start Time',
    value: JobMapOption.StartTime,
    type: MapInputType.TimeWindowStart,
    validators: [timeFunc],
  },
  [JobMapOption.EndTime]: {
    label: 'End Time',
    value: JobMapOption.EndTime,
    type: MapInputType.TimeWindowEnd,
    validators: [timeFunc],
  },
  [JobMapOption.DepotIDs]: {
    label: 'Depot IDs',
    value: JobMapOption.DepotIDs,
    type: MapInputType.Depot_IDs,
    extra: {
      parent: 'depot_ids',
      divider: true,
    },
  },
  [JobMapOption.DepotID1]: {
    label: 'Depot ID 1',
    value: JobMapOption.DepotID1,
    type: MapInputType.Number,
  },
  [JobMapOption.Priority]: {
    label: 'Priority',
    value: JobMapOption.Priority,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [JobMapOption.Setup]: {
    label: 'Setup',
    value: JobMapOption.Setup,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [JobMapOption.PickupCapacities]: {
    label: 'Pickup Capacities',
    value: JobMapOption.PickupCapacities,
    type: MapInputType.PickupCapacity,
    extra: {
      parent: 'pickup',
      divider: true,
    },
  },
  [JobMapOption.PickupCapacity1]: {
    label: 'Pickup Capacity 1',
    value: JobMapOption.PickupCapacity1,
    type: MapInputType.PickupCapacity,
    extra: {
      index: 0,
      parent: 'pickup',
      alternativeTo: 'pickup',
    },
    validators: [positiveNumberValidator],
  },
  [JobMapOption.PickupCapacity2]: {
    label: 'Pickup Capacity 2',
    value: JobMapOption.PickupCapacity2,
    type: MapInputType.PickupCapacity,
    extra: {
      index: 1,
      parent: 'pickup',
      alternativeTo: 'pickup',
    },
    validators: [positiveNumberValidator],
  },
  [JobMapOption.PickupCapacity3]: {
    label: 'Pickup Capacity 3',
    value: JobMapOption.PickupCapacity3,
    type: MapInputType.PickupCapacity,
    extra: {
      index: 2,
      parent: 'pickup',
      incrementIndex: true,
      maxLength: 5,
      baseLabel: 'Pickup Capacity',
      alternativeTo: 'pickup',
    },
    validators: [positiveNumberValidator],
  },
  [JobMapOption.DeliveryCapacities]: {
    label: 'Delivery Capacities',
    value: JobMapOption.DeliveryCapacities,
    type: MapInputType.DeliveryCapacity,
    extra: {
      parent: 'delivery',
      divider: true,
    },
  },
  [JobMapOption.DeliveryCapacity1]: {
    label: 'Delivery Capacity 1',
    value: JobMapOption.DeliveryCapacity1,
    type: MapInputType.DeliveryCapacity,
    extra: {
      index: 0,
      parent: 'delivery',
      alternativeTo: 'delivery',
    },
    validators: [positiveNumberValidator],
  },
  [JobMapOption.DeliveryCapacity2]: {
    label: 'Delivery Capacity 2',
    value: JobMapOption.DeliveryCapacity2,
    type: MapInputType.DeliveryCapacity,
    extra: {
      index: 1,
      parent: 'delivery',
      alternativeTo: 'delivery',
    },
    validators: [positiveNumberValidator],
  },
  [JobMapOption.DeliveryCapacity3]: {
    label: 'Delivery Capacity 3',
    value: JobMapOption.DeliveryCapacity3,
    type: MapInputType.DeliveryCapacity,
    extra: {
      index: 2,
    },
    validators: [nonNegativeNumberValidator],
  },
  // New fields from OpenAPI spec
  [JobMapOption.Revenue]: {
    label: 'Revenue',
    value: JobMapOption.Revenue,
    type: MapInputType.Revenue,
    validators: [positiveNumberValidator],
  },
  [JobMapOption.OutsourcingCost]: {
    label: 'Outsourcing Cost',
    value: JobMapOption.OutsourcingCost,
    type: MapInputType.OutsourcingCost,
    validators: [positiveNumberValidator],
  },
  [JobMapOption.LoadTypes]: {
    label: 'Load Types',
    value: JobMapOption.LoadTypes,
    type: MapInputType.LoadTypes,
    validators: [parseArray],
  },
  [JobMapOption.IncompatibleLoadTypes]: {
    label: 'Incompatible Load Types',
    value: JobMapOption.IncompatibleLoadTypes,
    type: MapInputType.IncompatibleLoadTypes,
    validators: [parseArray],
  },
  [JobMapOption.SequenceOrder]: {
    label: 'Sequence Order',
    value: JobMapOption.SequenceOrder,
    type: MapInputType.SequenceOrder,
    validators: [createNumberRangeValidator(0, 100, false)],
  },
  [JobMapOption.FollowLifoOrder]: {
    label: 'Follow LIFO Order',
    value: JobMapOption.FollowLifoOrder,
    type: MapInputType.Boolean,
  },
  [JobMapOption.MaxVisitLateness]: {
    label: 'Max Visit Lateness',
    value: JobMapOption.MaxVisitLateness,
    type: MapInputType.MaxVisitLateness,
    validators: [positiveNumberValidator],
  },
  [JobMapOption.VolumeWidth]: {
    label: 'Volume Width',
    value: JobMapOption.VolumeWidth,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [JobMapOption.VolumeDepth]: {
    label: 'Volume Depth',
    value: JobMapOption.VolumeDepth,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [JobMapOption.VolumeHeight]: {
    label: 'Volume Height',
    value: JobMapOption.VolumeHeight,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [JobMapOption.VolumeAlignment]: {
    label: 'Volume Alignment',
    value: JobMapOption.VolumeAlignment,
    type: MapInputType.VolumeAlignment,
  },
  [JobMapOption.JointOrder]: {
    label: 'Joint Order',
    value: JobMapOption.JointOrder,
    type: MapInputType.JointOrder,
    validators: [positiveNumberValidator],
  },
  [JobMapOption.Zones]: {
    label: 'Zones',
    value: JobMapOption.Zones,
    type: MapInputType.Zones,
    validators: [parseArray],
  },
  [JobMapOption.ZoneID]: {
    label: 'Zone ID',
    value: JobMapOption.ZoneID,
    type: MapInputType.Number,
  },
  [JobMapOption.MetadataContact]: {
    label: 'Metadata Contact',
    value: JobMapOption.MetadataContact,
    type: MapInputType.Metadata,
  },
  [JobMapOption.MetadataNotes]: {
    label: 'Metadata Notes',
    value: JobMapOption.MetadataNotes,
    type: MapInputType.Metadata,
  },
  [JobMapOption.MetadataMetaId]: {
    label: 'Metadata Meta ID',
    value: JobMapOption.MetadataMetaId,
    type: MapInputType.Metadata,
  },
}

export const JOB_OPTION_MENU_LIST: MenuInfo[] = [
  {
    label: 'ID',
    value: JobMapOption.ID,
    required: true,
  },
  {
    label: 'Description',
    value: JobMapOption.Description,
  },
  {
    label: 'Location (Lat,Lng)',
    value: JobMapOption.LocationLatLng,
    required: true,
  },
  {
    label: 'Location (Lng,Lat)',
    value: JobMapOption.LocationLngLat,
    required: true,
  },
  {
    label: 'Location Lat',
    value: JobMapOption.LocationLat,
    required: true,
  },
  {
    label: 'Location Lng',
    value: JobMapOption.LocationLng,
    required: true,
  },
  {
    label: 'Service Time',
    value: JobMapOption.ServiceTime,
  },
  {
    label: 'Skills',
    value: JobMapOption.Skills,
  },
  {
    label: 'Start Time',
    value: JobMapOption.StartTime,
  },
  {
    label: 'End Time',
    value: JobMapOption.EndTime,
  },
  {
    label: 'Depot IDs',
    value: JobMapOption.DepotIDs,
  },
  {
    label: 'Depot ID 1',
    value: JobMapOption.DepotID1,
  },
  {
    label: 'Priority',
    value: JobMapOption.Priority,
  },
  {
    label: 'Setup',
    value: JobMapOption.Setup,
  },
  {
    label: 'Pickup Capacities',
    value: JobMapOption.PickupCapacities,
  },
  {
    label: 'Pickup Capacity 1',
    value: JobMapOption.PickupCapacity1,
  },
  {
    label: 'Pickup Capacity 2',
    value: JobMapOption.PickupCapacity2,
  },
  {
    label: 'Pickup Capacity 3',
    value: JobMapOption.PickupCapacity3,
  },
  {
    label: 'Delivery Capacities',
    value: JobMapOption.DeliveryCapacities,
  },
  {
    label: 'Delivery Capacity 1',
    value: JobMapOption.DeliveryCapacity1,
  },
  {
    label: 'Delivery Capacity 2',
    value: JobMapOption.DeliveryCapacity2,
  },
  {
    label: 'Delivery Capacity 3',
    value: JobMapOption.DeliveryCapacity3,
  },
  // New fields from OpenAPI spec
  {
    label: 'Revenue',
    value: JobMapOption.Revenue,
  },
  {
    label: 'Outsourcing Cost',
    value: JobMapOption.OutsourcingCost,
  },
  {
    label: 'Load Types',
    value: JobMapOption.LoadTypes,
  },
  {
    label: 'Incompatible Load Types',
    value: JobMapOption.IncompatibleLoadTypes,
  },
  {
    label: 'Sequence Order',
    value: JobMapOption.SequenceOrder,
  },
  {
    label: 'Follow LIFO Order',
    value: JobMapOption.FollowLifoOrder,
  },
  {
    label: 'Max Visit Lateness',
    value: JobMapOption.MaxVisitLateness,
  },
  {
    label: 'Volume Width',
    value: JobMapOption.VolumeWidth,
  },
  {
    label: 'Volume Depth',
    value: JobMapOption.VolumeDepth,
  },
  {
    label: 'Volume Height',
    value: JobMapOption.VolumeHeight,
  },
  {
    label: 'Volume Alignment',
    value: JobMapOption.VolumeAlignment,
  },
  {
    label: 'Joint Order',
    value: JobMapOption.JointOrder,
  },
  {
    label: 'Zones',
    value: JobMapOption.Zones,
  },
  {
    label: 'Zone ID',
    value: JobMapOption.ZoneID,
  },
  {
    label: 'Metadata Contact',
    value: JobMapOption.MetadataContact,
  },
  {
    label: 'Metadata Notes',
    value: JobMapOption.MetadataNotes,
  },
  {
    label: 'Metadata Meta ID',
    value: JobMapOption.MetadataMetaId,
  },
] 