import type { Agency, Trip, SeatSchema } from "../types";

const API_BASE_URL = "http://localhost:3001/api";

export const getAgencies = async (): Promise<Agency[]> => {
  const response = await fetch(`${API_BASE_URL}/reference/agencies`);
  if (!response.ok) {
    throw new Error("Failed to fetch agencies");
  }
  return response.json();
};

export const getSchedules = async (
  from: string,
  to: string,
  date: string
): Promise<Trip[]> => {
  const params = new URLSearchParams({
    from,
    to,
    date,
  });
  const response = await fetch(
    `${API_BASE_URL}/schedules?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch schedules");
  }
  return response.json();
};

export const getTrip = async (id: string): Promise<Trip> => {
  const response = await fetch(`${API_BASE_URL}/schedules/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch trip");
  }
  return response.json();
};

export const getSeatSchema = async (tripId: string): Promise<SeatSchema> => {
  const response = await fetch(`${API_BASE_URL}/seatSchemas?tripId=${tripId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch seat schema");
  }
  const data = await response.json();
  if (data.length === 0) {
    throw new Error("Seat schema not found");
  }
  return data[0];
};
