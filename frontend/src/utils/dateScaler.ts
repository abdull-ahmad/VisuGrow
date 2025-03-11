import { TimeScale } from '../types/visualization';

export function groupDataByTimeScale(data: { primary: Date; secondary: number }[], scale: TimeScale) {
    const grouped = new Map<string, { primary: Date; secondary: number }>();

    data.forEach((point) => {
        const key = getTimeScaleKey(point.primary, scale);
        const existing = grouped.get(key);

        if (existing) {
            existing.secondary += point.secondary;
        } else {
            grouped.set(key, {
                primary: getScaleStartDate(point.primary, scale),
                secondary: point.secondary
            });
        }
    });

    return Array.from(grouped.values());
}

function getTimeScaleKey(date: Date, scale: TimeScale) {
    // Add safety check
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error('Invalid date provided:', date);
        return 'invalid-date';
    }
    switch (scale) {
        case 'Y': return date.getFullYear().toString();
        case 'M': return `${date.getFullYear()}-${date.getMonth()}`;
        case 'W': {
            const year = date.getFullYear();
            const firstDayOfYear = new Date(year, 0, 1);
            const pastDays = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            const week = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
            return `${year}-W${week.toString().padStart(2, '0')}`;
        }
        case 'D': return date.toISOString().split('T')[0];
        default: return date.getFullYear().toString();
    }
}

function getScaleStartDate(date: Date, scale: TimeScale) {
    // Return normalized date (e.g., first day of month/year)
    switch (scale) {
        case 'Y': return new Date(date.getFullYear(), 0, 1);
        case 'M': return new Date(date.getFullYear(), date.getMonth(), 1);
        case 'W': {
            const day = date.getDay(); // Sunday = 0
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday start
            return new Date(date.setDate(diff));
        }
        default: return date;
    }
}

export function formatDateByScale(date: Date, scale: TimeScale): string {

    if (!date || isNaN(date.getTime())) {
        return '';
    }
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    switch (scale) {
        case 'Y':
            return `${year}`;
        case 'M':
            return `${month} ${year}`;
        case 'W':
            return `Week ${Math.ceil(day / 7)} ${month} ${year}`;
        case 'W':
            return `${day} ${month} ${year}`;
        default:
            return `${year}`;
    }
}