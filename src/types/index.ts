export interface Agency {
  id: string;
  name: string;
}

export interface Trip {
  id: string;
  company: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
  availableSeats: number;
}

export interface SeatLayout {
  rows: number;
  cols: number;
  cells: number[];
}

export type SeatStatus = "empty" | "taken" | "selected" | "reserved";

export interface Seat {
  no: number;
  row: number;
  col: number;
  status: SeatStatus;
}

export interface SeatSchema {
  tripId: string;
  layout: SeatLayout;
  seats: Seat[];
  unitPrice: number;
}

export interface Passenger {
  seat: number;
  firstName: string;
  lastName: string;
  idNo: string;
  gender: "male" | "female";
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface TicketSaleRequest {
  tripId: string;
  seats: number[];
  contact: ContactInfo;
  passengers: Passenger[];
}

export interface TicketSaleResponse {
  ok: boolean;
  pnr: string;
  message: string;
}
