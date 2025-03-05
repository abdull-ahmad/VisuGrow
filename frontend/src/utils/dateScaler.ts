import { TimeScale } from '../types/Chart';

export function groupDataByTimeScale(data: { primary: Date; secondary: number }[], scale: TimeScale) {
    const grouped = new Map<string, { primary: Date; secondary: number }>();

    data.forEach((point) => {
        const key = getTimeScaleKey(point.primary, scale);
        const existing = grouped.get(key);

        if (existing) {
            // Aggregate values (example: sum)
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
    switch (scale) {
        case 'year': return date.getFullYear().toString();
        case 'month': return `${date.getFullYear()}-${date.getMonth()}`;
        case 'week': return `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
        case 'day': return date.toISOString().split('T')[0];
        default: return date.getFullYear().toString();
    }
}

function getScaleStartDate(date: Date, scale: TimeScale) {
    // Return normalized date (e.g., first day of month/year)
    switch (scale) {
        case 'year': return new Date(date.getFullYear(), 0, 1);
        case 'month': return new Date(date.getFullYear(), date.getMonth(), 1);
        case 'week': return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
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
        case 'year':
            return `${year}`;
        case 'month':
            return `${month} ${year}`;
        case 'week':
            return `Week ${Math.ceil(day / 7)} ${month} ${year}`;
        case 'day':
            return `${day} ${month} ${year}`;
        default:
            return `${year}`;
    }
}