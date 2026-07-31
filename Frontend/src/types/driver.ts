import type { GeoPoint, RouteResult } from './routing'

export type VehicleType = 'Bicycle' | 'Motorcycle' | 'Car'
export type DriverApprovalStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Suspended'
export type DriverAvailabilityStatus =
  | 'Offline'
  | 'Available'
  | 'OnDelivery'
export type DeliveryAssignmentStatus =
  | 'Assigned'
  | 'Accepted'
  | 'HeadingToStore'
  | 'PickedUp'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Rejected'
  | 'Cancelled'

export type DriverProfile = {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  vehicleType: VehicleType
  approvalStatus: DriverApprovalStatus
  availabilityStatus: DriverAvailabilityStatus
  vehicleBrand: string | null
  vehicleModel: string | null
  vehicleColor: string | null
  vehiclePlate: string | null
  driverLicenseNumber: string | null
  profilePhotoUrl: string | null
  identificationDocumentUrl: string | null
  driverLicenseDocumentUrl: string | null
  ratingAverage: number
  ratingCount: number
  currentLatitude: number | null
  currentLongitude: number | null
  locationUpdatedAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type SaveDriverProfileInput = {
  vehicleType: VehicleType
  vehicleBrand: string | null
  vehicleModel: string | null
  vehicleColor: string | null
  vehiclePlate: string | null
  driverLicenseNumber: string | null
  profilePhotoUrl: string | null
  identificationDocumentUrl: string | null
  driverLicenseDocumentUrl: string | null
}

export type DriverSummary = {
  completedDeliveries: number
  completedToday: number
  earningsToday: number
  earningsThisWeek: number
  ratingAverage: number
  ratingCount: number
}

export type DeliveryStop = {
  name: string
  phoneNumber: string | null
  address: string
  latitude: number
  longitude: number
}

export type AvailableDelivery = {
  orderId: string
  orderNumber: string
  pickup: DeliveryStop
  dropoff: DeliveryStop
  itemCount: number
  driverEarnings: number
  distanceToPickupMeters: number
  totalDistanceMeters: number
  estimatedMinutes: number
  efficiencyScore: number
  isRecommended: boolean
}

export type ActiveDelivery = {
  assignmentId: string
  orderId: string
  orderNumber: string
  status: DeliveryAssignmentStatus
  pickup: DeliveryStop
  dropoff: DeliveryStop
  itemCount: number
  driverEarnings: number
  assignedAt: string
  acceptedAt: string | null
  route: RouteResult
}

export type DeliveryHistory = {
  assignmentId: string
  orderId: string
  orderNumber: string
  storeName: string
  customerName: string
  distanceMeters: number
  driverEarnings: number
  customerRating: number | null
  deliveredAt: string
}

export type OrderTracking = {
  orderId: string
  orderNumber: string
  orderStatus: string
  deliveryStatus: DeliveryAssignmentStatus | null
  pickup: DeliveryStop
  dropoff: DeliveryStop
  driverName: string | null
  driverPhoneNumber: string | null
  driverLatitude: number | null
  driverLongitude: number | null
  driverLocationUpdatedAt: string | null
  route: RouteResult
}

export function stopPoint(stop: DeliveryStop): GeoPoint {
  return {
    latitude: stop.latitude,
    longitude: stop.longitude,
  }
}
