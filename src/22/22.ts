import {
	fromFileUrl,
	dirname,
	join,
	assertEquals,
	assert,
	os,
} from "../deps.ts";

type Range = [start: number, end: number];
type Cube = [x: Range, y: Range, z: Range];
type State = "on" | "off";
type Command = [State, Cube];
type Operation = ["+" | "-", Cube];

async function readInput(fileName: string): Promise<Command[]> {
	const inputFilePath = join(dirname(fromFileUrl(import.meta.url)), fileName);
	const input = await Deno.readTextFile(inputFilePath);
	const data = input.split(os.EOL());

	return data.map((line) => parseCommand(line));
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

	if (deltas.some((delta) => delta < 0)) {
		return null;
	} else {
		return bounds as Cube;
	}
}

const oppositeOp = (op: "+" | "-") => (op === "+" ? "-" : "+");

function getNewOps(current: Command, previous: Operation[]): Operation[] {
	const [op, area] = current;

	const ops: Operation[] = [];

	if (op === "on") {
		ops.push(["+", area]);
	}

	for (const [prevOp, prevArea] of previous) {
		const newOp = oppositeOp(prevOp);
		const newArea = getOverlap(prevArea, area);

		if (newArea !== null) ops.push([newOp, newArea]);
	}

	return ops;
}

function countOpLights(ops: Operation[]): number {
	return ops.reduce((acc, [s, area]) => {
		if (area === null) {
			return acc;
		}
		const areaSize = measureSize(area);
		return s === "+" ? acc + areaSize : acc - areaSize;
	}, 0);
}

const input = await readInput("22.input.txt");

const p1Overlap: Cube = [
	[-50, 50],
	[-50, 50],
	[-50, 50],
];

assertEquals(
	getOverlap(p1Overlap, [
		[10, 10],
		[10, 10],
		[10, 10],
	]),
	[
		[10, 10],
		[10, 10],
		[10, 10],
	]
);

const p1Input = input;
// .map(([op, area]) => [op, getOverlap(area, p1Overlap)])
// .filter((cmd): cmd is Command => cmd[1] !== null);

let opStack: Operation[] = [];

for (let i = 0; i < p1Input.length; i++) {
	const cmd = p1Input[i];
	const newOpStack = getNewOps(cmd, opStack);
	opStack = opStack.concat(newOpStack);
}

// 132447 too low
// 442626 too low
// 648827 too high

console.log(countOpLights(opStack));
