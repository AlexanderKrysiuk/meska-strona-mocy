import { CalendarDate, Time } from "@internationalized/date";
import { DateValue, TimeInputValue } from "@heroui/react";
import { City, Country, Region } from "@prisma/client";

export function combineDateAndTime(date: DateValue | Date, time: TimeInputValue | Date): Date {
  let year: number, month: number, day: number

  if (date instanceof Date) {
    year = date.getFullYear()
    month = date.getMonth()
    day = date.getDate()    
  } else {
    year = date.year,
    month = date.month -1,
    day = date.day
  }

  let hours: number, minutes: number

  if (time instanceof Date) {
    hours = time.getHours()
    minutes = time.getMinutes()
  } else {
    hours = time.hour,
    minutes = time.minute
  }

  return new Date (year, month, day, hours, minutes, 0, 0)
}

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

export const formatedMeetingDate = (
  start: Date,
  end: Date,
  locale: string,
  timeZone: string
) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const dayName = startDate.toLocaleDateString(locale, { weekday: "long", timeZone });
  const date = startDate.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone
  });
  const startTime = startDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone
  });
  const endTime = endDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone
  });
  
  return `${dayName} ${date} ${startTime} - ${endTime}`;
};
  
  
export const formatMeetingDate = (
  start: Date,
  end: Date,
  cityId: string,
  countries: Country[],
  regions: Region[],
  cities: City[]
) => {
  const city = cities.find(c => c.id === cityId);
  const region = regions.find(r => r.id === city?.regionId);
  const country = countries.find(co => co.id === region?.countryId);

  const locale = country?.locale ?? "pl-PL"; // fallback na polski

  const startDate = new Date(start);
  const endDate = new Date(end);

  const dayName = startDate.toLocaleDateString(locale, { weekday: "long" });
  const date = startDate.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const startTime = startDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = endDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dayName} ${date} ${startTime} - ${endTime}`;
};

export const formatDate = (start: Date, end: Date, locale: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  if (sameDay) {
    return `${startDate.toLocaleString(locale, {
      dateStyle: "full",
      timeStyle: "short",
    })} - ${endDate.toLocaleTimeString(locale, {
      timeStyle: "short",
    })}`;
  }

  return `${startDate.toLocaleString(locale, {
    dateStyle: "full",
    timeStyle: "short",
  })} - ${endDate.toLocaleString(locale, {
    dateStyle: "full",
    timeStyle: "short",
  })}`;
};

export const formatShortDate = (
  start: Date,
  end: Date,
  locale: string,
  onlyDate: boolean = false
) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (onlyDate) {
    return dateFormatter.format(startDate);
  }

  if (sameDay) {
    return `${dateFormatter.format(startDate)}, ${timeFormatter.format(
      startDate
    )}-${timeFormatter.format(endDate)}`;
  }

  return `${dateFormatter.format(startDate)}, ${timeFormatter.format(
    startDate
  )} - ${dateFormatter.format(endDate)}, ${timeFormatter.format(endDate)}`;
};

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
