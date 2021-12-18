import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { hexToBinary, sumVersions, parsePacket, runPacket } from "./16.ts";

const inputFilePath = join(
	dirname(fromFileUrl(import.meta.url)),
	"16.input.txt"
);

const sample1 = hexToBinary("8A004A801A8002F478");
const sample2 = hexToBinary("620080001611562C8802118E34");
const sample3 = hexToBinary("C0015000016115A2E0802F182340");
const sample4 = hexToBinary("A0016C880162017C3686B18A3D4780");
const input = hexToBinary(await Deno.readTextFile(inputFilePath));

Deno.test({
	name: "day 16 part 1 examples",
	fn: () => {
		const p = parsePacket(hexToBinary("38006F45291200"));
		assertEquals(p?.subPackets?.at(1)?.data, 20);
	},
});

Deno.test("day 16 part 1 sample 1", () => {
	assertEquals(sumVersions(parsePacket(sample1)), 16);
});

Deno.test("day 16 part 1 sample 2", () => {
	assertEquals(sumVersions(parsePacket(sample2)), 12);
});

Deno.test("day 16 part 1 sample 3", () => {
	assertEquals(sumVersions(parsePacket(sample3)), 23);
});

Deno.test("day 16 part 1 sample 4", () => {
	assertEquals(sumVersions(parsePacket(sample4)), 31);
});

Deno.test("day 16 part 1 input", () => {
	assertEquals(sumVersions(parsePacket(input)), 934);
});

Deno.test("day 16 part 2 samples", () => {
	const run = (p: string) => runPacket(parsePacket(hexToBinary(p)));

	assertEquals(run("C200B40A82"), 3);
	assertEquals(run("04005AC33890"), 54);
	assertEquals(run("880086C3E88112"), 7);
	assertEquals(run("CE00C43D881120"), 9);
	assertEquals(run("D8005AC2A8F0"), 1);
	assertEquals(run("F600BC2D8F"), 0);
	assertEquals(run("9C005AC2F8F0"), 0);
	assertEquals(run("9C0141080250320F1802104A08"), 1);
});

Deno.test("day 16 part 2 input", () => {
	assertEquals(runPacket(parsePacket(input)), 912901337844);
});
