import {MapInputType, ShipmentMapOption} from '../interface'
import {DataMapOption, MenuInfo} from './interface'
import {
  positiveNumberValidator,
  arrayValidator,
  skillsFunc,
  longlatFunc,
  latlongFunc,
  latitudeFunc,
  longitudeFunc,
  timeFunc,
  createNumberRangeValidator,
  nonNegativeNumberValidator,
  parseArray,
} from '../validator'

export const SHIPMENT_OPTIONS: DataMapOption[] = [
  {
    label: 'Description',
    value: ShipmentMapOption.Description,
    type: MapInputType.Description,
  },
  {
    label: 'Skills',
    value: ShipmentMapOption.Skills,
    type: MapInputType.Skills,
    validators: [skillsFunc],
  },
  {
    label: 'Priority',
    value: ShipmentMapOption.Priority,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Pickup ID',
    value: ShipmentMapOption.PickupID,
    required: true,
  },
  {
    label: 'Pickup Service',
    value: ShipmentMapOption.PickupService,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Pickup Location (Lat,Lng)',
    value: ShipmentMapOption.PickupLocationLatLng,
    type: MapInputType.LocationLatLng,
    required: true,
    validators: [latlongFunc],
    extra: {
      parent: 'pickup.location',
      alternativeTo: 'pickup.location#lngLat',
    },
  },
  {
    label: 'Pickup Location Lat',
    value: ShipmentMapOption.PickupLocationLat,
    type: MapInputType.LocationLat,
    required: true,
    validators: [latitudeFunc],
    extra: {
      parent: 'pickup.location',
    },
  },
  {
    label: 'Pickup Location Lng',
    value: ShipmentMapOption.PickupLocationLng,
    type: MapInputType.LocationLng,
    required: true,
    validators: [longitudeFunc],
    extra: {
      parent: 'pickup.location',
    },
  },
  {
    label: 'Pickup Start Time',
    value: ShipmentMapOption.PickupStartTime,
    type: MapInputType.TimeWindowStart,
    validators: [timeFunc],
  },
  {
    label: 'Pickup Setup',
    value: ShipmentMapOption.PickupSetup,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Pickup End Time',
    value: ShipmentMapOption.PickupEndTime,
    type: MapInputType.TimeWindowEnd,
    validators: [timeFunc],
  },
  {
    label: 'Delivery ID',
    value: ShipmentMapOption.DeliveryID,
    required: true,
  },
  {
    label: 'Delivery Service',
    value: ShipmentMapOption.DeliveryService,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Delivery Location (Lat,Lng)',
    value: ShipmentMapOption.DeliveryLocationLatLng,
    type: MapInputType.LocationLatLng,
    required: true,
    validators: [latlongFunc],
    extra: {
      parent: 'delivery.location',
      alternativeTo: 'delivery.location#lngLat',
    },
  },
  {
    label: 'Delivery Location Lat',
    value: ShipmentMapOption.DeliveryLocationLat,
    type: MapInputType.LocationLat,
    required: true,
    validators: [latitudeFunc],
    extra: {
      parent: 'delivery.location',
    },
  },
  {
    label: 'Delivery Location Lng',
    value: ShipmentMapOption.DeliveryLocationLng,
    type: MapInputType.LocationLng,
    required: true,
    validators: [longitudeFunc],
    extra: {
      parent: 'delivery.location',
    },
  },
  {
    label: 'Delivery Start Time',
    value: ShipmentMapOption.DeliveryStartTime,
    type: MapInputType.TimeWindowStart,
    validators: [timeFunc],
  },
  {
    label: 'Delivery End Time',
    value: ShipmentMapOption.DeliveryEndTime,
    type: MapInputType.TimeWindowEnd,
    validators: [timeFunc],
  },
  {
    label: 'Delivery Setup',
    value: ShipmentMapOption.DeliverySetup,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Amount Capacities',
    value: ShipmentMapOption.AmountCapacities,
    type: MapInputType.Amount,
    extra: {
      parent: 'amount',
      divider: true,
    },
    validators: [arrayValidator(positiveNumberValidator)],
  },
  {
    label: 'Amount Capacity 1',
    value: ShipmentMapOption.AmountCapacity1,
    type: MapInputType.Amount,
    extra: {
      index: 0,
      parent: 'amount',
      alternativeTo: 'amount',
    },
    validators: [positiveNumberValidator],
  },
  // New pickup fields from OpenAPI spec
  {
    label: 'Pickup Max Visit Lateness',
    value: ShipmentMapOption.PickupMaxVisitLateness,
    type: MapInputType.MaxVisitLateness,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Pickup Sequence Order',
    value: ShipmentMapOption.PickupSequenceOrder,
    type: MapInputType.SequenceOrder,
    validators: [createNumberRangeValidator(0, 100, false)],
  },
  {
    label: 'Pickup Metadata Contact',
    value: ShipmentMapOption.PickupMetadataContact,
    type: MapInputType.Metadata,
  },
  {
    label: 'Pickup Metadata Notes',
    value: ShipmentMapOption.PickupMetadataNotes,
    type: MapInputType.Metadata,
  },
  {
    label: 'Pickup Metadata Meta ID',
    value: ShipmentMapOption.PickupMetadataMetaId,
    type: MapInputType.Metadata,
  },
  // New delivery fields from OpenAPI spec
  {
    label: 'Delivery Max Visit Lateness',
    value: ShipmentMapOption.DeliveryMaxVisitLateness,
    type: MapInputType.MaxVisitLateness,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Delivery Sequence Order',
    value: ShipmentMapOption.DeliverySequenceOrder,
    type: MapInputType.SequenceOrder,
    validators: [createNumberRangeValidator(0, 100, false)],
  },
  {
    label: 'Delivery Metadata Contact',
    value: ShipmentMapOption.DeliveryMetadataContact,
    type: MapInputType.Metadata,
  },
  {
    label: 'Delivery Metadata Notes',
    value: ShipmentMapOption.DeliveryMetadataNotes,
    type: MapInputType.Metadata,
  },
  {
    label: 'Delivery Metadata Meta ID',
    value: ShipmentMapOption.DeliveryMetadataMetaId,
    type: MapInputType.Metadata,
  },
  // New shipment-level fields from OpenAPI spec
  {
    label: 'Amount Capacity 2',
    value: ShipmentMapOption.AmountCapacity2,
    type: MapInputType.Amount,
    extra: {
      index: 1,
      parent: 'amount',
      alternativeTo: 'amount',
    },
    validators: [nonNegativeNumberValidator],
  },
  {
    label: 'Amount Capacity 3',
    value: ShipmentMapOption.AmountCapacity3,
    type: MapInputType.Amount,
    extra: {
      index: 2,
      parent: 'amount',
      alternativeTo: 'amount',
    },
    validators: [nonNegativeNumberValidator],
  },
  {
    label: 'Revenue',
    value: ShipmentMapOption.Revenue,
    type: MapInputType.Revenue,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Outsourcing Cost',
    value: ShipmentMapOption.OutsourcingCost,
    type: MapInputType.OutsourcingCost,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Load Types',
    value: ShipmentMapOption.LoadTypes,
    type: MapInputType.LoadTypes,
    validators: [parseArray],
  },
  {
    label: 'Incompatible Load Types',
    value: ShipmentMapOption.IncompatibleLoadTypes,
    type: MapInputType.IncompatibleLoadTypes,
    validators: [parseArray],
  },
  {
    label: 'Max Time In Vehicle',
    value: ShipmentMapOption.MaxTimeInVehicle,
    type: MapInputType.MaxTimeInVehicle,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Follow LIFO Order',
    value: ShipmentMapOption.FollowLifoOrder,
    type: MapInputType.Boolean,
  },
  {
    label: 'Volume Width',
    value: ShipmentMapOption.VolumeWidth,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Volume Depth',
    value: ShipmentMapOption.VolumeDepth,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Volume Height',
    value: ShipmentMapOption.VolumeHeight,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Volume Alignment',
    value: ShipmentMapOption.VolumeAlignment,
    type: MapInputType.VolumeAlignment,
  },
  {
    label: 'Joint Order',
    value: ShipmentMapOption.JointOrder,
    type: MapInputType.JointOrder,
    validators: [positiveNumberValidator],
  },
  {
    label: 'Zones',
    value: ShipmentMapOption.Zones,
    type: MapInputType.Zones,
    validators: [parseArray],
  },
  {
    label: 'Zone ID',
    value: ShipmentMapOption.ZoneID,
    type: MapInputType.Number,
  },
]

