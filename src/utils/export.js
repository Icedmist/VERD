// ═══════════════════════════════════════════
//  CSV Export Utility
// ═══════════════════════════════════════════

window.ExportUtil = {
    /**
     * Convert JSON array to CSV and trigger download
     * @param {Array} data - Array of objects
     * @param {string} filename - Output filename
     */
    downloadCSV(data, filename = 'export.csv') {
        if (!data || !data.length) {
            DOM.toast('No data available to export', 'warning');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [];

        // Add headers
        csvRows.push(headers.join(','));

        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                const escaped = ('' + (val || '')).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
};
