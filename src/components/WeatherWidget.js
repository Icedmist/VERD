// ═══════════════════════════════════════════
//  Weather Widget Component
// ═══════════════════════════════════════════

window.WeatherWidget = {
  async render(container) {
    container.innerHTML = `
      <div class="glass rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-surface-300 uppercase tracking-wider flex items-center gap-2">
            <span class="text-verd-500">${Icons.thermometer}</span> Weather
          </h3>
        </div>
        <div class="py-6"><div class="shimmer rounded-lg h-16 w-full"></div></div>
      </div>
    `;

    try {
      const weather = await WeatherService.getCurrent();
      const forecast = await WeatherService.getForecast();
      const advisories = WeatherService.getAdvisory(weather);
      AppState.set('weather', weather);

      const weatherIconMap = { sun: Icons.sun, cloud: Icons.cloud, cloudRain: Icons.cloudRain };
      const weatherIcon = weatherIconMap[weather.icon] || Icons.cloud;

      container.innerHTML = `
        <div class="glass rounded-2xl p-5 space-y-4 fade-in">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
              <span class="text-verd-500">${Icons.thermometer}</span> Weather
            </h3>
            <span class="text-xs text-surface-600">${weather.location}</span>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="text-verd-400 w-10 h-10">${Icons.sized(weatherIcon, 40)}</div>
              <div>
                <div class="text-3xl font-extrabold text-white tracking-tight">${weather.temp}&deg;</div>
                <div class="text-sm text-surface-500">${weather.condition}</div>
              </div>
            </div>
            <div class="text-right space-y-1.5">
              <div class="flex items-center gap-1.5 text-xs text-surface-500 justify-end">
                <span class="text-blue-400">${Icons.droplets}</span> ${weather.humidity}%
              </div>
              <div class="flex items-center gap-1.5 text-xs text-surface-500 justify-end">
                <span class="text-surface-500">${Icons.wind}</span> ${weather.wind} km/h
              </div>
              <div class="flex items-center gap-1.5 text-xs text-surface-500 justify-end">
                <span class="text-verd-500">${Icons.sized(Icons.sprout, 14)}</span> Soil ${weather.soilMoisture}%
              </div>
            </div>
          </div>

          <div class="grid grid-cols-5 gap-1 pt-3 border-t border-surface-800/50">
            ${forecast.map(f => {
        const fIcon = weatherIconMap[f.icon] || Icons.cloud;
        return `
                <div class="text-center py-2">
                  <div class="text-xs text-surface-600 mb-1.5">${f.day}</div>
                  <div class="text-surface-400 flex justify-center">${Icons.sized(fIcon, 16)}</div>
                  <div class="text-xs font-semibold text-surface-300 mt-1.5">${f.high}&deg;</div>
                  <div class="text-xs text-surface-700">${f.low}&deg;</div>
                </div>
              `;
      }).join('')}
          </div>

          ${advisories.length > 0 ? `
            <div class="pt-3 border-t border-surface-800/50 space-y-2">
              ${advisories.map(a => {
        const colors = { success: 'text-verd-400 bg-verd-950/50 border-verd-900/30', info: 'text-blue-400 bg-blue-950/50 border-blue-900/30', warning: 'text-yellow-400 bg-yellow-950/50 border-yellow-900/30', danger: 'text-red-400 bg-red-950/50 border-red-900/30' };
        const iconMap = { success: Icons.checkCircle, info: Icons.info, warning: Icons.alertTriangle, danger: Icons.alertCircle };
        return `<div class="flex items-start gap-2.5 ${colors[a.level]} border rounded-lg p-2.5 text-xs leading-relaxed">
                  <span class="flex-shrink-0 mt-0.5">${Icons.sized(iconMap[a.level], 14)}</span>
                  <span>${a.text}</span>
                </div>`;
      }).join('')}
            </div>
          ` : ''}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `
        <div class="glass rounded-2xl p-5 text-center text-surface-600">
          <div class="mb-2">${Icons.globe}</div>
          <p class="text-sm">Weather data unavailable</p>
        </div>
      `;
    }
  }
};