export const SHIPMENT_OPTIONS_MAP: Record<string, DataMapOption> = {
  [ShipmentMapOption.Description]: {
    label: 'Description',
    value: ShipmentMapOption.Description,
    type: MapInputType.Description,
  },
  [ShipmentMapOption.Skills]: {
    label: 'Skills',
    value: ShipmentMapOption.Skills,
    type: MapInputType.Skills,
    validators: [skillsFunc],
  },
  [ShipmentMapOption.Priority]: {
    label: 'Priority',
    value: ShipmentMapOption.Priority,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.Setup]: {
    label: 'Setup',
    value: ShipmentMapOption.Setup,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.PickupID]: {
    label: 'Pickup ID',
    value: ShipmentMapOption.PickupID,
    required: true,
  },
  [ShipmentMapOption.PickupService]: {
    label: 'Pickup Service',
    value: ShipmentMapOption.PickupService,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.PickupPriority]: {
    label: 'Pickup Priority',
    value: ShipmentMapOption.PickupPriority,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.PickupLocationLatLng]: {
    label: 'Pickup Location (Lat,Lng)',
    value: ShipmentMapOption.PickupLocationLatLng,
    type: MapInputType.LocationLatLng,
    required: true,
    validators: [latlongFunc],
    extra: {
      parent: 'pickup.location',
      alternativeTo: 'pickup.location#lngLat',
    },
  },
  [ShipmentMapOption.PickupLocationLat]: {
    label: 'Pickup Location Lat',
    value: ShipmentMapOption.PickupLocationLat,
    type: MapInputType.LocationLat,
    required: true,
    validators: [latitudeFunc],
    extra: {
      parent: 'pickup.location',
    },
  },
  [ShipmentMapOption.PickupLocationLng]: {
    label: 'Pickup Location Lng',
    value: ShipmentMapOption.PickupLocationLng,
    type: MapInputType.LocationLng,
    required: true,
    validators: [longitudeFunc],
    extra: {
      parent: 'pickup.location',
    },
  },
  [ShipmentMapOption.PickupStartTime]: {
    label: 'Pickup Start Time',
    value: ShipmentMapOption.PickupStartTime,
    type: MapInputType.TimeWindowStart,
    validators: [timeFunc],
  },
  [ShipmentMapOption.PickupSetup]: {
    label: 'Pickup Setup',
    value: ShipmentMapOption.PickupSetup,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.PickupEndTime]: {
    label: 'Pickup End Time',
    value: ShipmentMapOption.PickupEndTime,
    type: MapInputType.TimeWindowEnd,
    validators: [timeFunc],
  },
  [ShipmentMapOption.DeliveryID]: {
    label: 'Delivery ID',
    value: ShipmentMapOption.DeliveryID,
    required: true,
  },
  [ShipmentMapOption.DeliveryService]: {
    label: 'Delivery Service',
    value: ShipmentMapOption.DeliveryService,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.DeliveryPriority]: {
    label: 'Delivery Priority',
    value: ShipmentMapOption.DeliveryPriority,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.DeliveryLocationLatLng]: {
    label: 'Delivery Location (Lat,Lng)',
    value: ShipmentMapOption.DeliveryLocationLatLng,
    type: MapInputType.LocationLatLng,
    required: true,
    validators: [latlongFunc],
    extra: {
      parent: 'delivery.location',
      alternativeTo: 'delivery.location#lngLat',
    },
  },
  [ShipmentMapOption.DeliveryLocationLat]: {
    label: 'Delivery Location Lat',
    value: ShipmentMapOption.DeliveryLocationLat,
    type: MapInputType.LocationLat,
    required: true,
    validators: [latitudeFunc],
    extra: {
      parent: 'delivery.location',
    },
  },
  [ShipmentMapOption.DeliveryLocationLng]: {
    label: 'Delivery Location Lng',
    value: ShipmentMapOption.DeliveryLocationLng,
    type: MapInputType.LocationLng,
    required: true,
    validators: [longitudeFunc],
    extra: {
      parent: 'delivery.location',
    },
  },
  [ShipmentMapOption.DeliveryStartTime]: {
    label: 'Delivery Start Time',
    value: ShipmentMapOption.DeliveryStartTime,
    type: MapInputType.TimeWindowStart,
    validators: [timeFunc],
  },
  [ShipmentMapOption.DeliveryEndTime]: {
    label: 'Delivery End Time',
    value: ShipmentMapOption.DeliveryEndTime,
    type: MapInputType.TimeWindowEnd,
    validators: [timeFunc],
  },
  [ShipmentMapOption.DeliverySetup]: {
    label: 'Delivery Setup',
    value: ShipmentMapOption.DeliverySetup,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.AmountCapacities]: {
    label: 'Amount Capacities',
    value: ShipmentMapOption.AmountCapacities,
    type: MapInputType.Amount,
    extra: {
      parent: 'amount',
      divider: true,
    },
    validators: [arrayValidator(positiveNumberValidator)],
  },
  [ShipmentMapOption.AmountCapacity1]: {
    label: 'Amount Capacity 1',
    value: ShipmentMapOption.AmountCapacity1,
    type: MapInputType.Amount,
    extra: {
      index: 0,
      parent: 'amount',
      alternativeTo: 'amount',
    },
    validators: [positiveNumberValidator],
  },
  // New pickup fields from OpenAPI spec
  [ShipmentMapOption.PickupMaxVisitLateness]: {
    label: 'Pickup Max Visit Lateness',
    value: ShipmentMapOption.PickupMaxVisitLateness,
    type: MapInputType.MaxVisitLateness,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.PickupSequenceOrder]: {
    label: 'Pickup Sequence Order',
    value: ShipmentMapOption.PickupSequenceOrder,
    type: MapInputType.SequenceOrder,
    validators: [createNumberRangeValidator(0, 100, false)],
  },
  [ShipmentMapOption.PickupMetadataContact]: {
    label: 'Pickup Metadata Contact',
    value: ShipmentMapOption.PickupMetadataContact,
    type: MapInputType.Metadata,
  },
  [ShipmentMapOption.PickupMetadataNotes]: {
    label: 'Pickup Metadata Notes',
    value: ShipmentMapOption.PickupMetadataNotes,
    type: MapInputType.Metadata,
  },
  [ShipmentMapOption.PickupMetadataMetaId]: {
    label: 'Pickup Metadata Meta ID',
    value: ShipmentMapOption.PickupMetadataMetaId,
    type: MapInputType.Metadata,
  },
  // New delivery fields from OpenAPI spec
  [ShipmentMapOption.DeliveryMaxVisitLateness]: {
    label: 'Delivery Max Visit Lateness',
    value: ShipmentMapOption.DeliveryMaxVisitLateness,
    type: MapInputType.MaxVisitLateness,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.DeliverySequenceOrder]: {
    label: 'Delivery Sequence Order',
    value: ShipmentMapOption.DeliverySequenceOrder,
    type: MapInputType.SequenceOrder,
    validators: [createNumberRangeValidator(0, 100, false)],
  },
  [ShipmentMapOption.DeliveryMetadataContact]: {
    label: 'Delivery Metadata Contact',
    value: ShipmentMapOption.DeliveryMetadataContact,
    type: MapInputType.Metadata,
  },
  [ShipmentMapOption.DeliveryMetadataNotes]: {
    label: 'Delivery Metadata Notes',
    value: ShipmentMapOption.DeliveryMetadataNotes,
    type: MapInputType.Metadata,
  },
  [ShipmentMapOption.DeliveryMetadataMetaId]: {
    label: 'Delivery Metadata Meta ID',
    value: ShipmentMapOption.DeliveryMetadataMetaId,
    type: MapInputType.Metadata,
  },
  // New shipment-level fields from OpenAPI spec
  [ShipmentMapOption.AmountCapacity2]: {
    label: 'Amount Capacity 2',
    value: ShipmentMapOption.AmountCapacity2,
    type: MapInputType.Amount,
    extra: {
      index: 1,
      parent: 'amount',
      alternativeTo: 'amount',
    },
    validators: [nonNegativeNumberValidator],
  },
  [ShipmentMapOption.AmountCapacity3]: {
    label: 'Amount Capacity 3',
    value: ShipmentMapOption.AmountCapacity3,
    type: MapInputType.Amount,
    extra: {
      index: 2,
      parent: 'amount',
      alternativeTo: 'amount',
    },
    validators: [nonNegativeNumberValidator],
  },
  [ShipmentMapOption.Revenue]: {
    label: 'Revenue',
    value: ShipmentMapOption.Revenue,
    type: MapInputType.Revenue,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.OutsourcingCost]: {
    label: 'Outsourcing Cost',
    value: ShipmentMapOption.OutsourcingCost,
    type: MapInputType.OutsourcingCost,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.LoadTypes]: {
    label: 'Load Types',
    value: ShipmentMapOption.LoadTypes,
    type: MapInputType.LoadTypes,
    validators: [parseArray],
  },
  [ShipmentMapOption.IncompatibleLoadTypes]: {
    label: 'Incompatible Load Types',
    value: ShipmentMapOption.IncompatibleLoadTypes,
    type: MapInputType.IncompatibleLoadTypes,
    validators: [parseArray],
  },
  [ShipmentMapOption.MaxTimeInVehicle]: {
    label: 'Max Time In Vehicle',
    value: ShipmentMapOption.MaxTimeInVehicle,
    type: MapInputType.MaxTimeInVehicle,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.FollowLifoOrder]: {
    label: 'Follow LIFO Order',
    value: ShipmentMapOption.FollowLifoOrder,
    type: MapInputType.Boolean,
  },
  [ShipmentMapOption.VolumeWidth]: {
    label: 'Volume Width',
    value: ShipmentMapOption.VolumeWidth,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.VolumeDepth]: {
    label: 'Volume Depth',
    value: ShipmentMapOption.VolumeDepth,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.VolumeHeight]: {
    label: 'Volume Height',
    value: ShipmentMapOption.VolumeHeight,
    type: MapInputType.Number,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.VolumeAlignment]: {
    label: 'Volume Alignment',
    value: ShipmentMapOption.VolumeAlignment,
    type: MapInputType.VolumeAlignment,
  },
  [ShipmentMapOption.JointOrder]: {
    label: 'Joint Order',
    value: ShipmentMapOption.JointOrder,
    type: MapInputType.JointOrder,
    validators: [positiveNumberValidator],
  },
  [ShipmentMapOption.Zones]: {
    label: 'Zones',
    value: ShipmentMapOption.Zones,
    type: MapInputType.Zones,
    validators: [parseArray],
  },
  [ShipmentMapOption.ZoneID]: {
    label: 'Zone ID',
    value: ShipmentMapOption.ZoneID,
    type: MapInputType.Number,
  },
}

