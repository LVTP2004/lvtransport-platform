export const detectLanguage = (text) => {
    const input = text.toLowerCase();
    if (/(hola|reserva|recogida|destino|vuelo|gracias)/.test(input))
        return 'es';
    if (/(hello|book|booking|pickup|destination|airport|thanks)/.test(input))
        return 'en';
    return 'nl';
};
