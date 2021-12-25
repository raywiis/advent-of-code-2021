import { fromFileUrl, dirname, join, os } from "../deps.ts";
import { iterFilter, collect } from "../utils.ts";

const inputFilePath = join(
	dirname(fromFileUrl(import.meta.url)),
	"05.input.txt"
);

const data = await Deno.readTextFile(inputFilePath);

type Point = [x: number, y: number];
type Line = [Point, Point];

const lines = ((): Line[] => {
	const lines = data.split(os.EOL());
	return lines.map((line) => {
		const [left, right] = line.split(" -> ");
		const [x1, y1] = left.split(",");
		const [x2, y2] = right.split(",");

		return [
			[parseInt(x1), parseInt(y1)],
			[parseInt(x2), parseInt(y2)],
		];
	});
})();

const horizontalLines = lines.filter(
	([[x1, y1], [x2, y2]]) => x1 === x2 || y1 === y2
);

function* coordinatesAlongLine(line: Line): Iterable<Point> {
	const [[x1, y1], [x2, y2]] = line;

	const xMin = Math.min(x1, x2);
	const yMin = Math.min(y1, y2);
	const xMax = Math.max(x1, x2);
	const yMax = Math.max(y1, y2);

	const iterationCount = Math.max(yMax - yMin, xMax - xMin);
	for (let i = 0; i < iterationCount + 1; i++) {
		const x = x1 === x2 ? x1 : x1 < x2 ? x1 + i : x1 - i;

		const y = y1 === y2 ? y1 : y1 < y2 ? y1 + i : y1 - i;

		yield [x, y];
	}
}

const pointKey = (point: Point) => JSON.stringify(point);
const countOverlaps = (lines: Line[]): number => {
	const map = new Map();
	for (const line of lines) {
		for (const point of coordinatesAlongLine(line)) {
			const key = pointKey(point);
			map.set(key, 1 + (map.get(key) || 0));
		}
	}
	const horizontalOverlaps = collect(
		iterFilter(map.entries(), ([_, value]) => value > 1)
	);
	return horizontalOverlaps.length;
};

export const horizontalOverlaps = countOverlaps(horizontalLines);

console.log(horizontalOverlaps);

export const wholeOverlaps = countOverlaps(lines);

console.log(wholeOverlaps);
