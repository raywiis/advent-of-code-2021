import { assertEquals } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { lifeSupportRating, powerRate } from "./03.ts";

Deno.test("single peaks", () => {
	assertEquals(powerRate, 1307354);
});

Deno.test("window peaks", () => {
	assertEquals(lifeSupportRating, 482500);
});
