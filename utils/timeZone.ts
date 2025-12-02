// export const formatTimeZone = (tz: string) => {
//     const dtf = new Intl.DateTimeFormat("pl-PL", {
//         timeZone: tz,
//         //timeZoneName: "short"
//         timeZoneName: ""
//     });
//     // zwróci coś w stylu: "czas wschodnioamerykański (USA)"
//     return dtf.formatToParts(new Date()).find(part => part.type === "timeZoneName")?.value ?? tz;
// };

// export const formatTimeZone = (tz: string) => {
//     const now = new Date();
  
//     // długi, opisowy format strefy
//     const longGeneric = new Intl.DateTimeFormat("pl-PL", {
//       timeZone: tz,
//       timeZoneName: "longGeneric"
//     }).formatToParts(now).find(part => part.type === "timeZoneName")?.value;
  
//     // offset GMT
//     const longOffset = new Intl.DateTimeFormat("pl-PL", {
//       timeZone: tz,
//       timeZoneName: "longOffset"
//     }).formatToParts(now).find(part => part.type === "timeZoneName")?.value;
  
//     if (longGeneric && longOffset) return `${longGeneric} (${longOffset})`;
//     return longGeneric ?? longOffset ?? tz;
//   };

import moment from "moment-timezone"

export const getIanaTimeZones = () => {
  return moment.tz.names().map(tz => ({
    name: tz
  }))
}

export const formatTimeZone = (tz: string) => {
    const now = new Date();
  
    let offset = "";
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            timeZoneName: "short",
        }).formatToParts(now);
  
        const tzPart = parts.find((p) => p.type === "timeZoneName")?.value;
      
        // jeśli offset jest w formacie GMT+1, GMT-5 itp.
        if (tzPart?.startsWith("GMT")) {
            offset = tzPart;
        } else {
            // fallback dla niektórych przeglądarek
            offset = "GMT+00:00";
        }
    } catch {
        offset = "GMT+00:00"; // fallback dla nieobsługiwanych stref
    }
  
    const [, cityRaw] = tz.split("/");
    const city = cityRaw?.replace(/_/g, " ") ?? tz;
  
    return `${tz.split("/")[0]}/${city} (${offset})`;
};