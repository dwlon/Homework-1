export const parseNumber = (str) => {
    if (!str) return 0;
    const normalizedStr = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalizedStr);
    return isNaN(num) ? 0 : num;
};


export const convertDateFormat = (dateStr) => {
    const parts = dateStr.split('.');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};