export const SHIPMENT_OPTION_MENU_LIST: MenuInfo[] = [
  {
    label: 'Description',
    value: ShipmentMapOption.Description,
  },
  {
    label: 'Skills',
    value: ShipmentMapOption.Skills,
  },
  {
    label: 'Priority',
    value: ShipmentMapOption.Priority,
  },
  {
    label: 'Setup',
    value: ShipmentMapOption.Setup,
  },
  {
    label: 'Pickup ID',
    value: ShipmentMapOption.PickupID,
    required: true,
  },
  {
    label: 'Pickup Service',
    value: ShipmentMapOption.PickupService,
  },
  {
    label: 'Pickup Priority',
    value: ShipmentMapOption.PickupPriority,
  },
  {
    label: 'Pickup Location (Lat,Lng)',
    value: ShipmentMapOption.PickupLocationLatLng,
    required: true,
  },
  {
    label: 'Pickup Location Lat',
    value: ShipmentMapOption.PickupLocationLat,
    required: true,
  },
  {
    label: 'Pickup Location Lng',
    value: ShipmentMapOption.PickupLocationLng,
    required: true,
  },
  {
    label: 'Pickup Start Time',
    value: ShipmentMapOption.PickupStartTime,
  },
  {
    label: 'Pickup Setup',
    value: ShipmentMapOption.PickupSetup,
  },
  {
    label: 'Pickup End Time',
    value: ShipmentMapOption.PickupEndTime,
  },
  {
    label: 'Delivery ID',
    value: ShipmentMapOption.DeliveryID,
    required: true,
  },
  {
    label: 'Delivery Service',
    value: ShipmentMapOption.DeliveryService,
  },
  {
    label: 'Delivery Priority',
    value: ShipmentMapOption.DeliveryPriority,
  },
  {
    label: 'Delivery Location (Lat,Lng)',
    value: ShipmentMapOption.DeliveryLocationLatLng,
    required: true,
  },
  {
    label: 'Delivery Location Lat',
    value: ShipmentMapOption.DeliveryLocationLat,
    required: true,
  },
  {
    label: 'Delivery Location Lng',
    value: ShipmentMapOption.DeliveryLocationLng,
    required: true,
  },
  {
    label: 'Delivery Start Time',
    value: ShipmentMapOption.DeliveryStartTime,
  },
  {
    label: 'Delivery End Time',
    value: ShipmentMapOption.DeliveryEndTime,
  },
  {
    label: 'Delivery Setup',
    value: ShipmentMapOption.DeliverySetup,
  },
  {
    label: 'Amount Capacities',
    value: ShipmentMapOption.AmountCapacities,
  },
  {
    label: 'Amount Capacity 1',
    value: ShipmentMapOption.AmountCapacity1,
  },
  // New pickup fields from OpenAPI spec
  {
    label: 'Pickup Max Visit Lateness',
    value: ShipmentMapOption.PickupMaxVisitLateness,
  },
  {
    label: 'Pickup Sequence Order',
    value: ShipmentMapOption.PickupSequenceOrder,
  },
  {
    label: 'Pickup Metadata Contact',
    value: ShipmentMapOption.PickupMetadataContact,
  },
  {
    label: 'Pickup Metadata Notes',
    value: ShipmentMapOption.PickupMetadataNotes,
  },
  {
    label: 'Pickup Metadata Meta ID',
    value: ShipmentMapOption.PickupMetadataMetaId,
  },
  // New delivery fields from OpenAPI spec
  {
    label: 'Delivery Max Visit Lateness',
    value: ShipmentMapOption.DeliveryMaxVisitLateness,
  },
  {
    label: 'Delivery Sequence Order',
    value: ShipmentMapOption.DeliverySequenceOrder,
  },
  {
    label: 'Delivery Metadata Contact',
    value: ShipmentMapOption.DeliveryMetadataContact,
  },
  {
    label: 'Delivery Metadata Notes',
    value: ShipmentMapOption.DeliveryMetadataNotes,
  },
  {
    label: 'Delivery Metadata Meta ID',
    value: ShipmentMapOption.DeliveryMetadataMetaId,
  },
  // New shipment-level fields from OpenAPI spec
  {
    label: 'Amount Capacity 2',
    value: ShipmentMapOption.AmountCapacity2,
  },
  {
    label: 'Amount Capacity 3',
    value: ShipmentMapOption.AmountCapacity3,
  },
  {
    label: 'Revenue',
    value: ShipmentMapOption.Revenue,
  },
  {
    label: 'Outsourcing Cost',
    value: ShipmentMapOption.OutsourcingCost,
  },
  {
    label: 'Load Types',
    value: ShipmentMapOption.LoadTypes,
  },
  {
    label: 'Incompatible Load Types',
    value: ShipmentMapOption.IncompatibleLoadTypes,
  },
  {
    label: 'Max Time In Vehicle',
    value: ShipmentMapOption.MaxTimeInVehicle,
  },
  {
    label: 'Follow LIFO Order',
    value: ShipmentMapOption.FollowLifoOrder,
  },
  {
    label: 'Volume Width',
    value: ShipmentMapOption.VolumeWidth,
  },
  {
    label: 'Volume Depth',
    value: ShipmentMapOption.VolumeDepth,
  },
  {
    label: 'Volume Height',
    value: ShipmentMapOption.VolumeHeight,
  },
  {
    label: 'Volume Alignment',
    value: ShipmentMapOption.VolumeAlignment,
  },
  {
    label: 'Joint Order',
    value: ShipmentMapOption.JointOrder,
  },
  {
    label: 'Zones',
    value: ShipmentMapOption.Zones,
  },
  {
    label: 'Zone ID',
    value: ShipmentMapOption.ZoneID,
  },
] 