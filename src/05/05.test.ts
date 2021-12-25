import { assertEquals } from "../deps.ts";
import { horizontalOverlaps, wholeOverlaps } from "./05.ts";

Deno.test("horizontal lines only", () => {
	assertEquals(horizontalOverlaps, 5442);
});

Deno.test("all lines", () => {
	assertEquals(wholeOverlaps, 19571);
});
