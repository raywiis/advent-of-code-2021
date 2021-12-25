import { assertEquals } from "../deps.ts";
import { lifeSupportRating, powerRate } from "./03.ts";

Deno.test("single peaks", () => {
	assertEquals(powerRate, 1307354);
});

Deno.test("window peaks", () => {
	assertEquals(lifeSupportRating, 482500);
});
