import { assertEquals } from "../deps.ts";
import { singlePeaks, windowedPeaks } from "./01.ts";

Deno.test("single peaks", () => {
	assertEquals(singlePeaks, 1548);
});

Deno.test("window peaks", () => {
	assertEquals(windowedPeaks, 1589);
});
