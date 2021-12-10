import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import { wrapIterator } from "https://deno.land/x/iterator_helpers@v0.1.1/mod.ts";

const inputFilePath = join(
	dirname(fromFileUrl(import.meta.url)),
	"10.input.txt"
);
const input = await Deno.readTextFile(inputFilePath);
const data = input.split(os.EOL());

const closers = new Map([
	["(", ")"],
	["<", ">"],
	["{", "}"],
	["[", "]"],
]);

const corruptionScores = new Map([
	[")", 3],
	["]", 57],
	["}", 1197],
	[">", 25137],
]);

const completionScores = new Map([
	["(", 1],
	["[", 2],
	["{", 3],
	["<", 4],
]);

const evaluateLine = (line: string) => {
	let corrupted = false;
	let corruptionScore = 0;

	const stack: string[] = [];
	for (const char of line) {
		if (closers.has(char)) {
			stack.push(char);
		} else {
			const lastOpener = stack.pop();
			if (!lastOpener) {
				throw new Error("Stack empty");
			}
			if (closers.get(lastOpener) !== char) {
				corruptionScore = corruptionScores.get(char) as number;
				corrupted = true;
				break;
			}
		}
	}

	const completionScore = stack.reduceRight(
		(acc, char) => acc * 5 + (completionScores.get(char) as number),
		0
	);

	return { corrupted, corruptionScore, completionScore };
};

const evals = data.map((row) => evaluateLine(row));
export const corruptionSum = evals.reduce(
	(acc, e) => e.corruptionScore + acc,
	0
);

const compScores = wrapIterator(evals.values())
	.filter((e) => !e.corrupted)
	.map((e) => e.completionScore)
	.toArray()
	.sort((a, b) => b - a);
export const compScore = compScores[Math.floor(compScores.length / 2)];
