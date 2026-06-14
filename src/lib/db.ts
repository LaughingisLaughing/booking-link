import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { BookingStatus } from "@/contracts/types";
import { appConfig } from "@/lib/config";

type DatabaseGlobal = typeof globalThis & {
  __laughingCalDb?: DatabaseSync;
};

export type StoredOAuthToken = {
  provider: string;
  email: string;
  access_token: string | null;
  refresh_token: string | null;
  scope: string | null;
  expiry_date: number | null;
  created_at: string;
  updated_at: string;
};

export type StoredBooking = {
  id: string;
  status: BookingStatus;
  invitee_name: string;
  invitee_email: string;
  note: string | null;
  start_utc: string;
  end_utc: string;
  time_zone: string;
  calendar_event_id: string | null;
  meet_url: string | null;
  cancel_token: string;
  created_at: string;
  updated_at: string;
};

const openDatabase = () => {
  fs.mkdirSync(path.dirname(appConfig.databasePath), { recursive: true });
  const db = new DatabaseSync(appConfig.databasePath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS oauth_tokens (
      provider TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      scope TEXT,
      expiry_date INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'cancel_pending', 'canceled', 'failed')),
      invitee_name TEXT NOT NULL,
      invitee_email TEXT NOT NULL,
      note TEXT,
      start_utc TEXT NOT NULL,
      end_utc TEXT NOT NULL,
      time_zone TEXT NOT NULL,
      calendar_event_id TEXT,
      meet_url TEXT,
      cancel_token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_active_start
    ON bookings(start_utc)
    WHERE status IN ('pending', 'confirmed');

    CREATE INDEX IF NOT EXISTS idx_bookings_range
    ON bookings(start_utc, end_utc, status);
  `);
  return db;
};

export const getDb = () => {
  const globalForDb = globalThis as DatabaseGlobal;
  if (!globalForDb.__laughingCalDb) {
    globalForDb.__laughingCalDb = openDatabase();
  }
  return globalForDb.__laughingCalDb;
};

export const upsertOAuthToken = (token: Omit<StoredOAuthToken, "created_at" | "updated_at">) => {
  getDb()
    .prepare(`
      INSERT INTO oauth_tokens (provider, email, access_token, refresh_token, scope, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(provider) DO UPDATE SET
        email = excluded.email,
        access_token = COALESCE(excluded.access_token, oauth_tokens.access_token),
        refresh_token = COALESCE(excluded.refresh_token, oauth_tokens.refresh_token),
        scope = COALESCE(excluded.scope, oauth_tokens.scope),
        expiry_date = COALESCE(excluded.expiry_date, oauth_tokens.expiry_date),
        updated_at = CURRENT_TIMESTAMP
    `)
    .run(
      token.provider,
      token.email,
      token.access_token,
      token.refresh_token,
      token.scope,
      token.expiry_date,
    );
};

export const getOAuthToken = () => {
  return getDb()
    .prepare("SELECT * FROM oauth_tokens WHERE provider = ?")
    .get("google") as StoredOAuthToken | undefined;
};

export const expireStalePendingBookings = () => {
  getDb()
    .prepare(`
      UPDATE bookings
      SET status = 'failed', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'pending'
        AND datetime(created_at) < datetime('now', '-15 minutes')
    `)
    .run();
};

export const createPendingBooking = (booking: {
  id: string;
  inviteeName: string;
  inviteeEmail: string;
  note?: string;
  startUtc: string;
  endUtc: string;
  timeZone: string;
  cancelToken: string;
}) => {
  getDb()
    .prepare(`
      INSERT INTO bookings (
        id, status, invitee_name, invitee_email, note, start_utc, end_utc, time_zone, cancel_token
      )
      VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      booking.id,
      booking.inviteeName,
      booking.inviteeEmail,
      booking.note ?? null,
      booking.startUtc,
      booking.endUtc,
      booking.timeZone,
      booking.cancelToken,
    );
};

export const confirmBooking = (booking: {
  id: string;
  calendarEventId: string;
  meetUrl?: string;
}) => {
  getDb()
    .prepare(`
      UPDATE bookings
      SET status = 'confirmed',
          calendar_event_id = ?,
          meet_url = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(booking.calendarEventId, booking.meetUrl ?? null, booking.id);
};

export const failBooking = (id: string) => {
  getDb()
    .prepare(
      "UPDATE bookings SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    )
    .run(id);
};

export const cancelBooking = (id: string) => {
  getDb()
    .prepare(
      "UPDATE bookings SET status = 'canceled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    )
    .run(id);
};

export const markCancelPending = (id: string) => {
  getDb()
    .prepare(
      "UPDATE bookings SET status = 'cancel_pending', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    )
    .run(id);
};

export const getBookingByToken = (token: string) => {
  return getDb()
    .prepare("SELECT * FROM bookings WHERE cancel_token = ?")
    .get(token) as StoredBooking | undefined;
};

export const listActiveBookingsBetween = (
  startUtc: string,
  endUtc: string,
  excludeId?: string,
) => {
  expireStalePendingBookings();
  const sql = `
      SELECT *
      FROM bookings
      WHERE status IN ('pending', 'confirmed')
        AND start_utc < ?
        AND end_utc > ?
        ${excludeId ? "AND id != ?" : ""}
      ORDER BY start_utc ASC
    `;
  const params = excludeId ? [endUtc, startUtc, excludeId] : [endUtc, startUtc];
  return getDb().prepare(sql).all(...params) as StoredBooking[];
};
