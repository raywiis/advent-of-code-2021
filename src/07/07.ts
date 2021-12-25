import { fromFileUrl, dirname, join } from "../deps.ts";

const inputFilePath = join(
	dirname(fromFileUrl(import.meta.url)),
	"07.input.txt"
);
const input = await Deno.readTextFile(inputFilePath);
const positions = input.split(",").map((a) => parseInt(a, 10));

const max = Math.max(...positions);

type CostFunction = (pos: number, target: number) => number;

const sumCosts = (
	positions: number[],
	target: number,
	costFn: CostFunction
): number => {
	return positions.reduce((acc, position) => acc + costFn(position, target), 0);
};

const linearCost: CostFunction = (pos, target) => Math.abs(target - pos);
const arithmeticCost: CostFunction = (pos, target) => {
	const distance = Math.abs(target - pos);
	const cost = (distance * (1 + distance)) / 2;
	return cost;
};

const minimizeCosts = (positions: number[], fn: CostFunction): number => {
	const tries = new Array(max).fill(0);
	const costs = tries.map((_, idx) => sumCosts(positions, idx, fn));
	return Math.min(...costs);
};

export const minLinearCosts = minimizeCosts(positions, linearCost);
export const minArithmeticCosts = minimizeCosts(positions, arithmeticCost);
console.log(minLinearCosts);
console.log(minArithmeticCosts);
