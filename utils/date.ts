import { CalendarDate, Time } from "@internationalized/date";
import { DateValue, TimeInputValue } from "@heroui/react";
import { City, Country, Region } from "@prisma/client";

import { DateTime } from "luxon"

import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"

export const formatTimeOnly = (
  startHour: string,
  endHour: string,
  timeZone: string | null
) => {
  if (timeZone) {
    const [sh, sm] = startHour.split(":").map(Number)
    const [eh, em] = endHour.split(":").map(Number)
    const now = new Date()

    const startDateUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), sh, sm))
    const endDateUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), eh, em))

    const localStart = toZonedTime(startDateUTC, Intl.DateTimeFormat().resolvedOptions().timeZone)
    const localEnd = toZonedTime(endDateUTC, Intl.DateTimeFormat().resolvedOptions().timeZone)

    return `${format(localStart, "HH:mm")} - ${format(localEnd, "HH:mm")}`
  } else {
    // brak strefy czasowej — wyświetlamy „na sztywno”
    return `${startHour} - ${endHour}`
  }
}




export function combineDateAndTime(
  date: DateValue | Date,
  time?: TimeInputValue | Date | null,
  timezone?: string // opcjonalny
): Date {
  let year: number, month: number, day: number

  if (date instanceof Date) {
    year = date.getFullYear()
    month = date.getMonth() + 1 // luxon używa 1–12
    day = date.getDate()
  } else {
    year = date.year
    month = date.month
    day = date.day
  }

  let hours = 0
  let minutes = 0

  if (time) {
    if (time instanceof Date) {
      hours = time.getHours()
      minutes = time.getMinutes()
    } else {
      hours = time.hour
      minutes = time.minute
    }
  }

  // Jeśli timezone nie podany -> bierzemy z przeglądarki
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

  // Tworzymy DateTime w wybranej strefie
  const dt = DateTime.fromObject(
    { year, month, day, hour: hours, minute: minutes },
    { zone: tz }
  )

  // Zwracamy jako natywny Date (UTC w środku, ale zachowuje poprawną godzinę)
  return dt.toJSDate()
}


// export function combineDateAndTime(date: DateValue | Date, time: TimeInputValue | Date): Date {
//   let year: number, month: number, day: number

//   if (date instanceof Date) {
//     year = date.getFullYear()
//     month = date.getMonth()
//     day = date.getDate()    
//   } else {
//     year = date.year,
//     month = date.month -1,
//     day = date.day
//   }

//   let hours: number, minutes: number

//   if (time instanceof Date) {
//     hours = time.getHours()
//     minutes = time.getMinutes()
//   } else {
//     hours = time.hour,
//     minutes = time.minute
//   }

//   return new Date (year, month, day, hours, minutes, 0, 0)
// }

export function convertDateValueToDate(date: DateValue): Date {
  return new Date(
    date.year,
    date.month- 1,
    date.day
  )
}

export function convertDateToNative(date: Date): DateValue {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1, // JS Date ma miesiące 0-based
    date.getDate(),
  );
}

export function convertDateToTimeInputValue(date: Date): TimeInputValue {
  return new Time(
    date.getHours(),
    date.getMinutes(),
    date.getSeconds() ?? 0,
    date.getMilliseconds() ?? 0
  )
}


interface FormatMeetingDateOptions {
  locale?: string;
  onlyDays?: boolean;  // tylko data (np. 08.08.2025 - 09.08.2025)
  withDay?: boolean;   // dzień tygodnia + daty + godziny
}

// export function formatedDate(
//   start: Date,
//   end: Date,
//   { locale, onlyDays = false, withDay = false }: FormatMeetingDateOptions = {}
// ): string {
//   const startDate = new Date(start);
//   const endDate = new Date(end);

//   const sameDay = isSameDay(startDate, endDate);

//   const dateFormatter = new Intl.DateTimeFormat(locale, {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });

//   const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: "long" });

//   const timeFormatter = new Intl.DateTimeFormat(locale, {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//   });

// // --- ONLY DAYS ---
// if (onlyDays) {
//   return sameDay
//     ? dateFormatter.format(startDate)
//     : `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
// }

// // --- WITH DAY ---
// if (withDay) {
//   return sameDay
//     ? `${dayFormatter.format(startDate)}, ${dateFormatter.format(startDate)}, ${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`
//     : `${dayFormatter.format(startDate)}, ${dateFormatter.format(startDate)}, ${timeFormatter.format(startDate)} - ${dayFormatter.format(endDate)}, ${dateFormatter.format(endDate)}, ${timeFormatter.format(endDate)}`;
// }

// // --- DEFAULT ---
// return sameDay
//   ? `${dateFormatter.format(startDate)}, ${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`
//   : `${dateFormatter.format(startDate)}, ${timeFormatter.format(startDate)} - ${dateFormatter.format(endDate)}, ${timeFormatter.format(endDate)}`;
// }


export function formatedDate(
  start: Date,
  end?: Date,
  timeZone?: string,
  format: "default" | "onlyDays" | "withDay" = "default",
  locale: string = "pl-PL", // domyślnie polski
): string {
  const sameDay = end ? isSameDay(start, end) : true;

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  });
  const dayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    timeZone,
  });
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });

  switch (format) {
    case "onlyDays":
      if (!end) return dateFormatter.format(start);
      return sameDay
        ? dateFormatter.format(start)
        : `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`;

    case "withDay":
      if (!end)
        return `${dayFormatter.format(start)}, ${dateFormatter.format(start)}, ${timeFormatter.format(start)}`;
      return sameDay
        ? `${dayFormatter.format(start)}, ${dateFormatter.format(start)}, ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`
        : `${dayFormatter.format(start)}, ${dateFormatter.format(start)}, ${timeFormatter.format(start)} - ${dayFormatter.format(end)}, ${dateFormatter.format(end)}, ${timeFormatter.format(end)}`;

    default: // "default"
      if (!end)
        return `${dateFormatter.format(start)}, ${timeFormatter.format(start)}`;
      return sameDay
        ? `${dateFormatter.format(start)}, ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`
        : `${dateFormatter.format(start)}, ${timeFormatter.format(start)} - ${dateFormatter.format(end)}, ${timeFormatter.format(end)}`;
  }
}

export function getGMTOffset(timeZone: string) {
  const date = new Date();
  const localeString = date.toLocaleString("en-US", { timeZone, timeZoneName: "short" });
  const match = localeString.match(/GMT([+-]\d{1,2})/);
  return match ? `GMT${match[1].padStart(2, "0")}` : "GMT";
}
// funkcja pomocnicza do porównywania dni
export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isBeforeDay = (d1: Date, d2: Date) =>
  d1.getFullYear() < d2.getFullYear() ||
  (d1.getFullYear() === d2.getFullYear() && d1.getMonth() < d2.getMonth()) ||
  (d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() < d2.getDate());
