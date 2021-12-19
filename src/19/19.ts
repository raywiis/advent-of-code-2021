import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import {
	assertEquals,
	assert,
} from "https://deno.land/std@0.116.0/testing/asserts.ts";
import memoizy from "https://deno.land/x/memoizy@1.0.0/mod.ts";
import { bothHave, DefaultMap } from "../utils.ts";

type Pole = "+" | "-";
type Component = "x" | "y" | "z";
type Direction = `${Pole}${Component}`;
type Point = [number, number, number];
type ScannerScan = {
	scannerNo: number;
	points: Point[];
};

type Rotation = [up: Direction, facing: Direction];

const rotations: Rotation[] = [
	["+x", "+y"],
	["+x", "-y"],
	["+x", "+z"],
	["+x", "-z"],

	["-x", "+y"],
	["-x", "-y"],
	["-x", "+z"],
	["-x", "-z"],

	["+y", "+x"],
	["+y", "-x"],
	["+y", "+z"],
	["+y", "-z"],

	["-y", "+x"],
	["-y", "-x"],
	["-y", "+z"],
	["-y", "-z"],

	["+z", "+x"],
	["+z", "-x"],
	["+z", "+y"],
	["+z", "-y"],

	["-z", "+x"],
	["-z", "-x"],
	["-z", "+y"],
	["-z", "-y"],
];

type TransformMap = {
	[up in Direction]: {
		[facing in Direction]: (p: Point) => Point;
	};
};

const transforms: TransformMap = {
	"+x": {
		"+x": () => {
			assert(false);
		},
		"-x": () => {
			assert(false);
		},
		"+y": ([x, y, z]) => [+z, +x, +y],
		"-y": ([x, y, z]) => [+z, -x, -y],
		"+z": ([x, y, z]) => [+z, -y, +x],
		"-z": ([x, y, z]) => [+z, +y, -x],
	},
	"-x": {
		"+x": () => {
			assert(false);
		},
		"-x": () => {
			assert(false);
		},
		"+y": ([x, y, z]) => [-z, +x, -y],
		"-y": ([x, y, z]) => [-z, -x, +y],
		"+z": ([x, y, z]) => [-z, +y, +x],
		"-z": ([x, y, z]) => [-z, -y, -x],
	},
	"+y": {
		"+x": ([x, y, z]) => [+x, +z, -y],
		"-x": ([x, y, z]) => [-x, +z, +y],
		"+y": (_) => {
			assert(false);
		},
		"-y": (_) => {
			assert(false);
		},
		"+z": ([x, y, z]) => [+y, +z, +x],
		"-z": ([x, y, z]) => [-y, +z, -x],
	},
	"-y": {
		"+x": ([x, y, z]) => [+x, -z, +y],
		"-x": ([x, y, z]) => [-x, -z, -y],
		"+y": (_) => {
			assert(false);
		},
		"-y": (_) => {
			assert(false);
		},
		"+z": ([x, y, z]) => [-y, -z, +x],
		"-z": ([x, y, z]) => [+y, -z, -x],
	},
	"+z": {
		"+x": ([x, y, z]) => [+x, +y, +z],
		"-x": ([x, y, z]) => [-x, -y, +z],
		"+y": ([x, y, z]) => [+y, -x, +z],
		"-y": ([x, y, z]) => [-y, +x, +z],
		"+z": (_) => {
			assert(false);
		},
		"-z": (_) => {
			assert(false);
		},
	},
	"-z": {
		"+x": ([x, y, z]) => [+x, -y, -z],
		"-x": ([x, y, z]) => [-x, +y, -z],
		"+y": ([x, y, z]) => [+y, +x, -z],
		"-y": ([x, y, z]) => [-y, -x, -z],
		"+z": (_) => {
			assert(false);
		},
		"-z": (_) => {
			assert(false);
		},
	},
};

function rotateTo([up, facing]: Rotation, point: Point): Point {
	return transforms[up][facing](point);
}

