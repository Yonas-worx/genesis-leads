import wixData from 'wix-data';

export async function generateCsv() {
    try {
        // Fetch data from the dataset
        const results = await wixData.query('#dataset1').limit(1000).find();

        // Generate CSV content
        const data = results.items;
        if (data.length === 0) {
            throw new Error('No data found in the dataset');
        }

        const keys = Object.keys(data[0]);
        const header = keys.join(',');
        const rows = data.map(row => keys.map(key => row[key]).join(','));
        const csvContent = [header, ...rows].join('\n');

        // Return the CSV content
        return csvContent;
    } catch (err) {
        console.error('Failed to generate CSV:', err);
        throw err;
    }
}