import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { findPathCost, toKey } from "./15.ts";

async function readInput(fileName: string) {
	const inputFilePath = join(dirname(fromFileUrl(import.meta.url)), fileName);
	const input = await Deno.readTextFile(inputFilePath);
	const data = input.split(os.EOL());
	const map = new Map();

	data.forEach(
		(row, rowIdx) => [...row].forEach((cell, colIdx) => {
			map.set(toKey([rowIdx, colIdx]), parseInt(cell));
		})
	)

	return map;
}


const sample1 = await readInput("15.sample.txt");
const input = await readInput("15.input.txt");

Deno.test("day 15 part 1 sample 1", () => {
	assertEquals(findPathCost(sample1), 40);
})

Deno.test("day 15 part 1 input", () => {
	assertEquals(findPathCost(input), 462);
})

Deno.test("day 15 part 2 sample 1", () => {
	assertEquals(findPathCost(sample1, 5), 315);
})

Deno.test("day 15 part 2 input", () => {
	assertEquals(findPathCost(input, 5), 2846);
})
