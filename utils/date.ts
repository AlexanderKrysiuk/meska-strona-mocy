import { GetFullLocalizationByCityID } from "@/actions/city";
import { DateValue, TimeInputValue } from "@heroui/react";
import { City, Country, Region } from "@prisma/client";

export function combineDateAndTime(date: DateValue, time: TimeInputValue): Date {
    return new Date(
      date.year,
      date.month - 1,
      date.day,
      time.hour,
      time.minute,
      time.second ?? 0,
      time.millisecond ?? 0
    );
  }

export function combineDateAndTimeInputValue(date: Date, time: TimeInputValue): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.hour,
    time.minute,
    time.second ?? 0,
    time.millisecond ?? 0
  )
}

export function combinedDateAndTime(date: Date, time: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    time.getSeconds() ?? 0,
    time.getMilliseconds() ?? 0
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
