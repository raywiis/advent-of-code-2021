import { assertEquals } from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { splitOne, reduce, explodeOne } from "./18.ts";

const explodeExamples = [
	["[[[[[9,8],1],2],3],4]", "[[[[0,9],2],3],4]"],
	["[7,[6,[5,[4,[3,2]]]]]", "[7,[6,[5,[7,0]]]]"],
	["[[6,[5,[4,[3,2]]]],1]", "[[6,[5,[7,0]]],3]"],
	[
		"[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]",
		"[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]",
	],
	["[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]", "[[3,[2,[8,0]]],[9,[5,[7,0]]]]"],
];

explodeExamples.forEach(([inputStr, expectationStr], idx) => {
	Deno.test(`day 18 explode reduction example ${idx + 1}`, () => {
		const number = JSON.parse(inputStr);
		const expect = JSON.parse(expectationStr);
		assertEquals(explodeOne(number), expect);
	});
});

Deno.test("day 18 split reduction", () => {
	const number = JSON.parse("[[[[0,7],4],[15,[0,13]]],[1,1]]");
	const expect = JSON.parse("[[[[0,7],4],[[7,8],[0,13]]],[1,1]]");
	assertEquals(splitOne(number), expect);
});

Deno.test("day 18 reduce", () => {
	const number = JSON.parse("[[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]");
	const expect = JSON.parse("[[[[0,7],4],[[7,8],[6,0]]],[8,1]]");
	assertEquals(reduce(number), expect);
});
