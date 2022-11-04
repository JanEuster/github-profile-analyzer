export const daysBetween = (start: Date, end: Date) =>
	Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
export const dayOfYear = (date: Date) =>
	Math.floor(
		1 + (date.getTime() - new Date(String(date.getFullYear())).getTime()) / (1000 * 60 * 60 * 24)
	);
export const fullYearsInRange = (start: Date, end: Date) => {
	const max = end.getFullYear();
	const min = start.getFullYear() + 1;
	const years = [];
	for (let i = min; i <= max; i++) {
		years.push(i);
	}
	return years;
};
export const dateToIndex = (start: Date, dateStr: Date | string) => {
	const date = new Date(dateStr);
	return daysBetween(start, date);
};
