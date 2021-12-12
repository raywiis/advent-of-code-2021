import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { findPaths, findPathsMultivisit, Cave } from "./12.ts";

async function readInput(fileName: string): Promise<Cave> {
	const inputFilePath = join(dirname(fromFileUrl(import.meta.url)), fileName);
	const input = await Deno.readTextFile(inputFilePath);
	const data = input.split(os.EOL());
	return data.map((row) => row.split("-")) as Cave;
}

const sample1 = await readInput("12.sample_1.txt");
const sample2 = await readInput("12.sample_2.txt");
const sample3 = await readInput("12.sample_3.txt");
const input = await readInput("12.input.txt");

Deno.test("part 1 sample 1", () => {
	const paths = findPaths(sample1);
	assertEquals(paths.length, 10);
});

Deno.test("part 1 sample 2", () => {
	const paths = findPaths(sample2);
	assertEquals(paths.length, 19);
});

Deno.test("part 1 sample 3", () => {
	const paths = findPaths(sample3);
	assertEquals(paths.length, 226);
});

Deno.test("part 1 input", () => {
	const paths = findPaths(input);
	assertEquals(paths.length, 4549);
});

Deno.test("part 2 sample 1", () => {
	const paths = findPathsMultivisit(sample1);
	assertEquals(paths.size, 36);
});

Deno.test("part 2 sample 2", () => {
	const paths = findPathsMultivisit(sample2);
	assertEquals(paths.size, 103);
});

Deno.test("part 2 sample 3", () => {
	const paths = findPathsMultivisit(sample3);
	assertEquals(paths.size, 3509);
});

Deno.test("part 2 input", () => {
	const paths = findPathsMultivisit(input);
	assertEquals(paths.size, 120535);
});
