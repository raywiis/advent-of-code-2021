import { fromFileUrl, dirname, join } from "../deps.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import { wrapIterator } from "https://deno.land/x/iterator_helpers@v0.1.1/mod.ts";

type Key = string;
type Paper = Map<Key, boolean>;
type FoldCommand = ["x" | "y", number];

const toKey = ([x, y]: [number, number]) => JSON.stringify([x, y]);
const fromKey = (key: string) => JSON.parse(key) as [number, number];

async function readInput(fileName: string): Promise<[Paper, FoldCommand[]]> {
	const inputFilePath = join(dirname(fromFileUrl(import.meta.url)), fileName);
	const input = await Deno.readTextFile(inputFilePath);
	const [mapData, foldData] = input.split(os.EOL() + os.EOL());

	const map: Paper = new Map();
	for (const line of mapData.split(os.EOL())) {
		const [xs, ys] = line.split(",");
		const [x, y] = [parseInt(xs), parseInt(ys)];
		map.set(toKey([x, y]), true);
	}

	const folds = foldData
		.split(os.EOL())
		.map((fold) => fold.split("="))
		.map(([things, numS]): ["x" | "y", number] => [
			things.slice(11) as "x" | "y",
			parseInt(numS),
		]);

	return [map, folds];
}

const [map, folds] = await readInput("13.input.txt");

function plotMap(map: Paper) {
	const yMax = Math.max(
		...wrapIterator(map.keys())
			.map((key) => fromKey(key))
			.map(([_x, y]) => y)
			.toArray()
	);

	const xMax = Math.max(
		...wrapIterator(map.keys())
			.map((key) => fromKey(key))
			.map(([x, _y]) => x)
			.toArray()
	);

	for (let y = 0; y <= yMax; y++) {
		let row = "";
		for (let x = 0; x <= xMax; x++) {
			row += map.get(toKey([x, y])) ? "#" : ".";
		}
		console.log(row);
	}
}

function foldPaper(map: Paper, fold: FoldCommand) {
	const foldedMap = new Map();
	const [axis, position] = fold;

	for (const [key, val] of map.entries()) {
		const [oldX, oldY] = fromKey(key);

		const newX =
			axis === "x" && oldX > position ? position - (oldX - position) : oldX;

		const newY =
			axis === "y" && oldY > position ? position - (oldY - position) : oldY;

		foldedMap.set(toKey([newX, newY]), val);
	}

	return foldedMap;
}

let cMap = map;
for (const fold of folds) {
	cMap = foldPaper(cMap, fold);
}

console.log(foldPaper(map, folds[0]).size);

plotMap(cMap);
