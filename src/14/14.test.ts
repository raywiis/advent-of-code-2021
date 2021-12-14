import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { getAnswer } from "./14.ts";
import { wrapIterator } from "https://deno.land/x/iterator_helpers@v0.1.1/mod.ts";

async function readInput(
	fileName: string
): Promise<[string, Map<string, string>]> {
	const inputFilePath = join(dirname(fromFileUrl(import.meta.url)), fileName);
	const input = await Deno.readTextFile(inputFilePath);

	const [template, rules] = input.split(os.EOL() + os.EOL());

	const ruleMap = wrapIterator(rules.split(os.EOL()).values())
		.map((ruleString) => ruleString.split(" -> "))
		.reduce((map, [left, right]) => {
			map.set(left, right);
			return map;
		}, new Map());
	return [template, ruleMap];
}

const [sample1Template, sample1Rules] = await readInput("14.sample.txt");
const [inputTemplate, inputRules] = await readInput("14.input.txt");

Deno.test({
	name: "day 14 part 1 sample 1",
	fn: () => {
		const answer = getAnswer(sample1Template, sample1Rules, 10);
		assertEquals(answer, 1588);
	},
});

Deno.test("day 14 part 1 input", () => {
	const answer = getAnswer(inputTemplate, inputRules, 10);
	assertEquals(answer, 2874);
});

Deno.test("day 14 part 2 sample 1", () => {
	const answer = getAnswer(sample1Template, sample1Rules, 40);
	assertEquals(answer, 2188189693529);
});

Deno.test("day 14 part 2 input", () => {
	const answer = getAnswer(inputTemplate, inputRules, 40);
	assertEquals(answer, 5208377027195);
});
