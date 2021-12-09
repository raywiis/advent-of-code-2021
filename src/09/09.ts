import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";

const inputFilePath = join(
	dirname(fromFileUrl(import.meta.url)),
	"09.input.txt"
);
const input = await Deno.readTextFile(inputFilePath);

const getKey = (rowIdx: number, colIdx: number) =>
	JSON.stringify([rowIdx, colIdx]);
const fromKey = (s: string) =>
	JSON.parse(s) as [rowIdx: number, colIdx: number];
const mapperize = (rows: string[]) => {
	const map = new Map<string, number>();

	for (const [rowIdx, row] of rows.entries()) {
		for (const [colIdx, col] of [...row].entries()) {
			const key = getKey(rowIdx, colIdx);
			map.set(key, parseInt(col));
		}
	}

	return map;
};

const directions = [
	[-1, 0],
	[0, -1],
	[1, 0],
	[0, 1],
];

const findLows = (map: Map<string, number>): [string, number][] => {
	const lows: [string, number][] = [];
	for (const [key, height] of map.entries()) {
		const [row, col] = fromKey(key);

		const neighbors = directions
			.map(([dx, dy]) => {
				const cRow = row + dx;
				const cCol = col + dy;

				return map.get(getKey(cRow, cCol));
			})
			.filter((a): a is number => a !== undefined);
		const lowPoint = neighbors.every((n) => n > height);
		if (lowPoint) {
			lows.push([key, height]);
		}
	}
	return lows;
};

const map = mapperize(input.split("\n").map((a) => a.trim()));
const lows = findLows(map);

const risks = lows.map(([_, height]) => height + 1).reduce((a, c) => a + c);

const getBasinSize = (
	map: Map<string, number>,
	initialKey: string
): number => {
	const queue = [initialKey];
	const visited = new Set();
	let size = 0;

	while (queue.length > 0) {
		const key = queue.shift() as string;
		if (visited.has(key)) {
			continue
		}
		visited.add(key)
		size += 1;

		const [row, col] = fromKey(key);
		const neighbors = directions
			.map(([dx, dy]) => getKey(row + dx, col + dy))
			.map((key): [string, number | undefined] => [key, map.get(key)])
			.filter((a): a is [string, number] => a[1] !== undefined);

		for (const [nKey, nVal] of neighbors) {
			if (nVal === 9) {
				continue;
			}

			queue.push(nKey)
		}
	}

	return size;
};


export const part1 = risks;
const basins = lows.map(([key]) => getBasinSize(map, key))
const largest3 = basins.sort((a, b) => b - a).slice(0, 3)
export const part2 = largest3.reduce((a, b) => a * b);
