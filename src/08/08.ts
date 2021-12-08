import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import { collect, iterMap, setRemove, bothHave } from "../utils.ts";

const inputFilePath = join(
	dirname(fromFileUrl(import.meta.url)),
	"08.input.txt"
);
const input = await Deno.readTextFile(inputFilePath);
const data = input
	.split(os.EOL())
	.map((line) => line.split("|"))
	.map(([left, right]) => [left.trim(), right.trim()])
	.map(([left, right]) => ({
		left: left.split(" "),
		right: right.split(" "),
	}));

type Segment = "a" | "b" | "c" | "e" | "d" | "e" | "f" | "g";
type SegmentSet = Map<number, Set<Segment>>;

const intoSets = ([key, vals]: [number, Segment[]]): [number, Set<Segment>] => [
	key,
	new Set(vals),
];
const segmentLists: [val: number, segments: Segment[]][] = [
	[1, ["c", "f"]],
	[7, ["a", "c", "f"]],
	[4, ["b", "c", "d", "f"]],
	[2, ["a", "c", "d", "e", "g"]],
	[3, ["a", "c", "d", "f", "g"]],
	[5, ["a", "b", "d", "f", "g"]],
	[0, ["a", "b", "c", "e", "f", "g"]],
	[6, ["a", "b", "d", "e", "f", "g"]],
	[9, ["a", "b", "c", "d", "f", "g"]],
	[8, ["a", "b", "c", "d", "e", "f", "g"]],
];

const findOneSegment = (
	segSets: Set<Segment>[],
	criteria: (segment: Set<Segment>) => boolean
): Set<Segment> => {
	const alts = segSets.filter((a) => criteria(a));
	if (alts.length !== 1) {
		throw new Error("More than one matching criteria");
	}
	return alts[0];
};

const getMapping = (segmentLine: string[]) => {
	const links = new Map<Segment, Segment>();
	const segSets = segmentLine.map(a => new Set(a)) as Set<Segment>[];

	const one = findOneSegment(segSets, (seg) => seg.size === 2);
	const seven = findOneSegment(segSets, (seg) => seg.size === 3);
	const four = findOneSegment(segSets, (seg) => seg.size === 4);
	const eight = findOneSegment(segSets, (seg) => seg.size === 7);

	const three = findOneSegment(
		segSets,
		(seg) => seg.size === 5 && bothHave(one, seg).size === 2
	);

	const nine = findOneSegment(
		segSets,
		(seg) => seg.size === 6 && bothHave(seg, three).size === 5
	);

	const five = findOneSegment(
		segSets,
		(seg) =>
			seg.size === 5 &&
			bothHave(nine, seg).size === 5 &&
			bothHave(seg, one).size === 1
	);

	links.set("a", setRemove(seven, one).values().next().value);
	links.set("b", setRemove(nine, three).values().next().value);
	links.set("c", setRemove(nine, five).values().next().value);
	const aAndG = setRemove(three, four);
	aAndG.delete(links.get("a") as Segment);
	links.set("g", aAndG.values().next().value);

	const six = findOneSegment(
		segSets,
		(seg) => seg.size === 6 && !seg.has(links.get("c") as Segment)
	);

	const zero = findOneSegment(
		segSets,
		(seg) =>
			seg.size === 6 &&
			bothHave(seg, six).size !== 6 &&
			bothHave(seg, nine).size !== 6
	);
	const two = findOneSegment(
		segSets,
		(seg) =>
			seg.size === 5 &&
			bothHave(seg, five).size !== 5 &&
			bothHave(seg, three).size !== 5
	);


	links.set("e", setRemove(six, nine).values().next().value);
	links.set("d", setRemove(eight, zero).values().next().value);
	links.set("f", setRemove(three, two).values().next().value);

	return new Map(collect(iterMap(links.entries(), ([a, b]) => [b, a])))
};

const segmentSets = segmentLists.map(intoSets);

const decode = (mapping: Map<Segment, Segment>, segmentList: Segment[]): number => {
	const segments = new Set(segmentList.map((s) => mapping.get(s)))
	const res = segmentSets.find(
		([, reference]) => {
			const overlap = bothHave(reference, segments)
			return overlap.size === reference.size && overlap.size === segments.size
		}
	);
	if (!res) {
		throw new Error('Unable to decode');
	}
	return res[0]
}

let occurences = 0;
let sum = 0;
for (const { left, right } of data) {
	const mappings = getMapping(left);
	const nums = right.map(segs => decode(mappings, [...segs] as Segment[]))

	for (const num of nums) {
		if ([1, 4, 7, 8].includes(num)) {
			occurences += 1;
		}
	}

	sum += parseInt(nums.join(''))
}

export const part1 = occurences;
export const part2 = sum;
