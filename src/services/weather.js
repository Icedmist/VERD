// ═══════════════════════════════════════════
//  Weather Service (Mock Data)
// ═══════════════════════════════════════════

window.WeatherService = {
    async getCurrent(location = 'Nairobi, Kenya') {
        await new Promise(r => setTimeout(r, 500));

        const conditions = [
            { condition: 'Sunny', icon: 'sun', temp: 28, humidity: 45, wind: 12, uv: 8 },
            { condition: 'Partly Cloudy', icon: 'cloud', temp: 25, humidity: 55, wind: 8, uv: 5 },
            { condition: 'Light Rain', icon: 'cloudRain', temp: 22, humidity: 78, wind: 15, uv: 3 },
            { condition: 'Overcast', icon: 'cloud', temp: 24, humidity: 62, wind: 10, uv: 4 }
        ];

        const idx = Math.floor(Date.now() / 3600000) % conditions.length;
        const current = conditions[idx];

        return {
            location,
            ...current,
            feelsLike: current.temp - 2 + Math.floor(Math.random() * 4),
            rainfall: current.humidity > 60 ? Math.floor(Math.random() * 15) + 2 : 0,
            soilMoisture: Math.floor(Math.random() * 40) + 30,
            lastUpdated: new Date().toISOString()
        };
    },

    async getForecast() {
        await new Promise(r => setTimeout(r, 300));
        const icons = ['sun', 'cloud', 'cloudRain', 'sun', 'cloud'];
        const today = new Date().getDay();
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].slice(0, 5).map((_, i) => ({
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(today + i + 1) % 7],
            icon: icons[i],
            high: 24 + Math.floor(Math.random() * 8),
            low: 14 + Math.floor(Math.random() * 6),
            rain: Math.floor(Math.random() * 80)
        }));
    },

    getAdvisory(weather) {
        const advisories = [];
        if (weather.temp > 30) advisories.push({ level: 'warning', text: 'High temperature detected. Ensure adequate irrigation for heat-sensitive crops.' });
        if (weather.humidity > 70) advisories.push({ level: 'info', text: 'Elevated humidity levels. Monitor for fungal diseases on leafy crops.' });
        if (weather.uv > 6) advisories.push({ level: 'warning', text: 'High UV index. Newly transplanted seedlings may require shade protection.' });
        if (weather.rainfall > 10) advisories.push({ level: 'info', text: 'Significant rainfall expected. Delay fertilizer application to prevent nutrient runoff.' });
        if (weather.soilMoisture < 35) advisories.push({ level: 'danger', text: 'Soil moisture below critical threshold. Irrigate within 24 hours.' });
        if (advisories.length === 0) advisories.push({ level: 'success', text: 'Weather conditions favorable for all scheduled field activities.' });
        return advisories;
    }
};
