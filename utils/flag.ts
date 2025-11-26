export const countryToFlag = (isoCode: string) =>
    isoCode
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
  