assertEquals(rotateTo(["+z", "-x"], [1, -1, 1]), [-1, 1, 1]);
assertEquals(rotateTo(["+y", "+x"], [1, 1, 1]), [1, 1, -1]);

async function readInput(fileName: string): Promise<ScannerScan[]> {
	const inputFilePath = join(dirname(fromFileUrl(import.meta.url)), fileName);
	const input = await Deno.readTextFile(inputFilePath);
	const scanners = input
		.split(os.EOL() + os.EOL())
		.map((row) => row.split(os.EOL()));

	const scans = scanners.map((s) => {
		const scannerLine = s.shift();
		const noString = scannerLine?.replaceAll("---", "").trim().slice(7);
		assert(noString);
		const scannerNo = parseInt(noString, 10);

		const points = s.map((coordString): Point => {
			const coords = coordString.split(",").map((coord) => parseInt(coord, 10));
			assert(coords.length === 3);
			return coords as Point;
		});
		return {
			scannerNo,
			points,
		};
	});
	return scans;
}

function pointRelativeTo([x, y, z]: Point, [rx, ry, rz]: Point): Point {
	return [x - rx, y - ry, z - rz];
}

function pointsRelativeTo(points: Point[], rel: Point): Point[] {
	return points.map((point) => pointRelativeTo(point, rel));
}

const toKey = (p: Point) => JSON.stringify(p);

assertEquals(
	pointsRelativeTo(
		[
			[1, 1, 1],
			[-2, -2, -2],
		],
		[1, 1, 1]
	),
	[
		[0, 0, 0],
		[-3, -3, -3],
	]
);

const input = await readInput("19.input.txt");
const getRotatedScanPoints = memoizy(
	(scan: ScannerScan, rotation: Rotation) => {
		return scan.points.map((p) => rotateTo(rotation, p))
	},
	{
		cacheKey: (scan: ScannerScan, rotation: Rotation) =>
			JSON.stringify([scan.scannerNo, rotation]),
	}
);

const getPointsRelativeTo = memoizy(
	(scan: ScannerScan, reference: Point) => {
		const relativePoints = pointsRelativeTo(scan.points, reference);
		const set = new Set(relativePoints.map((p) => toKey(p)));
		return set
	},
	{
		cacheKey: (scan: ScannerScan, relative: Point) =>
			JSON.stringify([scan.scannerNo, relative]),
	}
);

const getRotatedRelativePoints = memoizy(
	(scan: ScannerScan, rotation: Rotation, relative: Point) => {
		const rotatedCloud = getRotatedScanPoints(scan, rotation);
		const normalizedBCloud = pointsRelativeTo(rotatedCloud, relative);
		const set = new Set(normalizedBCloud.map((p) => toKey(p)));
		return set;
	},
	{
		cacheKey: (scan: ScannerScan, rotation: Rotation, relative: Point) =>
			JSON.stringify([scan.scannerNo, rotation, relative]),
	}
);

function getPossibleRotation(
	cloudA: ScannerScan,
	cloudB: ScannerScan,
): [Rotation, Point, Point] | undefined {
	for (const refA of cloudA.points) {
		const cloudASet = getPointsRelativeTo(cloudA, refA);

		for (const rotation of rotations) {
			const rotatedCloud = getRotatedScanPoints(cloudB, rotation);
			for (const refB of rotatedCloud) {
				const cloudBSet = getRotatedRelativePoints(cloudB, rotation, refB);
				const matches = bothHave(cloudASet, cloudBSet);
				if (matches.size >= 12) {
					return [rotation, refA, refB];
				}
			}
		}
	}
}

