// const [p1PosInit, p2PosInit] = [4, 8];
const [p1PosInit, p2PosInit] = [6, 9];
let [p1Pos, p2Pos] = [p1PosInit, p2PosInit];

let [p1Points, p2Points] = [0, 0];

const getDeterministicDie = () => {
	let lastRoll = 100;
	let times = 0;

	const rollSingle = () => {
		times += 1;
		lastRoll += 1;
		if (lastRoll > 100) {
			lastRoll = 1;
		}
		return lastRoll;
	};

	return () => {
		const roll = rollSingle() + rollSingle() + rollSingle();
		return [roll, times];
	};
};

const roll = getDeterministicDie();

const movePlayer = (currentPos: number, move: number) => {
	const pos = currentPos - 1;
	return ((pos + move) % 10) + 1;
};

while (p1Points < 1000 && p2Points < 1000) {
	const [p1Move, times1] = roll();
	p1Pos = movePlayer(p1Pos, p1Move);

	p1Points += p1Pos;

	if (p1Points >= 1000) {
		console.log("part 1 p1 wins", p2Points, times1, times1 * p2Points);
	}

	const [p2Move, times2] = roll();

	p2Pos = movePlayer(p2Pos, p2Move);
	p2Points += p2Pos;

	if (p2Points >= 1000) {
		console.log("part 2 p2 wins", p1Points, times2, times2 * p1Points);
	}
}

const diracMoves = [1, 2, 3];

const getKey = (p1: number, s1: number, p2: number, s2: number): string =>
	JSON.stringify([p1, s1, p2, s2]);
const fromKey = (key: string): [number, number, number, number] =>
	JSON.parse(key);

const diracMoveNoScore = (moves: Map<string, number>, player: "p1" | "p2") => {
	const newScores = new Map<string, number>();

	if (player === "p1") {
		for (const [key, count] of moves) {
			const [p1, s1, p2, s2] = fromKey(key);
			for (const m of diracMoves) {
				const newPos1 = movePlayer(p1, m);
				const newKey = getKey(newPos1, s1, p2, s2);
				newScores.set(newKey, (newScores.get(newKey) || 0) + count);
			}
		}
		return newScores;
	}

	if (player === "p2") {
		for (const [key, count] of moves) {
			const [p1, s1, p2, s2] = fromKey(key);
			for (const m2 of diracMoves) {
				const newPos2 = movePlayer(p2, m2);

				const newKey = getKey(p1, s1, newPos2, s2);
				newScores.set(newKey, (newScores.get(newKey) || 0) + count);
			}
		}
	}

	return newScores;
};

const diracMove = (moves: Map<string, number>, player: "p1" | "p2") => {
	const newScores = new Map<string, number>();

	const tile1 = diracMoveNoScore(moves, player);
	const tile2 = diracMoveNoScore(tile1, player);
	const tile3 = diracMoveNoScore(tile2, player);

	if (player === "p1") {
		for (const [key, count] of tile3) {
			const [p1, s1, p2, s2] = fromKey(key);
			const ns1 = s1 + p1;
			const nKey = getKey(p1, ns1, p2, s2);
			newScores.set(nKey, (newScores.get(nKey) || 0) + count);
		}
	}
	if (player === "p2") {
		for (const [key, count] of tile3) {
			const [p1, s1, p2, s2] = fromKey(key);
			const ns2 = s2 + p2;
			const nKey = getKey(p1, s1, p2, ns2);
			newScores.set(nKey, (newScores.get(nKey) || 0) + count);
		}
	}

	return newScores;
};

const removeWins = (
	moves: Map<string, number>
): [Map<string, number>, number, number] => {
	const nMap = new Map();
	let winnerCount1 = 0;
	let winnerCount2 = 0;

	for (const [k, count] of moves.entries()) {
		const [, s1, , s2] = fromKey(k);

		if (s1 >= 21) {
			winnerCount1 += count;
		} else if (s2 >= 21) {
			winnerCount2 += count;
		} else {
			nMap.set(k, count);
		}
	}

	return [nMap, winnerCount1, winnerCount2];
};

/**
 * [Pos1 , Score1 , Pos2 , Score2] -> Universe count
 */
let scores = new Map([[getKey(p1PosInit, 0, p2PosInit, 0), 1]]);

let p1WinnerCount = 0;
let p2WinnerCount = 0;

while (true) {
	scores = diracMove(scores, "p1");
	const [np1Scores, p1Count, p2Count] = removeWins(scores);

	p1WinnerCount += p1Count;
	p2WinnerCount += p2Count;

	if (np1Scores.size === 0) {
		console.log(p1WinnerCount, p2WinnerCount);
		break;
	}

	scores = np1Scores;

	scores = diracMove(scores, "p2");
	const [np2Scores, p1Count2, p2Count2] = removeWins(scores);

	p1WinnerCount += p1Count2;
	p2WinnerCount += p2Count2;

	if (np2Scores.size === 0) {
		console.log(p1WinnerCount, p2WinnerCount);
		break;
	}

	scores = np2Scores;
}
