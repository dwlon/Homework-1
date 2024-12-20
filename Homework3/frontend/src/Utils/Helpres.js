export const parseNumber = (str) => {
    // Remove dots used as thousand separators, replace commas with dots for decimals
    if (!str) return 0;
    const normalizedStr = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalizedStr);
    return isNaN(num) ? 0 : num;
};


export const convertDateFormat = (dateStr) => {
    // Converts 'dd.mm.yyyy' to 'yyyy-mm-dd'
    const parts = dateStr.split('.');
    if (parts.length !== 3) return dateStr; // Return original if format is unexpected
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};