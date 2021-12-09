import { assertEquals } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { part1, part2 } from "./09.ts";

Deno.test("linear cost", () => {
	assertEquals(part1, 539);
});

Deno.test("after 256 days", () => {
	assertEquals(part2, 736920);
});
