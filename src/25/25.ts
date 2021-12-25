import {
	assertEquals,
	assert,
} from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { wrapIterator } from "https://deno.land/x/iterator_helpers@v0.1.1/mod.ts";

type Cucumber = "v" | ">";
type Tile = Cucumber | ".";
type PosKey = string;
type Position = [number, number];

const pToKey: (p: Position) => PosKey = JSON.stringify;
const keyToPosition: (k: PosKey) => Position = JSON.parse;

function parseInput(input: string): Map<PosKey, Tile> {
	const map = new Map<PosKey, Tile>();

	[...input.trim().split("\n")].forEach((row, y) => {
		[...row].forEach((tile, x) => {
			assert(tile === ">" || tile === "." || tile === "v");
			map.set(pToKey([x, y]), tile);
		});
	});

	return map;
}

function draw(map: Map<PosKey, Tile>) {
	const yMax = Math.max(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([_x, y]) => y)
			.toArray()
	);

	const xMax = Math.max(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([x, _y]) => x)
			.toArray()
	);

	const yMin = Math.min(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([_x, y]) => y)
			.toArray()
	);

	const xMin = Math.min(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([x, _y]) => x)
			.toArray()
	);

	for (let y = yMin; y <= yMax; y++) {
		let row = "";
		for (let x = xMin; x <= xMax; x++) {
			row += map.get(pToKey([x, y]));
		}
		console.log(row);
	}
}

function move(map: Map<PosKey, Tile>, movers: Cucumber): Map<PosKey, Tile> {
	const newMap = new Map<PosKey, Tile>();

	const yMax = Math.max(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([_x, y]) => y)
			.toArray()
	);

	const xMax = Math.max(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([x, _y]) => x)
			.toArray()
	);

	const yMin = Math.min(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([_x, y]) => y)
			.toArray()
	);

	const xMin = Math.min(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([x, _y]) => x)
			.toArray()
	);

	for (let y = yMin; y <= yMax; y++) {
		for (let x = xMin; x <= xMax; x++) {
			const source = pToKey([x, y]);
			const tile = map.get(source);
			assert(tile)
			if (tile !== movers) {
				if (!newMap.has(source)) {
					newMap.set(source, tile);
				}
				continue
			}

			const dest = pToKey(
				movers === ">" ? [(x + 1) % (xMax + 1), y] : [x, (y + 1) % (yMax + 1)]
			);
			const destTile = map.get(dest);
			assert(destTile);
			if (destTile !== '.') {
				newMap.set(source, tile);
				continue
			}

			newMap.set(dest, tile);
			newMap.set(source, ".");
		}
	}

	return newMap;
}

function doRound(map: Map<PosKey, Tile>): [boolean, Map<PosKey, Tile>] {
	const m1 = move(map, ">");
	const m2 = move(m1, "v");
	const same = isSame(map, m2);
	return [same, m2];
}

function isSame(m1: Map<PosKey, Tile>, m2: Map<PosKey, Tile>): boolean {
	const yMax = Math.max(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([_x, y]) => y)
			.toArray()
	);

	const xMax = Math.max(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([x, _y]) => x)
			.toArray()
	);

	const yMin = Math.min(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([_x, y]) => y)
			.toArray()
	);

	const xMin = Math.min(
		...wrapIterator(map.keys())
			.map((key) => keyToPosition(key))
			.map(([x, _y]) => x)
			.toArray()
	);

	for (let y = yMin; y <= yMax; y++) {
		for (let x = xMin; x <= xMax; x++) {
			const positions = pToKey([x, y]);
			if (m1.get(positions) !== m2.get(positions)) {
				return false;
			}
		}
	}

	return true;
}

// const sampleInput = `
// v...>>.vv>
// .vv>>.vv..
// >>.>v>...v
// >>v>>.>.v.
// v>v.vv.v..
// >.>>..v...
// .vv..>.>v.
// v.v..>>v.v
// ....v..v.>
// `;

