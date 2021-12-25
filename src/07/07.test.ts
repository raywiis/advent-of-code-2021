import { assertEquals } from "../deps.ts";
import { minArithmeticCosts, minLinearCosts } from "./07.ts";

Deno.test("linear cost", () => {
	assertEquals(minLinearCosts, 345197);
});

Deno.test("after 256 days", () => {
	assertEquals(minArithmeticCosts, 96361606);
});
