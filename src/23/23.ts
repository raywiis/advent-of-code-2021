import {
	assertEquals,
	assert,
} from "https://deno.land/std@0.116.0/testing/asserts.ts";

type Shell = "A" | "B" | "C" | "D";
type Silo = { designation: Shell; place1: Shell | null; place2: Shell | null };

type Tile = ShellTile | HallwayTile;
type ShellTile = `${Shell}${1 | 2}`;
type HallwayTile = `F${1 | 2}${1 | 2}` | `H${1 | 2 | 3}`;

type State = { [tile in Tile]: Shell | null };

// const initialState: { [key in ShellTile]: Shell } = {
// 	A1: "B",
// 	A2: "A",
// 	B1: "C",
// 	B2: "D",
// 	C1: "B",
// 	C2: "C",
// 	D1: "D",
// 	D2: "A",
// };

const initialState: { [key in ShellTile]: Shell } = {
	A1: "C",
	A2: "B",
	B1: "A",
	B2: "A",
	C1: "B",
	C2: "D",
	D1: "D",
	D2: "C",
};

const mapState: State = {
	// A1: null,
	// A2: null,
	// B1: null,
	// B2: null,
	// C1: null,
	// C2: null,
	// D1: null,
	// D2: null,

	H1: null,
	H2: null,
	H3: null,
	F11: null,
	F12: null,
	F21: null,
	F22: null,

	...initialState
};

const hallway = new Set<Tile>(["H1", "H2", "H3", "F11", "F12", "F21", "F22"]);

const assignedSilos: { [shell in Shell]: Tile[] } = {
	A: ["A2", "A1"],
	B: ["B2", "B1"],
	C: ["C2", "C1"],
	D: ["D1", "D2"],
};

const moveCost: { [type in Shell]: number } = {
	A: 1,
	B: 10,
	C: 100,
	D: 1000,
};

const isHallwayTile = (tile: Tile): tile is HallwayTile => {
	return tile.startsWith("H") || tile.startsWith("F");
};

const sequence: Tile[] = [
	"F12",
	"F11",
	"A1",
	"A2",
	"H1",
	"B1",
	"B2",
	"H2",
	"C1",
	"C2",
	"H3",
	"D1",
	"D2",
	"F21",
	"F22",
];

const hallwayTiles: HallwayTile[] = sequence.filter((t): t is HallwayTile => isHallwayTile(t));

// A1 -> C2: H1, H2, C2

function isBlocked(from: Tile, to: Tile, state: State): boolean {
	const potentialBlockers: Tile[] = [];

	if (state[to] !== null) {
		return true
	}

	if (!isHallwayTile(from) && from.endsWith("2")) {
		potentialBlockers.push(`${from[0] as Shell}1`);
	}

	if (!isHallwayTile(to) && to.endsWith("2")) {
		potentialBlockers.push(`${to[0] as Shell}1`);
	}

	const fromIdx = sequence.findIndex((t) => t === from);
	const toIdx = sequence.findIndex((t) => t === to);

	const start = Math.min(fromIdx, toIdx) + 1;
	const end = Math.max(fromIdx, toIdx);

	const hallways = sequence.slice(start, end).filter((t) => isHallwayTile(t));
	hallways.forEach((t) => potentialBlockers.push(t));

	return potentialBlockers.some((blocker) => state[blocker]);
}

// isBlocked("F22", "F12", mapState);
// isBlocked("F12", "F22", mapState);
// isBlocked("A2", "D2", mapState);
// isBlocked("H1", "D1", mapState);
// isBlocked("H1", "B1", mapState);

function canGo(
	shellType: Shell,
	position: Tile,
	destination: Tile,
	state: State
): boolean {
	if (position === destination) {
		return false;
	}
	if (state[destination] !== null) {
		return false;
	}
	const shellIsDestType = destination.startsWith(shellType);
	const blocked = isBlocked(position, destination, state)
	// if (isHallwayTile(position) && shellIsDestType) {
	// 	return false;
	// }
	if (blocked) {
		return false;
	}
	if (isHallwayTile(destination)) {
		return true;
	}
	const destDepth = destination[1];
	const destShell = destination[0] as Shell;
	// Can't leave lower part empty
	if (destDepth === '1' && state[`${destShell}2`] === null) {
		return false;
	}
	// if (isHallwayTile(destination)) {
	// 	return true
	// }
	return true;
}

function getPodsToMove(state: State): Tile[] {
	const tilesInMove = Object.entries(state)
		.filter(([tile, pod]) => {
			if (!pod) {
				return false;
			}
			if (isHallwayTile(tile as Tile)) {
				return true;
			}
			const tileShell = tile[0] as Shell;
			const tileDepth = tile[1];
			if (tileDepth === "2") {
				// We're actually set
				if (tileShell === pod) {
					return false;
				}
				// We're actually blocked
				if (state[`${tileShell}1`] !== null) {
					return false;
				}
				// We're in the wrong tile and not blocked
				return true;
			} else { // tileDepth === '1'
				// We're blocking a neighbor
				if (state[`${tileShell}2`] !== tileShell) {
					return true
				}
				// We're actually in the wrong tile ourselves
				if (tileShell !== pod) {
					return true;
				}
				// We're not blocking anyone and we're set
				return false
			}
		})
		.map(([tile]): Tile => {
			return tile as Tile
		})
		return tilesInMove
}


