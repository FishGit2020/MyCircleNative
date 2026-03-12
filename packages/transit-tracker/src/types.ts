export interface TransitArrival {
  routeId: string;
  routeShortName: string;
  tripHeadsign: string;
  scheduledArrival: string;
  predictedArrival: string | null;
  minutesUntilArrival: number;
  isRealTime: boolean;
  status: string;
  vehicleId: string | null;
}

export interface TransitStop {
  id: string;
  name: string;
  direction: string | null;
  lat: number;
  lon: number;
  routeIds: string[];
}
