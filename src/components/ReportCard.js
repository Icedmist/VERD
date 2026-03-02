// ═══════════════════════════════════════════
//  Report Card Generator
// ═══════════════════════════════════════════
//  Renders scan results as a downloadable
//  image using HTML5 Canvas — branded card
//  with diagnosis, confidence, recommendations.
// ═══════════════════════════════════════════

window.ReportCard = {

    /**
     * Generate a branded report card image from scan result
     * @param {Object} result — the scan result object
     * @returns {Promise<string>} — data URL of the PNG image
     */
    async generate(result) {
        const W = 800;
        const H = 1100;
        const canvas = document.createElement('canvas');
        canvas.width = W * 2;   // 2x for retina
        canvas.height = H * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);

        // ── Background ──────────────────────────
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, W, H);

        // Subtle gradient overlay
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, 'rgba(26, 175, 99, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // ── Header Bar ──────────────────────────
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, W, 80);
        ctx.strokeStyle = 'rgba(26, 175, 99, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(W, 80); ctx.stroke();

        // VERD Logo text
        ctx.fillStyle = '#1aaf63';
        ctx.font = 'bold 28px Inter, system-ui, sans-serif';
        ctx.fillText('VERD', 30, 52);
        ctx.fillStyle = '#525252';
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.fillText('CROP INTELLIGENCE', 95, 45);
        ctx.fillText('SCAN REPORT', 95, 60);

        // Date + ID on right
        ctx.textAlign = 'right';
        ctx.fillStyle = '#737373';
        ctx.font = '12px "SF Mono", Consolas, monospace';
        const date = new Date(result.timestamp).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        ctx.fillText(date, W - 30, 42);
        ctx.fillText('ID: ' + (result.id || 'N/A'), W - 30, 60);
        ctx.textAlign = 'left';

        // ── Severity Banner ─────────────────────
        const sevColors = { none: '#1aaf63', moderate: '#eab308', high: '#ef4444' };
        const sevLabels = { none: 'HEALTHY', moderate: 'MODERATE RISK', high: 'CRITICAL' };
        const sevColor = sevColors[result.severity] || '#737373';
        const sevLabel = sevLabels[result.severity] || 'UNKNOWN';

        ctx.fillStyle = sevColor + '15';
        this._roundRect(ctx, 30, 100, W - 60, 60, 12);
        ctx.fill();
        ctx.strokeStyle = sevColor + '40';
        ctx.lineWidth = 1;
        this._roundRect(ctx, 30, 100, W - 60, 60, 12);
        ctx.stroke();

        ctx.fillStyle = sevColor;
        ctx.font = 'bold 14px Inter, system-ui, sans-serif';
        ctx.fillText(sevLabel, 55, 137);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#e5e5e5';
        ctx.font = 'bold 24px Inter, system-ui, sans-serif';
        ctx.fillText(result.confidence + '%', W - 55, 140);
        ctx.fillStyle = '#737373';
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillText('confidence', W - 55, 155);
        ctx.textAlign = 'left';

        // ── Condition Card ──────────────────────
        let y = 185;
        ctx.fillStyle = '#171717';
        this._roundRect(ctx, 30, y, W - 60, 120, 12);
        ctx.fill();
        ctx.strokeStyle = '#262626';
        ctx.lineWidth = 1;
        this._roundRect(ctx, 30, y, W - 60, 120, 12);
        ctx.stroke();

        // Left accent bar
        ctx.fillStyle = sevColor;
        this._roundRect(ctx, 30, y, 4, 120, 2);
        ctx.fill();

        ctx.fillStyle = '#737373';
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillText('DETECTED CONDITION', 55, y + 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Inter, system-ui, sans-serif';
        ctx.fillText(result.condition || 'Unknown', 55, y + 58);
        ctx.fillStyle = '#a3a3a3';
        ctx.font = '13px Inter, system-ui, sans-serif';
        const desc = result.description || '';
        const descLines = this._wrapText(ctx, desc, W - 120, 13);
        descLines.slice(0, 3).forEach((line, i) => {
            ctx.fillText(line, 55, y + 80 + i * 18);
        });

        // ── Confidence Bar ──────────────────────
        y = 325;
        ctx.fillStyle = '#262626';
        this._roundRect(ctx, 30, y, W - 60, 8, 4);
        ctx.fill();
        ctx.fillStyle = sevColor;
        const barW = ((result.confidence || 0) / 100) * (W - 60);
        this._roundRect(ctx, 30, y, barW, 8, 4);
        ctx.fill();

        // ── ML Data ─────────────────────────────
        y = 355;
        if (result.mlData) {
            ctx.fillStyle = '#171717';
            this._roundRect(ctx, 30, y, W - 60, 60, 12);
            ctx.fill();
            ctx.strokeStyle = '#262626';
            this._roundRect(ctx, 30, y, W - 60, 60, 12);
            ctx.stroke();

            const cols = [
                { label: 'MODEL', value: result.mlData.modelVersion || 'MobileNet v2' },
                { label: 'INFERENCE', value: (result.mlData.inferenceMs || '?') + 'ms' },
                { label: 'PROCESSING', value: 'On-device' }
            ];
            const colW = (W - 60) / 3;
            cols.forEach((col, i) => {
                const cx = 30 + i * colW + colW / 2;
                ctx.textAlign = 'center';
                ctx.fillStyle = '#525252';
                ctx.font = '10px Inter, system-ui, sans-serif';
                ctx.fillText(col.label, cx, y + 25);
                ctx.fillStyle = '#d4d4d4';
                ctx.font = 'bold 13px Inter, system-ui, sans-serif';
                ctx.fillText(col.value, cx, y + 45);
            });
            ctx.textAlign = 'left';
            y += 80;
        }

        // ── Recommendations ─────────────────────
        ctx.fillStyle = '#171717';
        this._roundRect(ctx, 30, y, W - 60, 30 + (result.recommendations || []).length * 45, 12);
        ctx.fill();
        ctx.strokeStyle = '#262626';
        this._roundRect(ctx, 30, y, W - 60, 30 + (result.recommendations || []).length * 45, 12);
        ctx.stroke();

        ctx.fillStyle = '#1aaf63';
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.fillText('RECOMMENDATIONS', 55, y + 22);

        (result.recommendations || []).forEach((rec, i) => {
            const ry = y + 40 + i * 45;
            // Number circle
            ctx.fillStyle = '#1aaf63' + '20';
            ctx.beginPath(); ctx.arc(65, ry + 8, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1aaf63';
            ctx.font = 'bold 11px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(String(i + 1), 65, ry + 12);
            ctx.textAlign = 'left';

            // Rec text
            ctx.fillStyle = '#d4d4d4';
            ctx.font = '12px Inter, system-ui, sans-serif';
            const recLines = this._wrapText(ctx, rec, W - 160, 12);
            recLines.forEach((line, j) => {
                ctx.fillText(line, 88, ry + 8 + j * 16);
            });
        });

        y += 40 + (result.recommendations || []).length * 45 + 20;

        // ── Soil Metrics ────────────────────────
        if (result.soilMetrics && y + 100 < H - 80) {
            ctx.fillStyle = '#171717';
            this._roundRect(ctx, 30, y, W - 60, 90, 12);
            ctx.fill();
            ctx.strokeStyle = '#262626';
            this._roundRect(ctx, 30, y, W - 60, 90, 12);
            ctx.stroke();

            ctx.fillStyle = '#1aaf63';
            ctx.font = 'bold 11px Inter, system-ui, sans-serif';
            ctx.fillText('SOIL METRICS', 55, y + 22);

            const metrics = [
                { label: 'N', value: result.soilMetrics.nitrogen, unit: 'ppm' },
                { label: 'P', value: result.soilMetrics.phosphorus, unit: 'ppm' },
                { label: 'K', value: result.soilMetrics.potassium, unit: 'ppm' },
                { label: 'pH', value: result.soilMetrics.pH, unit: '' },
                { label: 'OM', value: result.soilMetrics.organicMatter, unit: '%' }
            ];
            const mColW = (W - 80) / metrics.length;
            metrics.forEach((m, i) => {
                const mx = 45 + i * mColW + mColW / 2;
                ctx.textAlign = 'center';
                ctx.fillStyle = '#525252';
                ctx.font = '10px Inter, system-ui, sans-serif';
                ctx.fillText(m.label, mx, y + 45);
                ctx.fillStyle = '#e5e5e5';
                ctx.font = 'bold 18px "SF Mono", Consolas, monospace';
                ctx.fillText(String(m.value), mx, y + 70);
                ctx.fillStyle = '#525252';
                ctx.font = '10px Inter, system-ui, sans-serif';
                ctx.fillText(m.unit, mx, y + 82);
            });
            ctx.textAlign = 'left';
        }

        // ── Footer ──────────────────────────────
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, H - 50, W, 50);
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, H - 50); ctx.lineTo(W, H - 50); ctx.stroke();

        ctx.fillStyle = '#525252';
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillText('Generated by VERD Crop Intelligence', 30, H - 22);
        ctx.textAlign = 'right';
        ctx.fillText('verd.app', W - 30, H - 22);
        ctx.textAlign = 'left';

        // ── Watermark line ──────────────────────
        ctx.strokeStyle = '#1aaf63' + '30';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, H - 50); ctx.lineTo(W, H - 50); ctx.stroke();

        return canvas.toDataURL('image/png');
    },

    /**
     * Download the report card as a PNG file
     * @param {Object} result — scan result
     */
    async download(result) {
        try {
            const dataUrl = await this.generate(result);
            const link = document.createElement('a');
            link.download = `VERD-Report-${result.id || 'scan'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Report generation failed:', err);
            DOM.toast('Failed to generate report', 'error');
        }
    },

    /**
     * Share via WhatsApp with report summary
     * @param {Object} result — scan result
     */
    shareWhatsApp(result) {
        const sevMap = { none: 'Healthy', moderate: 'Moderate Risk', high: 'Critical' };
        const text = [
            `*VERD Crop Scan Report*`,
            ``,
            `Condition: ${result.condition}`,
            `Confidence: ${result.confidence}%`,
            `Severity: ${sevMap[result.severity] || 'Unknown'}`,
            ``,
            result.recommendations ? `Top recommendation: ${result.recommendations[0]}` : '',
            ``,
            `Scanned with VERD Crop Intelligence`
        ].filter(Boolean).join('\n');

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    },

    // ── Helpers ─────────────────────────────

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },

    _wrapText(ctx, text, maxWidth, fontSize) {
        const words = text.split(' ');
        const lines = [];
        let line = '';
        for (const word of words) {
            const test = line ? line + ' ' + word : word;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        return lines;
    }
};