function findCommons(
	cloudA: ScannerScan,
	cloudB: ScannerScan
): {
	commonPoints: [Point, Point][];
	cloudBRotation: Rotation;
	cloudBOffset: Point;
	refA: Point;
	refB: Point;
} | null {
	const matchParams = getPossibleRotation(cloudA, cloudB);
	if (!matchParams) {
		return null;
	}

	const [rotation, refA, refB] = matchParams;

	const rotatedCloudB = cloudB.points.map((p) => rotateTo(rotation, p));
	const mappedA = pointsRelativeTo(cloudA.points, refA);
	const mappedB = pointsRelativeTo(rotatedCloudB, refB);

	const pairs = mappedA
		.map((relA, idx) => {
			const bMatchIdx = mappedB.findIndex((b) => toKey(b) === toKey(relA));
			if (bMatchIdx === -1) {
				return null;
			}
			const originalA = cloudA.points[idx];
			const originalB = cloudB.points[bMatchIdx];
			return [originalA, originalB];
		})
		.filter((p): p is [Point, Point] => p !== null);

	const [posARaw, posBRaw] = pairs[0];
	const posBRotated = rotateTo(rotation, posBRaw);

	const cloudBOffset: Point = posARaw.map((p, idx) => p - posBRotated[idx]) as Point;

	return {
		commonPoints: pairs,
		refA,
		refB,
		cloudBRotation: rotation,
		cloudBOffset,
	};
}

const knownMismatches = new DefaultMap<number, Set<number>>(() => new Set());

function findOverlappingScans(unknownScans: ScannerScan[], knownScans: ScannerScan[]) {
	for (const unknown of unknownScans) {
		const mismatchSet = knownMismatches.get(unknown.scannerNo);
		assert(mismatchSet);
		for (const ref of knownScans) {
			if (mismatchSet.has(ref.scannerNo)) {
				continue;
			}
			const matches = findCommons(ref, unknown)

			if (!matches) {
				mismatchSet.add(ref.scannerNo)
				continue
			}
			return {
				known: ref,
				found: unknown,
				matches
			}
		}
	}
}

function addPoints([a, b, c]: Point, [x, y, z]: Point): Point {
	return [a + x, b + y, c + z];
}

const queue = [...input.slice(1)];
const addedScans = [input[0]];
const points = new Set(input[0].points.map((p) => toKey(p)));
const rotationMap = new Map<number, Rotation[]>([
	[input[0].scannerNo, [["+z", "+x"]]],
]);
const offsets = new Map<number, Point>([
	[input[0].scannerNo, [0, 0, 0]]
]);

while (queue.length > 0) {
	console.log(`${addedScans.length}/${queue.length}`);
	const res = findOverlappingScans(queue, addedScans);
	assert(res);
	const {known, found, matches} = res;

	const knownOffset = offsets.get(known.scannerNo);
	const foundOffset = matches.cloudBOffset;
	assert(knownOffset);
	const totalOffset = foundOffset;
	offsets.set(found.scannerNo, totalOffset);

	const knownRotations = rotationMap.get(known.scannerNo);
	assert(knownRotations);
	const foundRotations = [...knownRotations, matches.cloudBRotation];
	rotationMap.set(found.scannerNo, foundRotations)

	const foundPointsGlobal = found.points
		.map((p) => {
			return rotateTo(matches.cloudBRotation, p);
		})
		.map((p) => addPoints(p, totalOffset));

	for (const foundPoint of foundPointsGlobal) {
		points.add(toKey(foundPoint))
	}

	const foundIdx = queue.findIndex((s) => s.scannerNo === found.scannerNo)
	queue.splice(foundIdx, 1);
	addedScans.push({
		scannerNo: found.scannerNo,
		points: foundPointsGlobal
	})
}


function getDistance([a, b, c]: Point, [x, y, z]: Point): number {
	return a - x + (b - y) + (c - z);
}

const distances = []
for (const offsetA of offsets.values()) {
	for (const offsetB of offsets.values()) {
		distances.push(getDistance(offsetA, offsetB));
	}
}

/** My input answers */
assertEquals(points.size, 438);
assertEquals(Math.max(...distances), 11985);

console.log(points.size)
console.log(Math.max(...distances))
