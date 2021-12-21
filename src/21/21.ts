let [p1Pos, p2Pos] = [4, 8];
// let [p1Pos, p2Pos] = [6, 9];

let [p1Points, p2Points] = [0, 0]

const getDeterministicDie = () => {
  let lastRoll = 100;
  let times = 0;

  const rollSingle = () => {
    times += 1
    lastRoll += 1;
    if (lastRoll > 100) {
      lastRoll = 1
    }
    return lastRoll;
  }

  return () => {
		const roll = rollSingle() + rollSingle() + rollSingle();
		return [roll, times];
	};
}

const roll = getDeterministicDie();

const movePlayer = (currentPos: number, move: number) => {
  const pos = currentPos - 1;
  return ((pos + move) % 10) + 1
}

while (p1Points < 1000 && p2Points < 1000) {
	const [p1Move, times1] = roll();
	p1Pos = movePlayer(p1Pos, p1Move);

	p1Points += p1Pos;

	if (p1Points >= 1000) {
		console.log("p1 wins", p2Points, times1, times1 * p2Points);
	}

	const [p2Move, times2] = roll();

  p2Pos = movePlayer(p2Pos, p2Move);
	p2Points += p2Pos;

	if (p2Points >= 1000) {
		console.log("p2 wins", p1Points, times2, times2 * p1Points);
	}
}

const diracMove = (
	moves: Map<number, number>
) => {

};

/**
 * Score -> universe#
 */
let p1Scores = new Map<number, number>([[0, 1]]);
let p1Moves = new Map<number, number>([[p1Pos, 1]]);
let p2Scores = new Map<number, number>([[0, 1]]);
let p2Moves = new Map<number, number>([[p2Pos, 1]]);

while (!p1Scores.has(21) || !p2Scores.has(21)) {
  diracMove(p1Scores, p1Moves);
}
