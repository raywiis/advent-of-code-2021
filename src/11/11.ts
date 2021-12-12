import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import { wrapIterator } from "https://deno.land/x/iterator_helpers@v0.1.1/mod.ts";

const inputFilePath = join(
	dirname(fromFileUrl(import.meta.url)),
	"11.input.txt"
);
const input = await Deno.readTextFile(inputFilePath);
const data = input.split(os.EOL());

const levels = data.map((row) => [...row].map((o) => parseInt(o, 10)));

const directions = [
	[-1, 1],
	[0, 1],
	[1, 1],
	[1, 0],
	[-1, -1],
	[0, -1],
	[-1, 0],
	[1, -1],
];

function* getDirections(
	[x, y]: [number, number],
	{
		minX,
		maxX,
		minY,
		maxY,
	}: {
		minX: number;
		maxX: number;
		minY: number;
		maxY: number;
	}
): Generator<[number, number], void, unknown> {
	for (const [dx, dy] of directions) {
		if (x + dx < minX || x + dx > maxX) {
			continue;
		}
		if (y + dy < minY || y + dy > maxY) {
			continue;
		}
		yield [x + dx, y + dy];
	}
}

const runStep = (
	map: Map<string, number>
): [Map<string, number>, number, boolean] => {
	const newMap = new Map();

	const xVals = wrapIterator(map.entries())
		.map(([key]) => fromKey(key))
		.map(([x]) => x)
		.toArray();

	const yVals = wrapIterator(map.entries())
		.map(([key]) => fromKey(key))
		.map(([, y]) => y)
		.toArray();

	const bounds = {
		minX: Math.min(...xVals),
		maxX: Math.max(...xVals),
		minY: Math.min(...yVals),
		maxY: Math.max(...yVals),
	};

	for (const [key, val] of map.entries()) {
		newMap.set(key, val + 1);
	}

	const flashedSet = new Set();

	let flashed = true;
	let flashes = 0;
	while (flashed) {
		flashed = false;
		for (const [key, val] of newMap.entries()) {
			if (val < 10 || flashedSet.has(key)) {
				continue;
			}
			flashes += 1;
			flashed = true;
			flashedSet.add(key);
			const coords = fromKey(key);
			for (const pos of getDirections(coords, bounds)) {
				const key = toKey(pos);
				newMap.set(key, newMap.get(key) + 1);
			}
		}
	}

	for (const key of flashedSet.values()) {
		newMap.set(key, 0);
	}

	const allFlashed = flashedSet.size === newMap.size;

	return [newMap, flashes, allFlashed];
};

const fromKey = (key: string) => JSON.parse(key) as [x: number, y: number];
const toKey = (coords: [number, number]): string => JSON.stringify(coords);

const mapData = levels.flatMap((row, rowIdx) =>
	row.map((cell, colIdx): [string, number] => [toKey([rowIdx, colIdx]), cell])
);

const initialMap = new Map(mapData);
let map = initialMap;
let totalFlashes = 0;

for (let i = 0; i < 100; i++) {
	const [newMap, flashes] = runStep(map);
	map = newMap;
	totalFlashes += flashes;
}

console.log(totalFlashes);

map = initialMap;
let done = false;
let step = 0;
while (!done) {
	step += 1;
	const [newMap, _flashes, allFlashed] = runStep(map);
	map = newMap;
	done = allFlashed;
	if (allFlashed) {
		console.log(step);
		break;
	}
}
