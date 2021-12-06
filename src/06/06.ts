import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";

const inputFilePath = join(
	dirname(fromFileUrl(import.meta.url)),
	"06.input.txt"
);
const input = await Deno.readTextFile(inputFilePath);
const data = input.split(",").map((a) => parseInt(a, 10));

const buckets = data.reduce((map, item) => {
	map.set(item, (map.get(item) || 0) + 1);
	return map;
}, new Map());

const initialTimer = 8;
const resetTimer = 6;

const runDay = (initialFishes: Map<number, number>): Map<number, number> => {
	const map = new Map();
	for (const [days, fishCount] of initialFishes.entries()) {
		if (days === 0) {
			map.set(resetTimer, (map.get(resetTimer) || 0) + fishCount);
			map.set(initialTimer, (map.get(initialTimer) || 0) + fishCount);
			continue;
		}
		map.set(days - 1, (map.get(days - 1) || 0) + fishCount);
	}
	return map;
};

const runDays = (
	initialFishes: Map<number, number>,
	days: number
): Map<number, number> => {
	let map = new Map(initialFishes);
	for (let i = 0; i < days; i++) {
		map = runDay(map);
	}
	return map;
};

const getSum = (m: Map<unknown, number>): number =>
	Array.from(m.values()).reduce((acc, val) => acc + val);

export const day80Count = getSum(runDays(buckets, 80));
export const day256Count = getSum(runDays(buckets, 256));
