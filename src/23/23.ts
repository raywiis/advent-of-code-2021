import { assert } from "../deps.ts";

type Shell = "A" | "B" | "C" | "D";
type Silo = Shell[];
type Tile = Silo | Shell | null;

const shellCost: { [key in Shell]: number } = {
	A: 1,
	B: 10,
	C: 100,
	D: 1000,
};

const idxSilo: { [x: number]: Shell } = {
	2: "A",
	4: "B",
	6: "C",
	8: "D",
};

type StateKey = string;

type Hallway = [
	Tile,
	Tile,
	Silo,
	Tile,
	Silo,
	Tile,
	Silo,
	Tile,
	Silo,
	Tile,
	Tile
];
type State = Hallway;

// const siloDepth = 2;

// const initialStacks: { [s in Shell]: Shell[] } = {
// 	A: ["B", "A"],
// 	B: ["C", "D"],
// 	C: ["B", "C"],
// 	D: ["D", "A"],
// };

// const initialStacks: { [s in Shell]: Shell[] } = {
// 	A: ["C", "B"],
// 	B: ["A", "A"],
// 	C: ["B", "D"],
// 	D: ["D", "C"],
// };

const siloDepth = 4;

// const initialStacks: { [s in Shell]: Shell[] } = {
// 	A: ["B", "D","D", "A"],
// 	B: ["C", "C", "B", "D"],
// 	C: ["B", "B", "A", "C"],
// 	D: ["D", "A", "C", "A"],
// };

const initialStacks: { [s in Shell]: Shell[] } = {
	A: ["C", "D", "D", "B"],
	B: ["A", "C", "B", "A"],
	C: ["B", "B", "A", "D"],
	D: ["D", "A", "C", "C"],
};

const initialState: State = [
	null,
	null,
	initialStacks.A,
	null,
	initialStacks.B,
	null,
	initialStacks.C,
	null,
	initialStacks.D,
	null,
	null,
];

const stateToKey = (s: State): StateKey => JSON.stringify(s);
const stateFromKey = (s: StateKey): State => JSON.parse(s);

const tileIsSilo = (t: Tile): t is Silo => Array.isArray(t);
const tileIsHallway = (t: Tile): t is Shell | null => !tileIsSilo(t);

function getCost(tileMoves: number, type: Shell): number {
	return tileMoves * shellCost[type];
}

function* getMovedStatesFrom(
	state: State,
	initialPosition: number
): Generator<[move: number, cost: number]> {
	const initialTile = state[initialPosition];
	const startInHallway = tileIsHallway(initialTile);
	const shellType = startInHallway ? initialTile : initialTile[0];

	if (
		tileIsSilo(initialTile) &&
		initialTile.every((t) => t === idxSilo[initialPosition])
	) {
		return;
	}

	assert(initialTile);
	assert(shellType);

	// Left
	for (let position = initialPosition - 1; position >= 0; position--) {
		const targetTile = state[position];
		const targetIsHallway = tileIsHallway(targetTile);

		if (targetIsHallway) {
			// Hallway must be blocked
			if (targetTile !== null) {
				break;
			}
			// Can't move from hallway to hallway
			if (startInHallway) {
				continue;
			}
			const startingDepth = siloDepth - initialTile.length + 1;
			const moveCost = Math.abs(initialPosition - position);
			const totalCost = startingDepth + moveCost;
			yield [position, getCost(totalCost, shellType)];
			continue;
		}

		const siloType = idxSilo[position];
		assert(siloType);

		if (siloType !== shellType) {
			continue;
		}

		assert(targetTile.length <= siloDepth);

		const siloIsAvailable =
			targetTile.every((pod) => pod === siloType) || targetTile.length === 0;
		if (!siloIsAvailable) {
			continue;
		}

		const exitCost = tileIsSilo(initialTile)
			? siloDepth - initialTile.length + 1
			: 0;
		const entryCost = siloDepth - targetTile.length;
		const moveCost = Math.abs(initialPosition - position);
		const totalCost = exitCost + entryCost + moveCost;

		yield [position, getCost(totalCost, shellType)];
	}

	// Right
	for (
		let position = initialPosition + 1;
		position < state.length;
		position++
	) {
		const targetTile = state[position];
		const targetIsHallway = tileIsHallway(targetTile);

		if (targetIsHallway) {
			// Hallway must be blocked
			if (targetTile !== null) {
				break;
			}
			// Can't move from hallway to hallway
			if (startInHallway) {
				continue;
			}
			const startingDepth = siloDepth - initialTile.length + 1;
			const moveCost = Math.abs(initialPosition - position);
			const totalCost = startingDepth + moveCost;
			yield [position, getCost(totalCost, shellType)];
			continue;
		}

		const siloType = idxSilo[position];
		assert(siloType);

		if (siloType !== shellType) {
			continue;
		}

		assert(targetTile.length <= siloDepth);

		const siloIsAvailable =
			targetTile.every((pod) => pod === siloType) || targetTile.length === 0;
		if (!siloIsAvailable) {
			continue;
		}

		const exitCost = tileIsSilo(initialTile)
			? siloDepth - initialTile.length + 1
			: 0;
		const entryCost = siloDepth - targetTile.length;
		const moveCost = Math.abs(initialPosition - position);
		const totalCost = exitCost + entryCost + moveCost;

		yield [position, getCost(totalCost, shellType)];
	}
	// Right
}

function doMove(state: State, from: number, to: number): State {
	const fromTile = state[from];
	assert(fromTile);

	const shell = tileIsSilo(fromTile) ? fromTile[0] : fromTile;

	const newState: State = [...state];

	if (tileIsSilo(fromTile)) {
		const newSilo = fromTile.slice(1);
		newState[from] = newSilo;
	} else {
		newState[from] = null;
	}

	const toTile = state[to];
	if (tileIsSilo(toTile)) {
		const newSilo = [shell, ...toTile];
		newState[to] = newSilo;
	} else {
		newState[to] = shell;
	}

	return newState;
}

function* getMovedStates(state: State): Generator<[State, number]> {
	for (const [idx, tile] of state.entries()) {
		if (tile === null) {
			continue;
		}
		if (tileIsSilo(tile) && tile.length === 0) {
			continue;
		}
		for (const [move, cost] of getMovedStatesFrom(state, idx)) {
			yield [doMove(state, idx, move), cost];
		}
	}
}

function finalState(state: State): boolean {
	return (
		state[2].length === siloDepth &&
		state[4].length === siloDepth &&
		state[6].length === siloDepth &&
		state[8].length === siloDepth &&
		state[2].every((a) => a === "A") &&
		state[4].every((a) => a === "B") &&
		state[6].every((a) => a === "C") &&
		state[8].every((a) => a === "D")
	);
}

const queue: [StateKey, number][] = [[stateToKey(initialState), 0]];
const visited = new Map<StateKey, number>();

while (queue.length > 0) {
	const node = queue.shift();
	assert(node);
	const [key, prevCost] = node;

	if (visited.has(key)) {
		const cost = visited.get(key);
		assert(cost);
		assert(cost <= prevCost);
		continue;
	}

	visited.set(key, prevCost);

	const state = stateFromKey(key);

	if (finalState(state)) {
		console.log("found", prevCost);
		break;
	}

	for (const [newState, cost] of getMovedStates(state)) {
		const newKey = stateToKey(newState);
		const totalCost = cost + prevCost;

		const queuePriority = queue.findIndex(([_, c]) => c > totalCost);

		queuePriority === -1
			? queue.push([newKey, totalCost])
			: queue.splice(queuePriority, 0, [newKey, totalCost]);
	}
}