const sampleInput = `
.>.>......>.vvv>v..>>.v.v.vv.......v.v.v.vv...v>vv...>>v>>.v.v..>>v.>>...v>.v...v>>>..>v>.>.>>vvv>.v..v>>.vv.v.v>>>>..>>.v>.>>.vv>..v....>>
....>>v.vv>>v..>vv>.>v>.>.>v>.vv....v>v...v..v>>>>.v...>.v>.>v...>v..v..v.v..v.v.v>>..v.vv...v..v>>.>.>..>v..vv>......>..>v>v>..>....v.v.vv
v...v.>....vv>vv...>.v...v>v.>.v.....>..vv..>.v.v.v>.>...>vv.....>..vvvv.v>>>>>>v...>>v.>.>vvv.vv>.v>....>.v>v..v.v.v..>..>....v.>vvvv..v>>
v..v..v.v..>v..>..v.>.>..v>.>>...>..v.v>v.>....>>.>.v>>.....>v.vv.v>..v>>.v..>.>>.v.>>v..>v..v.>.>.vv>....>v...>.v..v.>.....v.v>.>v..v>....
>>vv.>..>v>v.vvv>>v>v...>.v.vv...>v..v>..vv.vvv.......v>>.vvv>...vv>>v.>>v.>......vvv.......v..>>>>.v..vvv....>vv.....v..>vv>v>.....v>..v.>
>.>v.>v..v>>v.>vv...>>.....>..>v.........v..>.>..vv>>....v>.>>>>...v.v.vvvvv>v.........v...v>v..v>v>....v.>.>.v>..>v.v..v>v>>>>v>v>v>....>.
>v.>v>.vv>.....v>.....v...>...v.>v..>v.>v>v>v>.>>.>.v>...v>.>.v.v>v.>..>.>...vv>....>.vvv.v.v..v...>>>..>v.>>>>.>.....vv>v.v.vvvvv>.>>.....
..v...v.v.>.v..v..v>v.>>v.v.vv..>.>.v..vv.vvv..>vv.>>.v.>.v...>.>>>.v..v..v.>>.>...vv.>v>......v...v>.v.vvv>..v..vvv..v>.v>....vv>>>>.....v
>.......>..v.vvv>vvvvv>..v>>..>>>.>.>..>>.v.v.....v.>..>..v.>...>..>v.>.>>.v....>vv>>v>.v>..v>v>>>>>.vv.>v.vvv>.>>...>v...v.>vv.v>.v.v.v...
v...>..v.>vv...v......vv.>>..v..>>>>..v....v.vvvv.>>..v..v>vv..v..vv>v>..>>...v.>.vv...vv..vv..v>....v.v>.vvv......>.v>..>.v.>.vv...v.>>.>.
.>v.>...vv..>>>>.vvv..v...>...v>..vv>..>v.>v....v...v..v>.>>>.>>...v>..>v.>...v>..v.>.v....>.v.v.vv>..v>..v.>..v.vv.>.>v>>>>.v....>>....>.>
>v>vv>v.v..>v..>vv.>>.v..vv.>>>>.>.vv.>....vv.>....vvv.vv....>vv.>vv>.....v>v..>>..>>.v....>...>v..>..v.....v>>v..v>>>>v>.v>.>>.>>.>....>.v
.v>v.v..>v.vvvv.>v>v>.>..>.v..>v.v.>vv>>>..v.v.v>..v>>..>vv.>v.>>.....>...>.vv>v.vv>.>...>.....>v...v>......v>...v.>....v.v.>>v..>....>.v.>
.>.>v...v>.vv.>.v>>>..>>v>..>>.>......>v.>vvv....>..>...........>v>.v.vv>>>..>.v.v>.vv.>vv.v.>..>.v......>.......v>>.>...>>..v......>.vv..v
...>v>v>.>.v.v..>v>v>.>v.>vv......>v.v.>.>>vv..>.>.>.vv.vv.v.v>>v.v.vv.>...v..>....>...>..v>.v.>..v.v.v.v>vv.>vv.v..v..>v>>>...>>>....>..v.
>..>>..>.v>.v.>.v.>.v...v...>..v.>vvv.v.>.v..v......>..vv.vv.>..v>v.>..v>.v....v........>.>>....v.>.>.>..>....>v.>vv.>v.v.v...>>>.v>>>.vv>.
v.........>.....v.vvv..>>>v>v..>..>....v.>v..>vv.v.>..v..>>.vvvv>v>v>.vv.>..>v..>v.....>>.vv>.v.....>v>.vv>>>.v>>>v...>>v..v..>v..v>vv.>.>v
>..>...>v.....v.v>...vvv..>vv>v>.>>>.>>..v>.v>>>....v.>v.>>vv>v...vv..v>>>.>.v.vv>>.>.>.v...>....>.vv...v>v>>.v.v>......vv..v>.....>>>.>.v>
..>..v.v>v.>.vvv..>..>>>.>..v.>v.>v.>...vvvv.v.>v>.>v....v....v..>.v..>>.>..vv..v..>v>.v...>v.>v...>>.>.v.vv>.>.v.vv......v>.>v...>>.>v>>..
v..>v.v>v.>.>.>...>.>v>>>...v>vv>vvv...>>>>>.>vv.vvv...v>>.......>>>>.>>>v.>.>.>.....v>>>v>>..vv...v>...v..>..vvvv.v..v.>v....>v.....v.>vv.
vv>.>>..v>v......>.vvv..vv>>.....>...>v.>.v..vv>>vv..>>.v..vv.v...v>>..v.v.v>.vvv.v..>.v..>v..>v>>vvvv.>..v...v..>vv.>..vv.vv....v.>.......
......>v>.>.......vv.>..v>>v.>>v>>..vv>>>>v.v>.>v...v>.>.>.....>.v.v.v>>>v...vv..vv.....vvv...>.v>v.>..>>.vv.>...v..v..........vv>..>>>...>
vv>.>v.v>..vv.vvv>>.>.v>..>.>>>.vv>...>>v.>...>.>v..>.>vv.>.>v.>>v..v.v>>>>v.vv>.>..v.....v..>...>...v......>.>v.>.v...>vv>v.....>..>v...v>
.>v........>..v>...>>>.>vv..>..v.....v.vv..>>.>..>.>.vv...v...v..v>v.v..........v>.....>.>>v.vvv>vv.>v..>....>vv>>v....>>v.vvv..vv>v>.>>.>v
>v..>.>.>...v..v>v.v>>v.>..v..>.>>.>.v>>....>v>.vv.>>v.v.......v.>.v...>.v...>...v.v..v..>.v.v>v..v.vvv......v.>...>.vv..>>.....v..v.>v>.>>
.v>.v>.vv>v.>.>.>....>.>vvv..>.>v.vvvv..>......v...v....>v...vv>.>>>>.vvv.>v>>..v>>..v..v..>...vvv.v..>.>>..>v..vv.>v..>>v>..>v>vv.>.v.>>v>
.v.>..vv.>v>v..>>vv.....>.v....>vv..>>>v.>...>.>.>.>.....vvv.>v>..v>.v>....vv......>>v.>v..v>v....v...>vv...>>.>v..>.>vv>...>....vv..v...>v
..>..>.v>>v>>>v..>v...v.vv...>...>...v.>.>...v...>.v>v.>>>>..>.v...v>v......>>v.vv>.>v...>v....v>vvv>.v>>.....>.v......>vvv>.v...>v>v.v.>>v
.v>.>.>..v>..>>>.>.vv.v>..>.>.>.v.v>.....v>.v....>>........v.>v..v.>.vv.>>>.v....>v>vvv.v.........>..>.v>...v>.>vv.v..vvv>>>v.....v>.>..v>.
v.>.>>>>v>.v>.>>v..>vv......v>>.vv>v>....v.>..>vv>v>>v.v.v..v.v>.>.>v..>>....v>v..v>.v.v.v.v>vvv.>v...>.vv.vvv>.>.>v>.>>>.v......v.v.>v....
.>vvv..>..vv.vvv.v..>v.v>v...v....>.>.v....vv.v.vv.v.....>>..>.>>v>.>v.v>.v..v.>>..>.v..v..v>..v.vv>.vv>.v.....>.>.>>.v.v>>>v.vv..>>.>.>>.>
v.>v..>>.....v..>v>...v>.v....vvv>>v.....>..v...>>>v.v.>vv...v.vv>v.v.>>..>vv..v.>v..>v>.>...v.>....v...vv>.v.>v>..vv...v>v.>>>vv>>.v.>.v>>
v.v..vv......>...vv...>..v..>.v.>vv>>>>>>vv..>>..>vv>>.v...>..vvv.>>>.>vv>>>v...>..>>.v.>..v.v...>.>v>v...>v>v.>.v...vvv>..v.>v.....v.>v.>.
>.>>...vv.>.....v.>>.>.v.>.vvvv...>>v>.>vv..>>v>>>.>.>>.v>>..>..>v.vvv>>v>>.....v>.>>.vv.v...v....>.>>..>>..>>..v>>>.v..v>.v.....v..vv..v.>
..>.>>..v..v.>>..vv...v..vv>>>.v>.>vv...>v.v>.>....v>>>..v>..>>>>..v..v....vv>..vv.vv>v>..v.>v>>v.v.>....>.>.v>v..>.>v>.>.v........v.v.vv..
>>>.v....>v>..v..>v.v...>..>v.>.vv....v>..vv>.>.>.v...v..>.vv..v......>>.>v.v..v.>>v>.>.v.vv.>>..v>.v.vvv..>..>....>v>....v.>.vv>v>..>.>v..
>>vv.....v>.>v>.v..>...>>v.vvv.vv.>.v>..>>..v..v..v.vv>..vvv..vv.>.>.vv>>.v.vv>.>....v.vvv>>>.>.>.>>>>.v>vv..v.vv.>vv>...v.>.>>>>....v.v...
.>.>v...v.v.v.v>....>.v....v>v.vv>>.v.>>v>v..>.v>v.>.>>>>>.>>vvvv.v.v...>...>>.>.>.>v..>vv>>..>>..>>>>..vv.v.vvv..vv......v>.....>.v..vvv..
>.vv....>...>.>..vv..>v.v.>.v.v.>>>>vv..v>.v..>.v>>......>.v>..>.v...v..>.>.....vvv>.v..v>.>v>v..v.>>>.v..>>vvvv>>v....>v.>vv.v.v.v...>.>vv
......>..>.>>..vv>...>...v.>v>.>vv.v.....v>vv>.>.>vv..>v>v.v..>v..v...>>.>>...>..v>vvv>..>....>.....v.>.>.v>v..>v>.>....>.vv>>v>v.v.v>vv...
v>.v..>>>.>.>>...v.v.v.vv>.v....v>v.v>.....>.v......>..vv.>v>.>v....>v.v.vv......vv...>>..>..>v..>v>..v..>.....v>.vv>....>>..>...v...>.....
>.v.......vvv.>>.>>..v>.>....v...v..>vv.v.v>.>...v...>v.>..vv>>...>....v....>>.>v.v...>..v...v..vvvvv>>.v.v.vv>..>>..>.v.vv..v.>..vv>...>v.
.v>>...>.v>..>..>v.v>>.>v>.v>v.>>vvv.>..v.....>....vv.>>.>>.>>v.>.>>....>.v...>...v..v...>>v..>>.vv>>.vv..v....v>.v>>...vvv.v.>>v.....>v...
.v>..>.vvv...v>v........>v..v>.v..>>.vv...v.vvvv>.v>v..v>v....>....v>>>.>.v>>v..>.>vv.>>.>.v>v>..v....v>...>..>v....v..>>>.vvv.>v.......v.>
.>.>>.>.>.v.v.v.>>>>..vv.v..>>>>...v..v.>..v.>.>.>...vv>>.vv>..v.>...>v>>.>vvv>.>.>>..>...v.>..>...>>v.>v>>...v.>>...>.v>>v.v..>.>.>vvvvvv.
.>v>>.vv..v..>..>...>>>.>v>.>v>>v>>vv..>..>.v.v>...v>..v>>......>..>vv...v.vv..>>>>vv>v>.>>v.>vvv>v..v.vvv.>.v...>v.>>v..v..v>.>v..>>..vv.v
..>v.>vv....vvv>>>>...vv.>vvvv.....>...>...v...vv>.v.....v>>v.v.v.>>v.v.vv>..>>v.>>....v>.v>.v.v..v.v>.....vv..v.>v...v.>v....vv......>.vv.
..v.v..>v...v>vv.v.v>>..>vv.vvv.>>.....>v..v......>..vv>>>.vv>v.>>.>.>v.v.vvv>....v>>..>v>..vv...vv>>>..........vv..v.v.vv...>.>vv.v>>v.v..
.>..>..>>.>v>v.v..>>.v.>vv.v..vv.>...>.v..vvvv>>.>..>..>>.vv.>v.vv..v>vv.>.....v.v.>v...>v.v>>>...>..v..>..vv>.v.>>>...>.>v.vv.>.>...>..v>.
.v.>.vv...v>>>...>>.v.v>.>.>.v..vv>.vv.>.>...v.>.v...>>v.v>>>.>>>>..v>>>.>.v.v.v.>...>...vvv>.v>v..>vv.v.>vvv.>.>..>..vvv...v.>v...vv...vv.
.>.>..>>>>..>v.vvv....>v.>v.....v>...>>...>>.>>..>..>>.>v>v>v.v>>..v>v...>vvv...v>....v...v.v..v>.......v>>...v..v>v.>.v.vv.v.v.v.>>>v..>v>
.>..>v>>v..>v>v..vvvvv.vv.vv.>.>.>v....>.v>>.v.v..v>v.v.>..>>.v.v......>.v>....>v>>v....v>v>v..>.>vv..>.v>>vv......vv.v.>v>>>.v>v>.>....>.>
v...>>..>.v>>v.>.>..v.>v>..>v>....>>..v.....>..>vv>vvv.>v>>.>....>>v>....>>.v>.>vvv>>.>vv..v>..v...v.>>..vv>v.v..>...vv>>..>v>v>...>.v>.>>.
>..vv>vv>..v..>>v.vv....v..>..vv>v.v..vv>v.v.>>.v.vvvv.>.>>.>v>.v..>vv.>vvv.>.........v>vv......v..vvv.v.v.v...v>>.v..>...vv...>>.v>>v>..>.
.>.>>........>>v>.v.v.v...v>..>v.vv.v.>...>.......v>..>....vv..v>v>...>.v>>>..vv.>...v..>..v..vv..v.v.v.>..>v>.vv>..v>>.v.>>.v>>>v.>>>.....
....vvv.vv.>.v...v...v>v>..>.>>.>>.>.v>v...v..>>.vv.v.v>>v.>v..>>v...>.>>>>.>.v...vv.>>>.v...>...v..vv...>>v>vv..>.>..>v.v..>>..>vv.>..>.v.
.vvv....>vv>>>vv>v.v>v.>>..v.>v.vvvv...>v>..vv>.>v..>.>>....v.>>..v..>>....>>.v>..>>.>>>......>>>v.v.v......vv...v>>>.v>.v.v>>vv..>.>...>..
.v...>....>v.v..>.>.......v.>vvv>v>....v.>>..>.v>.v>.>.v..vv..>vv...v....v..>v....v>v...v.>.>.>..>.....>vv>v>>.v..vvv>>vv.....v>.>.v.v..v..
>..v...v>v>...>>....>..>v.vvv>>v.>v>>..>>vv>.>..>.>>.vv>>v.>.>.vv....v.>>v>>.v>...v.>>vv.v.vv....v.>.v.v.>v>...>>.>>>vv...v....>v..v>v>.>.v
v.>v.vv..>v>v...>>.>>.....>v>>vv>.>.v>.v>...v..>.>..>.v.v.>vv...>>v.>..v>.>>.vv..v>..v.vv.>>v.>.v....vv.vv.vv...>v.>>.>.v>.v.>.v.>.>.>...>.
vv>...v.v.v.>.......v.v>v.v....>.v.>>...v.>...>.>.v.v>.v>.v.v>v>..>.v.v>v>....>...>...>....>.vv.......>v.>>.v>>vv.>.>v.vv.vvv>..v>>...vv>.>
.v.v...vvv..>>....v.>v.....v>.>.v>..v>>>.vv..>.......>.>...>>>.>v.v>>.vv.v>.v..vv........v.>v.>.>.v..v>v>.>>>.vv....>>...v.>.......v....>..
>>..>v>v>v.vv.........>v...>v>vv..>.>...>>......>>>>.v>...v>v.....v.v..v>...vv>..v..>...>>>....>...v>v.v.>v.>...vv..v>>>...>.>>..v>>.vv....
v..>...v.v.>.v>>v.v.>>..>v>v..v.>...>>vv.>>>>v>v>v..>v..>.>>v.vv...v..v.v..>.>...vv..v..v.>..vv.>>v>v>vv.>...v...>vvvv.>v.v.>..>v>.>>..>.v>
...v.....>.v.>.v..vv..>v>....>v>>v.>.>>.....>....>.v.>...>.>..vvv>.vv>.vvv.>.v..>.>.v..v>vv>.vv.vv..v.>>.......>>v...vv>>vv>.>..vvv..vv>...
v>>v.vv>.vv.v>vvv....>.>v....v..v.vv.>>>.v..>>..v......v.>v>..>>.v>v..>.>vv...>..v>v..>.>v>.>>v.v>v>vv>...v.....v.v..v..>v.>vv>vvv>v...v...
..>..........>vv.v.>>..>>..v>>...>vv>v....>.>.v>..>...>v.v>vvvvv.vvv>v.v>.....>.....>...>.>.>...vv.v..v>>.v>>......v.v>vvvv.v.v.>>.>.vv.vv.
v..>>>.>v.>.v.>.v.>.vv.>..>>>vv...vv>..>.>.v>..>vv...v...>>>v>.>>...>.>v.>v.>.vv..v>v>.>.v...v>vv>>v.>v..>.>vv...>>>v>>....vv.v..>...>.....
....v.>.>vv.>.>vv>vv>>.>v..vv..v>.v..>....vv.>v>..v..v..v.>>..vv.vv.v>..vvv..v.v.>v..>>..>>>>v>....v.v.>....v.>vv...>v......v..v>.>.v.vv.v>
...vv.v>v>vv>v>>v.....>.vv.v>..v.v>>.>...v..>.v>v>....>.v>..>vv.vv..v>v>vv>>..>vv..v.>.>.v..v>>>.>.>>vv>..>...v>v.v.v>v.>>v>>v>>...>v>.>..v
v.....>.vv.>.v.>>v>.v.>vv..vv.>vv>v..>.v..v.v.>......>v..vvv...>>>>..>>>.v.>.v.>v>v>.>>>>v.>>.v>v>v>.>.>..>..>>v..v>.v.v..>vv..vv>...>>.v.v
.vv...>.v.>.>>>.>vv>v....v>..>.....>>v..v>v.v.v>......vv>..>>.>>.>>v....>.v>>v...vv>>....v>....>v.v>v....v..>vvv>..v....>>.>.v.v>....v>>.vv
.vv..>.v.>>>>v.vv.v>vvv>..>>>>..>>.>>v...>.>v.v>v.>>v.>.vvv>..v>>>..v......>..v.>.>...vvvv>.>>.>..>.vvv..vv.v>.>.v..>..>..vvv...vv.>>v.>vv>
....v.v..>>>v...vv..vv>..vvv..>v.>>.>.>..>v>...>>.v>..v>.v..v...>..>vv..>.v...>v.vv.>.vv...v.v.>..>.....v.>v..>....vv>.>v.>v.......v...vv>.
.>v.v..>.....v>v...vv>>.v>.v..>.>.....>.........>..v.>>.v.>.v.>vv.v.>.v>>v...v.vv>....>.v...v.>>>.>>......v...v.vv>v...>v>.v..v>>>vvvv.vv.v
v..v.vv..>v.v.>>..>.>...v.v....v...>.v..v.vvv.v>>...>>v...v.>..>>..>....>..v..vv.>>.>>..>...>.>.v.v.>..v.v.>...v>v>.v.vv.>..vv>.>.>>....v..
.v.>.>...v...v...>vv>v.>.>..>.v.>v.vvv.vv.v>>.v........v.>>.v.>v.v>.>>v.vv.>...>v...>.vv>..v>>....v>.>>vvv.v.>..vvv>>v.v..>..v..vvv..vv.>v>
>v>...vv.v..v..v..>..>v.v...>..v>>.v>vv>>v.>.v.v.>.v.v>>....v.....>v..v.>>>>v.vvv..vv...>.>>..>..>vv>>v..v.>....v>....>v.>.>....>....>.>...
..v..>v>>v.>>vvv>v...>>.>v..v>.>.v>....vv...vv.>...v>..v>>....>>>.>vv.>...v>>..>..>....>vv..>....vvvv...>.....vv.>>.>>..>>.>.>...>.>...>.>.
v>..>....v.>>..>>....>vv>vvv>>.vv>v.v>.>>...>v..>>.vv.v.v...>.....>>v.>v>>vv>.....>v>v.v..v..>.>..>.>>vv>.v.v..v...>>....>..>v..v...v>v..>v
..>.>v.v....>.v.>..v>>.....>...v..v.>>v.v>>vv>.>>v>.....>v>....vv...v..>.v.vv..>.>>.>.vv>.v.>v.>....>.vv>.v.>.....v.v..v>>.....v.>>.v..>vv>
v.v.....v>...vvvv>>..vv.>..v>.v.>..>.>...v..>.v..v.v.v.vvv........>.>.v>>>>.>...vvv.v.v..vv..>>.>.>..>..vv.vv.vv..>..v..v.v>vv.v>..>>>.>.vv
>v>v>.>>.>v.v.v.v..vv......vv..v.v...v.>>>vv.v>v..>>..v..>>>....>vv..v....>.>...>.vv....v>v.>>>v>vv..>......>v.v..>vv.v>.v.>.>.>..v.vv.v.>.
v.vv.v.>.vv>.v..v.>...>.v>>v..vv.>.>v..v>.>v.v.>.>.v>.vv>>.v..>>>...v....vv.v..v.v..>v...v.>.>......v..v>>.>.vv..vvvv..>..>v...>v>..>vv..>v
>v.>vv...vv..v....>>.vv.v>vv>.v..v>.....vv>..v>..>....>>>.>....v>..v.>vv>.>>.>.>..>.>.v>>v>v....>.....v.>.>.v..>vv...>vv..>>v>>>..>.v>v.v.v
..>.v.v.>>>v>>..>>>.>vv.v>..v..v>>v>>v>.v>v.v...>>vv.>..>.>...>..>>v>v...v>>...>...v..>>>.v.v>.>....vvvv..>vv...>v..>.>..>...>vv.v.>vv..>v>
.vv..>.vv.vvv.>v.v>.>....v>..v.v>..>.vv>>>vv.vv.>..>...>>..>..>v>.v.>>>v>.>...v.>...v..v...v....>.>..>>v..v.>>>>...>..v.>..vv.v.>>>v.vv..v.
..vv.>....vv.>...v....vv>vvv.>.v.>.v..v>...v>...v.v...>..>.>v>.v>..vv>v>v>>v.>...v....v...>.v.>...>>.vvvv>..v>...>>.v>..>v.....v.v.>v..>..>
..v>..>>v>>v>..vvv.v..v..v.>.>.v..vvv>vvv.......>>v>>.vv.>v>v>>vv.>v..>v..>.>.v>>v.>.>>.v.>.vv..>>.vv.>.>.v.v.>>>..>.>vv>....>.>v.v...>.>..
.vv..vv..v.....>.v..>.v>.>>..v.v>v.v>..v..>.....v>...>.>v>>..>.vv.....>..v.>.v.>.vv>vvv..vv.......>>v>v.v.v.>..>...v..v>>.>.....>>v.>.>..>>
>...v.>v>v...v.v..>>.v>v..vv.v.>..>...vv.vvv...v..>>.>>..>.>..vv..v.v..vv>.>v.>vv.v.......>>..>>.vvv>>.>.>vv..>>.v>v>.v.>....>v>>.v.>......
>v...v.v.vv>>v>v>.v>>..v>..vv.>vv>v.>..>.v.vv>.>>.>vvv.>vv...v..v>......>.>v>v.v.vv>>....v..vv>.>>.>.>v>...>....v...>v.>>.....vv...>.>>.v>>
>>>v.v>>...v..>..vv.>>>..v.v...vv..>..v.>vv>.>>v>>>.v.>>..>v.>v...v>.>.v>.vv.>....v>.v>.vv.>...>v.vv.v.....v.v>v..v>.>>v.vv....vv>..vvv>v..
.>..v...v.>v>.....>.v.v>.v..v.v>>..vv>.>v....>>.....vv.>>>....v>..v.>.>vv.v>>v>.vv...>>>vv.v.>..>vvvvvv.v...>..>..>>....>.>.v.>v.>..>..>..>
..>>.v...v..vv.>..vv>.>v...v.v.>...>.vv..>.v.>>>.v.vv>.vv...v......>..>..>..vv.v..>>.>.>.>..>..v...>.>v..>..>v..>>>v.>>v>.>..>...v.vv.>....
>>..v.>.vv.vv.>v>..v.v..vv..>v.vv..vv..>>.vv>vv>.>>.v..>>....v>v>...v..v.....>.>v.>.vvv>>.>.v>v..>.v>v>.......vv..>.v>.v....>.v>.v>vv>vvv.v
v>v>>..>v>>..v.vv>>.>..>>..>v.vv..vvv.v>.v>v...>>>.>....v.>v>..v.v..vv.>v.vv.>>.vv>..>.>>v.>.v...>vv.v....>..>.v...>v.>v>>.......v..v..v>..
>v..v>.....>.>vvvv.>..>....>v.>v>>vv..v>>.v...>.v...v.>.vv...vv.v.....>>>vv.v.v>.>.>.>..>.>..v.vv>.>..>>>>..>>....v.vvv.v.>vv>...>...vv..v>
..v>v.....>>>.vv..v.vv.vvv>>..>vv>..v>.vv.v>.>>.....>>v.v.>..>.>.v..vv>v...>v>.v>....>.>v.>v........>.v.vv>>v.>.>>>v.>.>v>vv...v...>.>v.v>.
...>>>vv>..>......v>>..v..>v>..v>v.vv>.v.....v...v>>vv.>.>...>v>>>..>.>.vv>>v...>>.>...>.vv.v.>.>..>.>...>...v.>.........v.>>>v>...>.v....>
>.....>.>>v>....>.>..v.>.>....v..>>.vvv.>v..vv.v.....>vv>.vv.v...>..v>....>.>>v>>..v>vv..>v....>........>v.>>v.>>..>..>.v.vvv.vv.>.v.vv..v.
v...vv..>..v..v>.v>.....>..>.v>>..vvv...>>v>v..v.>>.....>.>..v.>........>>v....v..v.v>>...>..>v.vv.>>......>..vv..v.v.v..v.>>v>.>>.v..>>...
>.>....v.>v.v.v.>..v.......vv.v...>..v.>.v>....vv..v.>>>>.....v....v.>>>v.>v...vvvvv..>v.>>v>>..v>v.>>.>......v>>>v>..>.>..>.v..v>>>.>..vv.
v>v...v>..>>v.>.v>..v>v>>v.v..vv>...>....vvv>>v>...>.>>....>>>.v....>v...vv.v...v>.v>.>.>>>.vv>vv..vv..v>>.>v.>v.>...>v...>..v.....v>....v>
..>>.v..>..>v.>vv...v...>..v..>v>.>vvvvv.vvv>v.v>..>>v.vvv.>v>.>>.>v....vv.....vv.vv.v....>.......v.>.v.>v..>.vv........v>....v>>....v>.>..
>>>>v...>.>>.>v>>>v>.>.>>v..>...>.v>.v.>.v..v..v>..>v.vvv>.v>..vv..>....>.>.v.>...>>.>>....>>v...v..vv>....v.>.>v>.vv.......>>.vv......v.v>
v.>..>.vv..v..v>>>v...>.v..v..v>v.>>v.v....>.>.v....>.v..v.>.v>>v.>v.>>>>.vv....>v..v>.>..vv.v>vv..v...vv>v.vvvvvv>..>.v>>v..v>v.v>>.vv..>>
.v.v.v.vv...v>....>>.v>...v>>.....v..vv.>>..>v...>>..vv>>>.v>v..v..>.v.>..v.>>>v>..v>v>...>>>v>>.>.....v>>>v>.v...>....vv.>>>......v>....v.
v>>vv>..v....v...>>>...vvv..>..>..>.>>..>>.>>.v...v......vv..v...vv..>................v....v.v..>>v.>>..>.v...>.>>>....>>...>.v.>.>v>>v>.v>
v...>v..>.v...>..>>v>...>....>..v>.vv...vv...v>.v.>>.>...vv..>.v>.>.>>.>..>>...>....v.v...>v>>...>>v........>.v>.>v>>.>.vv>vv.v...>v...v..v
...>..>vv..v.....vv....v..v>v.>v.>v.>.v.v>>>>.v..>.v>..>v.v>>.v>>v.v.>...v>..v....v>....v.>...>v..v>v.vv>v>vvvv.>.>.v>vvv.....>..v.>..>v..>
>v.....v..>.....>..v.v..........>v>v>v....v>.vvv..>vvv..v..vv>.v>.>.>vv.>v>..vv.>.vv>...>vv.>.v...>..v.>v.v>.v..>>v.>v..>..v>>v.v.>.>vvvvv.
.>...>>>.vvv..>..v.v.>...>...vvv.v.v.>v>>>.v.>>.v>....v>>.vv..>v>...>>...vv...>.v...v..vv.v..vvv..v.>.>>..>.>.vvv.>>.>v.>>>>>....>>....vv>.
.vv>....>..vvvv..v..vv.vvv.v.....>vv>..v.>v>v.>.v.>>...v>.>vvv>vv.>.>vv...v..>..vv.....>>...v.>.>v>.>vv>>v.>v.v..>.>>.>.>.v...vv.v>v>.....v
.vv.v.v>..>vv...>v.v....v.>>.>vv>v.v.>>v>v>..>v.v>....vv..vv>v...v..vv>>>.vv>..v..>....v........vv>v...v>.>.>v>vvvv>v>...>v..v>.v>..v.>>.>.
....vvv>vvv>.vv..v...>vv>>vvv.vvvv>v>v...v>...>.vvvvv.vv..>vv.>....>.....>>.v>.>>>v.v....>...>....v.>......v>v>v.>>...>..v..>v>...v..v.....
..>.>.>.v>>.>v>>....vv.>>>>.>..>vv>.v.>>.>.....>v.....vv...v.>...vv..v...>.v...>.v..>.vv.v..>..>v.>>>v>vv>...>v>>vv.>.>.v.>.>>.....>...v>.>
.v..>vvv..>.>.....>.v>...>>>v.v..v>v...>...>.....v..vv>>>..vv.v..v>v.>...>vvvvvvv>>.v>v.>..vv>vvv.>....>.>>....v>v>....vv.>..>..>..>>v.....
.....>>..>..>..vvvv.v>>..vv....>v.>vvvv>>>>..vv>...v>......>.vv..>.>.vv.v...>v...vv....v>..v.v...>.>.>....>v.v>>>>>>..>....>.>v....v>>.v>.>
vv>.>..>v....v.>>.v..vv..v.v..>v....>..v>.>v>...>.v..v>.>.v..>.v.....vv..v.v>.>..v.v..vv.>>>>.>>>vv.>vv>>..v..v.>..>.vvv>.v.vvv.>.v...>>>..
.v>.v...>>...>..>>v.>.v>>...v..vv.>>v...>...v>...>>>..v..v>...>>...v...>v>.>..v>v.>>v>..>...v>...vv>vvv>v..>.>.v.v....>.>v.>...>.v>>>...>.>
v>....v....vv.>v.>v.v>vvvv>..>v.v.v>v>v.v.>..>>>.v..v>v........vvv..>.>vv.>....>vv.v....>v..vv.v...>.vv>.v>v..vv.v...>v.v.>....>>....vvv..>
..v>v.v.v>....>.>.v..v..>v.v>..v.vvv...v>vv.>....>.>>>..>v..v>...vv.v.>v>>.>.>>v>>v....vv>v..vv.>.>..>.v.>>v...vv>.vv.>v...v.v>v>.>vv.>.>.>
>..>>.vv...v.>>.>.>.>>......>v>>.>vvvv..v>.vv>.>.v>v>..>>.v..v.>v.>>..>vv>.v.>..v>.v.>..>v.v>.v>>.>...v>..>>>>.>>.>>v>v.>v.>v>v>v...v.>v.vv
v>>....v>>.v>v..v..vvv..v>.v.>v>vv>.v.....>...v>..v.vvvv..>>v>>vv.v.v>......v>.>...vvv.....v.>vv>>..>vv>v.>>>v.v..v..v>.>>...v..>.vv>...vv.
v....>>v>v>>v...v.>vv>v.v>..v.v.>>v..>.>..>.v.>v..v..>>.>.vvv..>v>..vv>..>.v>.vv>.v>.>>v>vvv...>vvvv...v...vv.>.>v>.....v>>>>>v.>v>..>.>...
v..>>.>.>v>...>>v......>.>..>>...v>v..v...>.v.vv.>>v.>..>vv.vvvv..v>v..vv..>.v...>..>...v...>v...vv>>v....v...v.vv>.>.v.>vv...v...v....>vvv
v.>.v.vv.>v>.....>...>...v>>...>>v>>..>v.v..v>>.....v.>..vv.v.v.v.>....>>>>..>vvv..v>.>.....v.v.v.>>..v..v..>v>>v>>>.v..v..v..v..>...>.v>v.
.>.v>.....>v>>.>>>.....>..>v.>v......>.v..>..v>>.vv.vv..>.>..v.>v....>.>>v.>.v..>>v.>...>>>v..>........>v.>..v>..vv.v...>....>v>>...>v...vv
vvv>v>.vv...>vv...vv.>v...v...>.vvv.vv.>.v.>v>...v>.>>.>>..vvv.vv...>vv..v.>>v.....v.vv>..v..vv..>.>>v>..vv>..........>..>.vv>vv..v..>>vvvv
v>.v...vvv.v.v.>>.>.>.v......v>.>....v...v>>>.>........>>.....v.>v.>.v>...>v...v>.>.v..>>..>.vv...>>v...v......vvvvv..>>.>.vvv.......v>>.v.
>..>.>>.v.>..>v..>v>vv.>.>.>>>.>>>.vvv>>.v>.>>.>>.>>>..vv>>....>v..vv.v.vv.v>v.v.v....v>.....>>v.>vvv>..>..>.>>.v>>..v>>.....>.>>>...v..>..
>>.v...v>.>v..v...>.>>>.v...>>v...........v..>>.>vv.>v..>v.>>v.v>>v.v....vv...v.>.v>..v.....vv>..v..>..v..>>.>v.vv...v.>>>vv..>.>v.>>.v>.v.
.vv..>>..v....v>vv....v>.v.vv.>.vv>>>>...>.vv.>.v.v.>>v.>v.v>..v>..>vv.>.v.vv...v>...>..v>.v>.>....vv..>>.v>..>.v....v>.>vv>v>.>>..v.>..>>v
>.v..>....>>vv.>>.v.v.>>>v..>>v>>>>..>.vv.v>..v.>>v.>..v..v..v.>..vvvvv..>....>>..v.v.vvv>vvv>.v.>v.vv>.>...v.>v....vv.v.>>v...vv...vv...v.
....>>..>...>...vv.>....v..>vvvv>vv.>v.>vvv..v>v>......vvvv.....>...>vv...>.>......>>......>>..v..>>......v..vv...>>v...v>v.>>>..>v..vv..v.
.vv>>>>...>.v.>....v....vv>.>.>v.>...>>v.....v.v.>.v.>v>>..v>v.vv>vvv.>v>..v>v>.>..>vvv>...v.>...>..v.....>.v.>vvvv..>v.>>vv.....v>v>.v.vv>
`

let map = parseInput(sampleInput);
let same = false
let moves = 0

while (!same) {
	moves += 1;
	if (moves % 100 === 0) {
		console.log()
	}
	const [newSame, newMap] = doRound(map);
	same = newSame;
	map = newMap;
}

console.log(moves);
