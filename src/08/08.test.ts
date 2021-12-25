import { assertEquals } from "../deps.ts";
import { part1, part2 } from "./08.ts";

Deno.test("linear cost", () => {
	assertEquals(part1, 421);
});

Deno.test("after 256 days", () => {
	assertEquals(part2, 986163);
});
