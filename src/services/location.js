// ═══════════════════════════════════════════
//  Location Service (Browser Geolocation)
// ═══════════════════════════════════════════

window.LocationService = {
    /**
     * Get current coordinates from browser
     * @returns {Promise<{lat, lon}>}
     */
    async getCurrentPosition() {
        if (!navigator.geolocation) {
            throw new Error('Geolocation not supported');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    resolve({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude
                    });
                },
                (err) => {
                    reject(err);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    },

    /**
     * Quick reverse geocode placeholder (could use an API)
     * @param {number} lat 
     * @param {number} lon 
     */
    async getCityName(lat, lon) {
        // In a real app, you'd call a reverse geocoding API
        // For now, we'll return a placeholder or use a free API like Nominatim if desired
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await resp.json();
            return data.address.city || data.address.town || data.address.village || 'Unknown Location';
        } catch (e) {
            return 'Detected Location';
        }
    }
};
