import { fromFileUrl, dirname, join, assertEquals, os } from "../deps.ts";
import { findPaths, findPathsMultivisit, Cave } from "./12.ts";

async function readInput(fileName: string): Promise<Cave> {
	const inputFilePath = join(dirname(fromFileUrl(import.meta.url)), fileName);
	const input = await Deno.readTextFile(inputFilePath);
	const data = input.split(os.EOL());
	return data.map((row) => row.split("-")) as Cave;
}

const cases = (
	[
		["12.sample_1.txt", 10, 36],
		["12.sample_2.txt", 19, 103],
		["12.sample_3.txt", 226, 3509],
		["12.input.txt", 4549, 120535],
	] as [string, number, number][]
).map(async ([fileName, part1Expectation, part2Expectation]) => {
	const data = await readInput(fileName);

	const [day, sampleName] = fileName.split(".");

	Deno.test(`day ${day} ${sampleName} part 1`, () => {
		const paths = findPaths(data);
		assertEquals(paths.length, part1Expectation);
	});

	Deno.test(`day ${day} ${sampleName} part 2`, () => {
		const paths = findPathsMultivisit(data);
		assertEquals(paths.size, part2Expectation);
	});
});

await Promise.all(cases);
