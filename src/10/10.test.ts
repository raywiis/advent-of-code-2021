import { assertEquals } from "../deps.ts";
import { compScore, corruptionSum } from "./10.ts";

Deno.test("corruption cost", () => {
	assertEquals(corruptionSum, 392421);
});

Deno.test("after 256 days", () => {
	assertEquals(compScore, 2769449099);
});
