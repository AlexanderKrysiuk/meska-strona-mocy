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

export const formatTimeZone = (tz: string) => {
    const now = new Date();
  
    const offset = new Intl.DateTimeFormat("pl-PL", {
        timeZone: tz,
        timeZoneName: "longOffset",
    })
        .formatToParts(now)
        .find(part => part.type === "timeZoneName")?.value;
  
    // Wyciągamy miasto z nazwy strefy (np. Warsaw z Europe/Warsaw)
    const city = tz.split("/")[1]?.replace("_", " ") ?? tz;
  
    return `${city} (${offset ?? ""})`;
};
  