const toRad = (deg) => (deg * Math.PI) / 180;
const distanceMeters = (a, b) => {
    const earth = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const q = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * earth * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
};
export const createDriverGpsService = (options = {}) => {
    const minUpdateMs = options.minUpdateMs ?? 8000;
    const minDistanceMeters = options.minDistanceMeters ?? 20;
    let watchId = null;
    let lastSent = null;
    const shouldSend = (snapshot) => {
        if (!lastSent)
            return true;
        const dt = new Date(snapshot.capturedAt).getTime() - new Date(lastSent.capturedAt).getTime();
        if (dt >= minUpdateMs)
            return true;
        return distanceMeters(lastSent, snapshot) >= minDistanceMeters;
    };
    return {
        start(onSnapshot, onError) {
            if (!navigator.geolocation) {
                onError('GPS is not available on this browser/device.');
                return;
            }
            watchId = navigator.geolocation.watchPosition((position) => {
                const snapshot = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    heading: position.coords.heading ?? undefined,
                    speed: position.coords.speed ?? undefined,
                    capturedAt: new Date(position.timestamp).toISOString()
                };
                if (!shouldSend(snapshot))
                    return;
                lastSent = snapshot;
                onSnapshot(snapshot);
            }, (error) => {
                onError(error.code === error.PERMISSION_DENIED ? 'Location permission denied. Live tracking is off.' : 'Unable to read location right now.');
            }, { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 });
        },
        stop() {
            if (watchId !== null)
                navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
    };
};
