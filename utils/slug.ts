export function liveSlugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD") // rozkłada znaki diakrytyczne (np. ą → a + ogonek)
        .replace(/[\u0300-\u036f]/g, "") // usuwa ogonki i akcenty
        .replace(/[ł]/g, "l") // ł osobno, bo normalize nie ogarnia
        .replace(/[^a-z0-9\s-]/g, "") // usuwa wszystko poza literami, cyframi, spacją i myślnikiem
        .replace(/\s+/g, "-") // zamienia spacje na myślniki
        .replace(/-+/g, "-") // usuwa podwójne/trójnasobne myślniki
        .replace(/^-+/, ""); // usuwa myślniki z początku
}

export function finalSlugify(text: string): string {
    return liveSlugify(text).replace(/-+$/, ""); // dodaj usuwanie z końca    
}

export function liveNameify(text: string): string {
    return text
        .trimStart()
        .replace(/\s{2,}/g, " ")               // zamienia wielokrotne spacje na jedną
}

export function finalNameify(text: string): string {
    return liveNameify(text).trimEnd()
}

export function numberify(value: string): number | null {
    const cleaned = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  
    return cleaned === "" ? null : parseInt(cleaned, 10);
}
  

// export function numberify(value: unknown): number | null {
//     if (value === "") return null;
  
//     const cleaned = String(value).replace(/\D/g, "").replace(/^0+(?=\d)/, "");
//     return cleaned === "" ? null : parseInt(cleaned, 10);
// }
  
