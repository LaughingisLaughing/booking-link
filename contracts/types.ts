export type ISODateTime = string;
export type BookingStatus = "pending" | "confirmed" | "cancel_pending" | "canceled" | "failed";

export type AvailabilityRule = {
  days: number[];
  start: string;
  end: string;
};

export type Slot = {
  start: ISODateTime;
  end: ISODateTime;
  label: string;
  ownerLabel: string;
};

export type AvailabilityDay = {
  date: string;
  label: string;
  weekday: string;
  slots: Slot[];
};

export type AvailabilityResponse = {
  connected: boolean;
  owner: {
    name: string;
    email: string;
    timeZone: string;
  };
  event: {
    title: string;
    durationMinutes: number;
    bufferMinutes: number;
    bookingWindowDays: number;
  };
  viewerTimeZone: string;
  days: AvailabilityDay[];
  error?: string;
};

export type BookRequest = {
  start: ISODateTime;
  name: string;
  email: string;
  note?: string;
  timeZone: string;
};

export type BookResponse = {
  booking: {
    id: string;
    status: "confirmed";
    start: ISODateTime;
    end: ISODateTime;
    displayStart: string;
    displayEnd: string;
    cancelUrl: string;
    meetUrl?: string;
  };
};

export type CancelResponse = {
  booking: {
    id: string;
    status: "canceled";
  };
};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
