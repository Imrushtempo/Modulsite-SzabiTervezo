interface Holiday {
    date: string; // YYYY-MM-DD
    name: string;
}

// Magyar nemzeti ünnepek és munkaszüneti napok
const HOLIDAYS: Record<number, Holiday[]> = {
    2024: [
        { date: '2024-01-01', name: 'Újév' },
        { date: '2024-03-15', name: '1848-as forradalom' },
        { date: '2024-03-29', name: 'Nagypéntek' },
        { date: '2024-04-01', name: 'Húsvéthétfő' },
        { date: '2024-05-01', name: 'A munka ünnepe' },
        { date: '2024-05-20', name: 'Pünkösdhétfő' },
        { date: '2024-08-20', name: 'Szent István napja' },
        { date: '2024-10-23', name: '1956-os forradalom' },
        { date: '2024-11-01', name: 'Mindenszentek' },
        { date: '2024-12-25', name: 'Karácsony' },
        { date: '2024-12-26', name: 'Karácsony 2. napja' },
    ],
    2025: [
        { date: '2025-01-01', name: 'Újév' },
        { date: '2025-03-15', name: '1848-as forradalom' },
        { date: '2025-04-18', name: 'Nagypéntek' },
        { date: '2025-04-21', name: 'Húsvéthétfő' },
        { date: '2025-05-01', name: 'A munka ünnepe' },
        { date: '2025-06-09', name: 'Pünkösdhétfő' },
        { date: '2025-08-20', name: 'Szent István napja' },
        { date: '2025-10-23', name: '1956-os forradalom' },
        { date: '2025-11-01', name: 'Mindenszentek' },
        { date: '2025-12-25', name: 'Karácsony' },
        { date: '2025-12-26', name: 'Karácsony 2. napja' },
    ],
    2026: [
        { date: '2026-01-01', name: 'Újév' },
        { date: '2026-03-15', name: '1848-as forradalom' },
        { date: '2026-04-03', name: 'Nagypéntek' },
        { date: '2026-04-06', name: 'Húsvéthétfő' },
        { date: '2026-05-01', name: 'A munka ünnepe' },
        { date: '2026-05-25', name: 'Pünkösdhétfő' },
        { date: '2026-08-20', name: 'Szent István napja' },
        { date: '2026-10-23', name: '1956-os forradalom' },
        { date: '2026-11-01', name: 'Mindenszentek' },
        { date: '2026-12-25', name: 'Karácsony' },
        { date: '2026-12-26', name: 'Karácsony 2. napja' },
    ],
    2027: [
        { date: '2027-01-01', name: 'Újév' },
        { date: '2027-03-15', name: '1848-as forradalom' },
        { date: '2027-03-26', name: 'Nagypéntek' },
        { date: '2027-03-29', name: 'Húsvéthétfő' },
        { date: '2027-05-01', name: 'A munka ünnepe' },
        { date: '2027-05-17', name: 'Pünkösdhétfő' },
        { date: '2027-08-20', name: 'Szent István napja' },
        { date: '2027-10-23', name: '1956-os forradalom' },
        { date: '2027-11-01', name: 'Mindenszentek' },
        { date: '2027-12-25', name: 'Karácsony' },
        { date: '2027-12-26', name: 'Karácsony 2. napja' },
    ],
};

const holidayMaps: Record<number, Map<string, string>> = {};

function getHolidayMapForYear(year: number): Map<string, string> {
    if (!holidayMaps[year]) {
        const map = new Map<string, string>();
        const holidaysForYear = HOLIDAYS[year] || [];
        holidaysForYear.forEach(h => map.set(h.date, h.name));
        holidayMaps[year] = map;
    }
    return holidayMaps[year];
}

export const getHoliday = (date: Date): string | undefined => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    const holidayMap = getHolidayMapForYear(year);
    return holidayMap.get(dateString);
};

export const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
};
