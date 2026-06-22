/**
 * Indonesian Public Holidays & Cuti Bersama
 * Source: Keputusan Presiden tentang Hari Libur Nasional & Cuti Bersama
 *
 * Format: "YYYY-MM-DD" → description
 */

type HolidayMap = Record<string, string>;

const HOLIDAYS_2025: HolidayMap = {
  // Hari Libur Nasional 2025
  "2025-01-01": "Tahun Baru Masehi",
  "2025-01-27": "Isra Mi'raj Nabi Muhammad SAW",
  "2025-01-29": "Tahun Baru Imlek",
  "2025-03-29": "Hari Suci Nyepi",
  "2025-03-31": "Hari Raya Idul Fitri 1446H",
  "2025-04-01": "Hari Raya Idul Fitri 1446H",
  "2025-04-18": "Wafat Isa Al Masih",
  "2025-05-01": "Hari Buruh Internasional",
  "2025-05-12": "Hari Raya Waisak",
  "2025-05-29": "Kenaikan Isa Al Masih",
  "2025-06-06": "Hari Raya Idul Adha 1446H",
  "2025-06-27": "Tahun Baru Islam 1447H",
  "2025-08-17": "Hari Kemerdekaan RI",
  "2025-09-05": "Maulid Nabi Muhammad SAW",
  "2025-12-25": "Hari Raya Natal",

  // Cuti Bersama 2025
  "2025-04-02": "Cuti Bersama Idul Fitri",
  "2025-04-03": "Cuti Bersama Idul Fitri",
  "2025-04-04": "Cuti Bersama Idul Fitri",
  "2025-04-07": "Cuti Bersama Idul Fitri",
  "2025-12-26": "Cuti Bersama Natal",
};

const HOLIDAYS_2026: HolidayMap = {
  // Hari Libur Nasional 2026
  "2026-01-01": "Tahun Baru Masehi",
  "2026-01-16": "Isra Mi'raj Nabi Muhammad SAW",
  "2026-02-17": "Tahun Baru Imlek",
  "2026-03-19": "Hari Suci Nyepi",
  "2026-03-20": "Hari Raya Idul Fitri 1447H",
  "2026-03-21": "Hari Raya Idul Fitri 1447H",
  "2026-04-03": "Wafat Isa Al Masih",
  "2026-05-01": "Hari Buruh Internasional",
  "2026-05-02": "Hari Raya Waisak",
  "2026-05-14": "Kenaikan Isa Al Masih",
  "2026-05-27": "Hari Raya Idul Adha 1447H",
  "2026-06-17": "Tahun Baru Islam 1448H",
  "2026-08-17": "Hari Kemerdekaan RI",
  "2026-08-26": "Maulid Nabi Muhammad SAW",
  "2026-12-25": "Hari Raya Natal",

  // Cuti Bersama 2026
  "2026-03-22": "Cuti Bersama Idul Fitri",
  "2026-03-23": "Cuti Bersama Idul Fitri",
  "2026-03-24": "Cuti Bersama Idul Fitri",
  "2026-03-25": "Cuti Bersama Idul Fitri",
  "2026-05-15": "Cuti Bersama Kenaikan Isa Al Masih",
  "2026-12-24": "Cuti Bersama Natal",
  "2026-12-26": "Cuti Bersama Natal",
};

const HOLIDAYS_2027: HolidayMap = {
  // Hari Libur Nasional 2027 (projected)
  "2027-01-01": "Tahun Baru Masehi",
  "2027-01-05": "Isra Mi'raj Nabi Muhammad SAW",
  "2027-02-06": "Tahun Baru Imlek",
  "2027-03-09": "Hari Suci Nyepi",
  "2027-03-10": "Hari Raya Idul Fitri 1448H",
  "2027-03-11": "Hari Raya Idul Fitri 1448H",
  "2027-03-26": "Wafat Isa Al Masih",
  "2027-05-01": "Hari Buruh Internasional",
  "2027-05-06": "Kenaikan Isa Al Masih",
  "2027-05-16": "Hari Raya Idul Adha 1448H",
  "2027-05-22": "Hari Raya Waisak",
  "2027-06-06": "Tahun Baru Islam 1449H",
  "2027-08-15": "Maulid Nabi Muhammad SAW",
  "2027-08-17": "Hari Kemerdekaan RI",
  "2027-12-25": "Hari Raya Natal",
};

/** All holidays across years */
const ALL_HOLIDAYS: HolidayMap = {
  ...HOLIDAYS_2025,
  ...HOLIDAYS_2026,
  ...HOLIDAYS_2027,
};

/**
 * Format a Date to "YYYY-MM-DD" string (local timezone).
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Check if a given date is a public holiday or cuti bersama.
 */
export function isHoliday(date: Date): boolean {
  return formatDateKey(date) in ALL_HOLIDAYS;
}

/**
 * Get the holiday name for a given date (or undefined if not a holiday).
 */
export function getHolidayName(date: Date): string | undefined {
  return ALL_HOLIDAYS[formatDateKey(date)];
}

/**
 * Check if a given date is a weekend (Saturday or Sunday).
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if a given date is a business day (not weekend, not holiday).
 */
export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

/**
 * Count the number of business days between two dates (inclusive).
 * Excludes weekends and Indonesian public holidays.
 */
export function countBusinessDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    if (isBusinessDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count || 1; // At least 1 day
}

/**
 * Get all holiday dates for a specific year as Date objects.
 * Useful for the date picker disabled dates.
 */
export function getHolidayDatesForYear(year: number): Date[] {
  const yearStr = String(year);
  return Object.keys(ALL_HOLIDAYS)
    .filter((key) => key.startsWith(yearStr))
    .map((key) => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(y, m - 1, d);
    });
}

/**
 * Get all holidays as a flat list for display purposes.
 */
export function getAllHolidays(): { date: string; name: string }[] {
  return Object.entries(ALL_HOLIDAYS).map(([date, name]) => ({ date, name }));
}
