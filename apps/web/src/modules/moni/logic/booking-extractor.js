export const bookingFieldOrder = [
    'pickup', 'destination', 'date', 'time', 'passengers', 'luggage', 'vehiclePreference', 'flightNumber', 'returnTrip', 'businessVipNeeds', 'name', 'phone'
];
const prompts = {
    nl: {
        pickup: 'Wat is het ophaaladres?', destination: 'Waar wilt u naartoe?', date: 'Voor welke datum?', time: 'Voor welk uur?', passengers: 'Met hoeveel passagiers reist u?', luggage: 'Hoeveel bagage neemt u mee?', vehiclePreference: 'Heeft u een voertuigvoorkeur?', flightNumber: 'Wat is het vluchtnummer (indien luchthavenrit)?', terminal: 'Kent u de terminal?', returnTrip: 'Wilt u ook een retourrit?', businessVipNeeds: 'Zijn er zakelijke of VIP-vereisten?', name: 'Wat is uw naam?', phone: 'Wat is uw telefoonnummer?', email: 'Wat is uw e-mailadres?'
    },
    en: {
        pickup: 'What is the pickup address?', destination: 'Where would you like to go?', date: 'What date do you need?', time: 'What time do you need?', passengers: 'How many passengers?', luggage: 'How much luggage?', vehiclePreference: 'Any vehicle preference?', flightNumber: 'What is the flight number (for airport rides)?', terminal: 'Do you know the terminal?', returnTrip: 'Do you also need a return trip?', businessVipNeeds: 'Any business or VIP requirements?', name: 'May I have your name?', phone: 'What is your phone number?', email: 'What is your email address?'
    },
    es: {
        pickup: '¿Cuál es el punto de recogida?', destination: '¿Cuál es el destino?', date: '¿Para qué fecha?', time: '¿Para qué hora?', passengers: '¿Cuántos pasajeros?', luggage: '¿Cuánto equipaje?', vehiclePreference: '¿Preferencia de vehículo?', flightNumber: '¿Cuál es el número de vuelo (si aplica)?', terminal: '¿Conoce la terminal?', returnTrip: '¿También necesita viaje de regreso?', businessVipNeeds: '¿Requisitos de empresa o VIP?', name: '¿Su nombre?', phone: '¿Su número de teléfono?', email: '¿Su correo electrónico?'
    }
};
export const nextMissingPrompt = (lang, data) => {
    const missing = bookingFieldOrder.find((field) => !data[field]);
    return missing ? prompts[lang][missing] : null;
};
