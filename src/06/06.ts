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

const runDays = (
	initialFishes: Map<number, number>,
	days: number
): Map<number, number> => {
	let map = new Map(initialFishes);
	for (let i = 0; i < days; i++) {
		const newMap = new Map();
		for (const [days, fishCount] of map.entries()) {
			if (days === 0) {
				newMap.set(resetTimer, (newMap.get(resetTimer) || 0) + fishCount);
				newMap.set(initialTimer, (newMap.get(initialTimer) || 0) + fishCount);
				continue;
			}
			newMap.set(days - 1, (newMap.get(days - 1) || 0) + fishCount);

			map = newMap;
		}
	}
	return map;
};

const getSum = (m: Map<unknown, number>): number =>
	Array.from(m.values()).reduce((acc, val) => acc + val);

export const day80Count = getSum(runDays(buckets, 80));
export const day256Count = getSum(runDays(buckets, 256));
