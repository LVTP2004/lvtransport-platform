const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
export const mapsClient = {
    async autocomplete(input) {
        if (!input.trim())
            return [];
        const response = await fetch(`${API_BASE}/v1/maps/autocomplete?input=${encodeURIComponent(input)}`);
        const data = await response.json();
        return data.items ?? [];
    },
    async placeDetails(placeId, description) {
        const response = await fetch(`${API_BASE}/v1/maps/place-details?placeId=${encodeURIComponent(placeId)}&description=${encodeURIComponent(description)}`);
        return response.json();
    },
    async routeEstimate(pickup, destination) {
        const response = await fetch(`${API_BASE}/v1/maps/route-estimate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pickup, destination }),
        });
        const data = await response.json();
        return data.routeSummary;
    },
};
