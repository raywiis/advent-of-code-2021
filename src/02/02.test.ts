import { assertEquals } from "../deps.ts";
import { part1, part2 } from "./02.ts";

Deno.test("single peaks", () => {
	assertEquals(part1, 1693300);
});

Deno.test("window peaks", () => {
	assertEquals(part2, 1857958050);
});
