export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  boothCount: number;
  activeReservationsCount?: number;
}

export type VisibilityStatus = "GREEN_LIGHT" | "YELLOW_LIGHT" | "RED_LIGHT";
export type PreferenceType = "GIVE" | "RECEIVE" | "GIVE_OR_RECEIVE" | "HANGOUT";

export interface BoothReservation {
  id: string;
  userId: string;
  userHandle: string;
  venueId: string;
  venueName?: string;
  boothNumber?: number;
  startTime: string;
  endTime: string;
  status: VisibilityStatus;
  preference: PreferenceType;
  note?: string;
}

export interface UserProfile {
  id: string;
  handle: string;
  email: string;
  subscriptionActive: boolean;
  role: "MEMBER" | "PREMIUM" | "ADMIN";
}
