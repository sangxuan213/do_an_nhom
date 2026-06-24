/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum VehicleType {
  XE_MAY = 'XE_MAY',
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  PICKUP = 'PICKUP'
}

export interface VehicleDetails {
  id: VehicleType;
  name: string;
  priceMultiplier: number;
  icon: string;
}

export interface WashService {
  id: string;
  name: string;
  subtitle: string;
  basePrice: number;
  description: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

export interface AddOnService {
  id: string;
  name: string;
  price: number;
  description: string;
}

export type BookingStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  licensePlate: string;
  vehicleType: VehicleType;
  serviceId: string;
  addOnIds: string[];
  date: string;
  timeSlot: string;
  notes: string;
  status: BookingStatus;
  totalCost: number;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  vehicleType: string;
}
