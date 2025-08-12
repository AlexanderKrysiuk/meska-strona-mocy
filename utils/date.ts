import { DateValue, TimeInputValue } from "@heroui/react";

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
  