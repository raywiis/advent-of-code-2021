import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import {
	assertEquals,
	assert,
} from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { wrapIterator } from "https://deno.land/x/iterator_helpers@v0.1.1/mod.ts";

type Range = [start: number, end: number];
type Cube = [x: Range, y: Range, z: Range];
type State = "on" | "off";
type Command = [State, Cube];

async function readInput(fileName: string): Promise<Command[]> {
	const inputFilePath = join(dirname(fromFileUrl(import.meta.url)), fileName);
	const input = await Deno.readTextFile(inputFilePath);
	const data = input.split(os.EOL());

  return data.map(line => parseCommand(line))
}

function parseCommand(s: string): Command {
	const [commandString, boundString] = s.split(" ");

	assert(commandString === "on" || commandString === "off");

	const ranges = boundString
		.split(",")
		.map((str) => str.slice(2))
		.map((c) => c.split(".."))
		.map(([start, end]) => [parseInt(start, 10), parseInt(end, 10)]);

	assert(ranges.length === 3);

	return [commandString, ranges as Cube];
}

function measureSize(c: Cube): number {
	const size = c
		.map(([start, end]) => Math.abs(end - start) + 1)
		.reduce((acc, delta) => acc * delta, 1);
	return size;
}

function getOverlap(c1: Cube, c2: Cube): Cube | null {
	const bounds = c1.map(([aStart, aEnd], idx): [number, number] => {
		const [bStart, bEnd] = c2[idx];
		const oStart = Math.max(aStart, bStart);
		const oEnd = Math.min(aEnd, bEnd);
		return [oStart, oEnd];
	});


	const deltas = bounds.map(([a, b]) => b - a);
  assert(bounds.length === 3);

	if (deltas.some((delta) => delta <= 0)) {
		return null;
	} else {
    return bounds as Cube;
	}
}

function isCube(c: Cube | null): c is Cube {
  return c !== null
}

function getOverlaps(...cubes: (Cube|null)[]): Cube | null {
  assert(cubes.length > 0);
  if (cubes.length === 1) {
    return cubes[1]
  }
  return cubes.reduce((acc: Cube | null, c) =>
		isCube(acc) && isCube(c) ? getOverlap(acc, c) : null
	);
}

assertEquals(
	getOverlaps(
		[
			[-2, 1],
			[-2, 1],
			[-2, 1],
		],
		[
			[-1, 2],
			[-1, 2],
			[-1, 2],
		],
		[
			[0, 3],
			[0, 3],
			[0, 3],
		]
	),
	[
		[0, 1],
		[0, 1],
		[0, 1],
	]
);

/**
 * + & + -> - overlap
 * + & - -> + overlap
 * - & + -> - overlap
 * - & - -> + overlap
 */

/**
 * + & + & + -> - 1 & 2 overlap - 2 & 3 overlap
 */

function countChange([op, area]: Command, previousCommands: Command[]): number {
  const operationArea = measureSize(area);
  let change = op === "on" ? +operationArea : -operationArea;

  for (const [prevOp, prevArea] of previousCommands) {
    const overlap = getOverlap(area, prevArea);
    if (!overlap) {
      continue
    }
    if (op === "on" && prevOp === "on") {
      change -= measureSize(overlap);
    } else if (op === "off" && prevOp === "on") {
    } else {
      throw new Error("Unsupported op match")
    }
  }

  return change
}

// function countLights(input: Command[]) {
//   let totalLights = 0;

//   for (let i = 0; i < input.length; i++) {
//     if (i == 2) {
//       break
//     }

//     const change = countChange(input[i], input.slice(0, i));
//     totalLights += change
//   }

//   return totalLights
// }

// const input = await readInput("22.sample_1.txt");

// console.log(countLights(input))
