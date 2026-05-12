const languagePatterns = [
    { language: 'es', pattern: /(hola|reserva|recogida|destino|vuelo|gracias|precio)/i },
    { language: 'fr', pattern: /(bonjour|réservation|prise en charge|destination|merci|prix|chauffeur)/i },
    { language: 'en', pattern: /(hello|book|booking|pickup|destination|airport|thanks|price)/i }
];
export const detectLanguage = (text) => {
    const found = languagePatterns.find((entry) => entry.pattern.test(text));
    return found?.language ?? 'nl';
};