function getPotentialMoves(state: State, from: Tile): Tile[]{
	const shell = state[from]

	assert(shell);

	if (isHallwayTile(from)) {
		const moves: Tile[] = []

		const topStop: Tile = `${shell}1`;
		const bottomStop: Tile = `${shell}2`;
		if (
			state[topStop] === null &&
			state[bottomStop] === shell &&
			!isBlocked(from, topStop, state)
		) {
			moves.push(topStop);
		}
		if (state[bottomStop] === null && !isBlocked(from, bottomStop, state)) {
			moves.push(bottomStop);
		}
		return moves;
	} else {
		const directDeep: Tile[] = ["A2", "B2", "C2", "D2"].filter(
			(t): t is Tile => t[0] === shell && state[`${t[0]}1`] === null && !isBlocked(from, t as Tile, state)
		);
		const directSurface: Tile[] = ["A1", "B1", "C1", "D1"].filter(
			(t): t is Tile => t[0] === shell && state[`${t[0]}2`] === t[0] && !isBlocked(from, t as Tile, state)
		);

		return [
			...directDeep,
			...directSurface,
			...hallwayTiles.filter(t => canGo(shell, from, t, state))
		]
	}
}

const distances = {
	'A': 1,
	'B': 2,
	'C': 3,
	'D': 4
}

function getHallways(from: Tile, to: Tile): HallwayTile[] {
	const fromIdx = sequence.findIndex((t) => t === from);
	const toIdx = sequence.findIndex((t) => t === to);

	const start = Math.min(fromIdx, toIdx) + 1;
	const end = Math.max(fromIdx, toIdx);

	const hallways = sequence.slice(start, end).filter((t): t is HallwayTile => isHallwayTile(t));
	return hallways
}

function getMoveCost(from: Tile, to: Tile, type: Shell): number {
	if (!isHallwayTile(from) && !isHallwayTile(to)) {
		const fromShell = from[0] as Shell;
		const toShell = to[0] as Shell;
		const hTiles = Math.abs(distances[fromShell] - distances[toShell]);

		let depthCosts = 0
		if (from[1] === '2') {
			depthCosts += 1;
		}
		if (to[1] === '2') {
			depthCosts += 2;
		} else {
			depthCosts += 1;
		}

		const moves = depthCosts + hTiles * 2 + 1

		return moves * moveCost[type];
	}

	const hallwayTile = isHallwayTile(from) ? from : to;
	const siloTile = isHallwayTile(from) ? to : from;
	let moves = 0;
	if (hallwayTile === "F12" || hallwayTile === "F22") {
		moves -= 1
	}
	if (siloTile[1] === "1") {
		moves += 1
	} else {
		moves += 2
	}

	const halls = getHallways(hallwayTile, siloTile).length

	moves += (halls * 2) + 1;

	return moves * moveCost[type];
}

function findCheapestSolution(state: State, depth = 0): number {
	const pods = getPodsToMove(state);

	if (pods.length === 0) {
		return 0;
	}

	const podNTo = []
	for (const pod of pods) {
		const potentialMoves = getPotentialMoves(state, pod);

		for (const move of potentialMoves) {
			podNTo.push([pod, move]);
		}
	}

	const costs: number[] = [];
	for (const [from, to] of podNTo) {
		const type = state[from];
		assert(type)
		const moveCost = getMoveCost(from, to, type);
		const furtherCost = findCheapestSolution(
			{
				...state,
				[from]: null,
				[to]: state[from],
			},
			depth + 1
		);

		costs.push(furtherCost + moveCost);

		// console.log(from, to, moveCost)
	}

	return Math.min(...costs)
}

assertEquals(getMoveCost("B1", "C1", "C"), 400);

assert(getPotentialMoves({
  H1: "B",
  H2: "D",
  H3: null,
  F11: null,
  F12: null,
  F21: null,
  F22: null,
  A1: "B",
  A2: "A",
  B1: null,
  B2: null,
  C1: "C",
  C2: "C",
  D1: "D",
  D2: "A",
}, "H1").length > 0)

// console.log(findCheapestSolution(mapState))

const D = moveCost.D;
const A = moveCost.A;
const B = moveCost.B;
const C = moveCost.C

// const startingMovers = new Set<ShellTile>(
// 	["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"]
// )

assertEquals(2 * D + 5 * A + 5 * A + 5 * B + 5 * C + 3 * D + 5 * D + 3*C + 6 * C + 5 * B + 6 * A, 11516)

// #############
// #...........#
// ###C#A#B#D###
//   #D#C#B#A#
//   #D#B#A#C#
//   #B#A#D#C#
//   #########


console.log(
)
