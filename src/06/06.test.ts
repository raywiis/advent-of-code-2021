import { assertEquals } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { day256Count, day80Count } from "./06.ts";

Deno.test("after 80 days", () => {
	assertEquals(day80Count, 345387);
});

Deno.test("after 256 days", () => {
	assertEquals(day256Count, 1574445493136);
});
