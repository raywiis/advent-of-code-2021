import { assertEquals } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { part1, part2 } from "./02.ts";

Deno.test("single peaks", () => {
	assertEquals(part1, 1693300);
});

Deno.test("window peaks", () => {
	assertEquals(part2, 1857958050);
});
