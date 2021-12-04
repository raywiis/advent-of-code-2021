import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";

const inputFilePath = join(
	dirname(fromFileUrl(import.meta.url)),
	"04.input.txt"
);
const input = await Deno.readTextFile(inputFilePath);

const data = input.split(os.EOL() + os.EOL());
const [numberData, ...boardData] = data;
const numbers = numberData.split(",").map((s) => parseInt(s, 10));

type Board = {
	rows: number[][];
	columns: number[][];
};

const parseBoard = (i: string): Board => {
	const rowStrings = i.split(os.EOL());
	const rows = rowStrings.map((rowString) =>
		rowString
			.trim()
			.replaceAll("  ", " ")
			.split(" ")
			.map((s) => parseInt(s, 10))
	);
	const columns = rows[0].map((_, idx) => {
		return [
			rows[0][idx],
			rows[1][idx],
			rows[2][idx],
			rows[3][idx],
			rows[4][idx],
		];
	});

	return { rows, columns };
};

const boardWon = (board: Board): boolean =>
	board.rows.some((row) => row.length === 0) ||
	board.columns.some((col) => col.length === 0);

const getBoardScore = (board: Board, number: number) => {
	const sums = board.rows.map((row) => {
		let sum = 0;
		for (const value of row.values()) {
			sum += value;
		}
		return sum;
	});

	const sum = sums.reduce((acc, s) => acc + s);
	return sum * number;
};

const boards = boardData.map((b) => parseBoard(b));

let winners = 0;
const winMap = boards.map((_) => false);
for (const number of numbers) {
	let won = false;
	console.log(number)
	for (const [bIdx, board] of boards.entries()) {
		if (winMap[bIdx]) {
			continue;
		}

		for (const row of board.rows) {
			const idx = row.findIndex((n) => n === number);
			if (idx !== -1) {
				row.splice(idx, 1);
			}
		}

		for (const col of board.columns) {
			const idx = col.findIndex((n) => n === number);
			if (idx !== -1) {
				col.splice(idx, 1);
			}
		}

		if (boardWon(board)) {
			if (!winMap[bIdx]) {
				winMap[bIdx] = true;
				winners += 1;
			}
			if (winners === boards.length) {
				const lastWinIdx = winMap.findIndex((thing) => !thing);
				console.log("final winner", lastWinIdx + 1);
				won = true;
			}

			console.log("score", getBoardScore(board, number));
		}
	}
	if (won) break;
}
