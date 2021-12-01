import { assertEquals } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { singlePeaks, windowedPeaks } from "./01.ts";

Deno.test("single peaks", () => {
	assertEquals(singlePeaks, 1548);
});

Deno.test("window peaks", () => {
	assertEquals(windowedPeaks, 1589);
});
