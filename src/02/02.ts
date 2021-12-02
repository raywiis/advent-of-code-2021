import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";

type Position = typeof initialPosition;
const initialPosition = {
	horizontal: 0,
	depth: 0,
};

const commands: {
	[command: string]: (pos: Position, param: number) => Position;
} = {
	forward: (pos, move) => ({ ...pos, horizontal: pos.horizontal + move }),
	up: (pos, rise) => ({ ...pos, depth: pos.depth - rise }),
	down: (pos, dive) => ({ ...pos, depth: pos.depth + dive }),
};

const __dirname = dirname(fromFileUrl(import.meta.url));
const input = await Deno.readTextFile(join(__dirname, "02.input.txt"));
const directions = input
	.split("\n")
	.map((c) => c.trim().split(" "))
	.map(
		([cmd, num]) =>
			[cmd, parseInt(num)] as [command: keyof typeof commands, param: number]
	);

const finalPosition = directions.reduce(
	(position, [command, param]) => commands[command](position, param),
	initialPosition
);

export const part1 = finalPosition.depth * finalPosition.horizontal
console.log(part1);

const aimCommands: {
	[command: string]: (pos: AimPosition, param: number) => AimPosition;
} = {
	down: (pos, move) => ({ ...pos, aim: pos.aim + move }),
	up: (pos, move) => ({ ...pos, aim: pos.aim - move }),
	forward: (pos, move) => ({
		...pos,
		horizontal: pos.horizontal + move,
		depth: pos.depth + pos.aim * move,
	}),
};

type AimPosition = typeof initialAimPosition;
const initialAimPosition = {
	horizontal: 0,
	aim: 0,
	depth: 0,
};

const finalAimPosition = directions.reduce(
	(pos, [command, move]) => aimCommands[command](pos, move),
	initialAimPosition
);

export const part2 = finalAimPosition.depth * finalAimPosition.horizontal;

console.log(part2);
