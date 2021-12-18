import {
	assert,
	assertEquals,
} from "https://deno.land/std@0.117.0/testing/asserts.ts";

type Pair = [SnailNumeral, SnailNumeral];
type SnailNumeral = Pair | number;

function isPair(p: SnailNumeral): p is Pair {
	return Array.isArray(p);
}

function isSame(a: SnailNumeral, b: SnailNumeral) {
	return JSON.stringify(a) === JSON.stringify(b);
}

type StackEntry = [SnailNumeral, "left" | "right" | "done"];

function buildNumber(
	stack: StackEntry[],
	{ leftAdapter, rightAdapter } = {
		leftAdapter: (s: SnailNumeral): SnailNumeral => s,
		rightAdapter: (s: SnailNumeral): SnailNumeral => s,
	}
): SnailNumeral {
	const s = [...stack];
	const top = s.pop();
	assert(top);
	const [replacement] = top;
	return s.reduceRight((acc, [numeral, direction]) => {
		assert(direction !== "left");
		assert(isPair(numeral));
		const [l, r] = numeral;
		const newPair: SnailNumeral =
			direction === "right" ? [acc, rightAdapter(r)] : [leftAdapter(l), acc];
		return newPair;
	}, replacement);
}

export function splitOne(number: Pair) {
	const stack: [SnailNumeral, "left" | "right" | "done"][] = [[number, "left"]];

	while (stack.length > 0) {
		const top = stack.pop();
		assert(top);
		const [numeral, direction] = top;

		if (direction === "done") {
			continue;
		}

		if (!isPair(numeral)) {
			if (numeral >= 10) {
				stack.push([[Math.floor(numeral / 2), Math.ceil(numeral / 2)], "done"]);
				break;
			}
			continue;
		}

		stack.push([numeral, direction === "left" ? "right" : "done"]);
		if (direction === "left") {
			stack.push([numeral[0], "left"]);
		} else if (direction === "right") {
			stack.push([numeral[1], "left"]);
		}
	}

	if (stack.length === 0) {
		return number;
	}

	return buildNumber(stack);
}

export function explodeOne(number: Pair) {
	const stack: [SnailNumeral, "left" | "right" | "done"][] = [[number, "left"]];

	while (stack.length > 0 && stack.length !== 5) {
		const val = stack.pop();
		assert(val);
		const [numeral, direction] = val;

		if (!isPair(numeral) || direction === "done") {
			continue;
		}

		stack.push([numeral, direction === "left" ? "right" : "done"]);
		if (direction === "left" && isPair(numeral[0])) {
			stack.push([numeral[0], "left"]);
		} else if (direction === "right" && isPair(numeral[1])) {
			stack.push([numeral[1], "left"]);
		}
	}

	if (stack.length === 5) {
		const top = stack.pop();
		assert(top);
		assert(isPair(top[0]));
		let [leftAdd, rightAdd] = top[0] as [number, number];

		stack.push([0, "done"]);
		return buildNumber(stack, {
			rightAdapter(right) {
				const res = explodeAddLeft(right, rightAdd);
				rightAdd = 0;
				return res;
			},
			leftAdapter(left) {
				const res = explodeAddRight(left, leftAdd);
				leftAdd = 0;
				return res;
			},
		});
	} else {
		return number;
	}
}

function explodeAddLeft(n: SnailNumeral, value: number): SnailNumeral {
	if (isPair(n)) {
		const [left, right] = n;
		return [explodeAddLeft(left, value), right];
	} else {
		return n + value;
	}
}

function explodeAddRight(n: SnailNumeral, value: number): SnailNumeral {
	if (isPair(n)) {
		const [l, r] = n;
		return [l, explodeAddRight(r, value)];
	} else {
		return n + value;
	}
}

export function reduce(number: Pair) {
	let initial: Pair = number;
	let reduced: Pair = number;
	do {
		initial = reduced;
		const exploded = explodeOne(initial);
		assert(isPair(exploded));
		reduced = exploded;

		if (!isSame(initial, reduced)) {
			continue;
		}

		const splitted = splitOne(initial);
		assert(isPair(splitted));
		reduced = splitted;
	} while (!isSame(initial, reduced));

	return reduced;
}

function runCalcs(list: SnailNumeral[]): SnailNumeral {
	return list.reduce((acc, number) => {
		return reduce([acc, number]);
	});
}

assertEquals(
	runCalcs([
		[1, 1],
		[2, 2],
		[3, 3],
		[4, 4],
	]),
	JSON.parse("[[[[1,1],[2,2]],[3,3]],[4,4]]")
);

assertEquals(
	runCalcs([
		[1, 1],
		[2, 2],
		[3, 3],
		[4, 4],
		[5, 5],
	]),
	JSON.parse("[[[[3,0],[5,3]],[4,4]],[5,5]]")
);

function getMagnitude(number: SnailNumeral): number {
	if (isPair(number)) {
		return getMagnitude(number[0]) * 3 + getMagnitude(number[1]) * 2;
	}
	return number;
}

assertEquals(
	getMagnitude([
		[1, 2],
		[[3, 4], 5],
	]),
	143
);

assertEquals(
	getMagnitude(JSON.parse("[[[[0,7],4],[[7,8],[6,0]]],[8,1]]")),
	1384
);

const sample: SnailNumeral[] = [
	"[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]",
	"[[[5,[2,8]],4],[5,[[9,9],0]]]",
	"[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]",
	"[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]",
	"[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]",
	"[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]",
	"[[[[5,4],[7,7]],8],[[8,3],8]]",
	"[[9,3],[[9,9],[6,[4,9]]]]",
	"[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]",
	"[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]",
].map((str) => JSON.parse(str) as SnailNumeral);
assertEquals(getMagnitude(runCalcs(sample)), 4140);

const input: SnailNumeral[] = [
	"[[2,[[1,1],9]],[[0,[3,0]],[[1,6],[4,2]]]]",
	"[[8,[0,5]],[[[9,9],0],[[2,9],2]]]",
	"[[[[6,4],[5,8]],[[0,9],[6,5]]],[[5,1],4]]",
	"[[[9,[2,8]],[[0,2],[8,3]]],[[[5,6],[5,8]],[[4,8],2]]]",
	"[[0,[[0,1],[6,0]]],[[[6,4],1],[8,6]]]",
	"[[[[8,5],6],8],[[[9,1],[0,6]],[4,[2,4]]]]",
	"[7,[[4,3],[8,5]]]",
	"[[8,[1,[3,4]]],[[3,8],[0,1]]]",
	"[[[1,1],[[2,1],[0,3]]],[[7,[1,8]],[[3,8],[5,2]]]]",
	"[[2,[[4,6],[6,2]]],[[0,5],[3,7]]]",
	"[[[[9,8],[4,6]],[7,[9,1]]],[[[8,7],[4,7]],[[6,6],[8,1]]]]",
	"[[[2,[5,1]],[[0,4],3]],[[9,7],[[0,2],0]]]",
	"[[[[5,0],2],5],[[3,[5,8]],[5,[8,9]]]]",
	"[[6,[3,6]],[[[2,7],6],[[6,0],4]]]",
	"[[8,8],7]",
	"[[[[7,9],3],8],[[0,[1,7]],[[3,2],[4,5]]]]",
	"[[[1,1],[7,2]],[3,[4,[6,4]]]]",
	"[[[9,[6,6]],[[4,8],[1,3]]],[[[4,7],8],[[5,2],[3,8]]]]",
	"[[[6,[6,7]],[3,4]],5]",
	"[[[[0,0],2],9],[[[2,1],1],[5,[4,7]]]]",
	"[[[2,[9,8]],[5,8]],[[[3,4],6],[5,0]]]",
	"[[[7,[9,4]],[7,[7,2]]],[[1,[9,6]],1]]",
	"[[[[9,1],1],[4,[2,6]]],3]",
	"[[0,[8,[3,4]]],[8,[9,8]]]",
	"[[[1,6],[6,7]],[[[0,4],1],7]]",
	"[[6,[5,[0,0]]],[7,[[5,4],1]]]",
	"[[2,[[9,5],[9,1]]],[[3,0],4]]",
	"[[[5,7],[[1,0],[3,5]]],[4,[5,[4,0]]]]",
	"[[3,3],[2,2]]",
	"[[[[6,2],[1,7]],[1,7]],[[[6,7],6],9]]",
	"[[[[9,8],[8,8]],[2,1]],[[8,4],8]]",
	"[[[[1,4],1],[2,0]],[4,[[0,5],5]]]",
	"[[[7,[6,0]],[[7,3],1]],9]",
	"[[[[2,4],0],[[6,9],8]],[[3,[0,9]],[[4,4],[5,4]]]]",
	"[[7,3],[0,[2,[7,2]]]]",
	"[[[[8,8],5],9],[[8,6],6]]",
	"[[[[9,5],7],9],0]",
	"[[[1,4],8],[[7,[5,3]],[[6,4],6]]]",
	"[[9,[[9,3],[3,7]]],[[[6,9],1],[[2,3],[4,4]]]]",
	"[[4,[9,2]],[3,4]]",
	"[[1,[[0,9],2]],[1,[1,[8,7]]]]",
	"[[[4,1],8],[9,[9,[2,9]]]]",
	"[[[[7,9],[9,7]],8],[[[3,0],5],[[7,8],[3,1]]]]",
	"[[[[9,4],[9,9]],[[9,5],[8,9]]],[[2,[7,4]],[[4,6],6]]]",
	"[[[[8,7],1],[6,8]],[[4,2],5]]",
	"[7,[3,[3,3]]]",
	"[[[4,9],[0,2]],[[[4,2],9],[[5,8],6]]]",
	"[[[[1,3],1],[[7,5],[4,0]]],[[[6,3],4],[[1,2],8]]]",
	"[[[[3,2],2],[4,7]],[[[5,6],[6,3]],3]]",
	"[[[[4,0],6],[4,2]],[7,5]]",
	"[[[[9,5],[2,0]],[[6,8],[0,9]]],[[[7,4],[3,6]],1]]",
	"[[[4,[9,3]],[[9,4],8]],[[6,[1,2]],2]]",
	"[[[[4,1],[1,1]],[[4,8],9]],[[[1,0],[0,3]],2]]",
	"[[[3,[3,8]],[[0,6],7]],[[2,5],9]]",
	"[[[0,[6,8]],[[2,7],[4,1]]],6]",
	"[[6,3],0]",
	"[[[3,[7,1]],[3,[2,0]]],[[[3,5],9],[[5,2],[7,8]]]]",
	"[[7,8],[1,[[7,1],5]]]",
	"[[[9,[8,9]],2],[9,[[8,8],4]]]",
	"[[[8,[5,8]],[[9,1],[6,0]]],[[[9,1],[4,7]],8]]",
	"[5,[[[4,9],7],[[6,0],[9,0]]]]",
	"[[[[8,8],[6,7]],[[1,0],6]],[[5,[2,8]],[[8,0],[3,7]]]]",
	"[[0,[6,6]],[[0,1],[3,[9,2]]]]",
	"[[1,[0,[8,1]]],[[0,[0,0]],[8,[0,0]]]]",
	"[[[4,[1,4]],[8,[9,5]]],7]",
	"[7,[[[0,0],[4,3]],8]]",
	"[[[9,1],[[7,5],[9,2]]],[5,[9,0]]]",
	"[[[[2,0],9],[8,[3,0]]],[[9,8],[4,[0,7]]]]",
	"[4,[5,[5,[0,3]]]]",
	"[[6,[[6,9],8]],[1,[0,[6,0]]]]",
	"[[7,[4,3]],[[0,6],[[5,2],[6,9]]]]",
	"[[[[7,2],[4,6]],[[5,0],9]],6]",
	"[[[0,1],[0,2]],[0,[5,2]]]",
	"[[[[5,0],[5,4]],[[5,9],[9,9]]],[2,[[3,0],[8,1]]]]",
	"[[[[9,2],[2,9]],[[5,5],2]],[[1,3],[[3,6],[1,8]]]]",
	"[[0,[2,4]],[[[6,9],1],[[7,9],[9,8]]]]",
	"[[[[2,1],1],[7,3]],[4,[[1,2],[2,6]]]]",
	"[[[6,[0,1]],[[6,4],[4,2]]],[1,[[0,0],[9,7]]]]",
	"[[[[9,2],3],[9,8]],[[6,5],[7,[1,7]]]]",
	"[[3,9],7]",
	"[[[6,9],[[0,2],0]],[[[8,6],2],9]]",
	"[[[[2,2],2],[[6,7],7]],[[0,3],9]]",
	"[[[7,[2,7]],3],4]",
	"[[[[1,9],6],[0,7]],[[[2,2],1],2]]",
	"[9,9]",
	"[0,[9,[[4,1],1]]]",
	"[[[[7,6],1],2],[[[6,9],[9,1]],0]]",
	"[[[[4,3],[4,2]],3],[[5,[6,5]],[[2,6],0]]]",
	"[[[0,[5,1]],[6,[1,4]]],[5,[[8,1],3]]]",
	"[6,[9,6]]",
	"[[8,[9,[6,8]]],[[4,9],[[2,4],[7,1]]]]",
	"[[5,[[9,9],[3,3]]],[[[9,8],[5,0]],6]]",
	"[[6,7],1]",
	"[1,[4,[[9,6],0]]]",
	"[[[[9,8],[7,8]],[5,[4,6]]],[[[5,9],6],[[4,6],4]]]",
	"[[[2,7],4],[[[0,3],0],[[7,4],[7,4]]]]",
	"[7,[0,4]]",
	"[1,[3,2]]",
	"[[3,0],8]",
	"[[[3,2],5],8]",
].map((str) => JSON.parse(str) as SnailNumeral);

assertEquals(getMagnitude(runCalcs(input)), 2501);

function largestPairSumMagnitude(numbers: SnailNumeral[]): number {
	const pairs: Pair[] = [];
	for (let i = 0; i < numbers.length; i += 1) {
		const p1 = numbers[i];

		for (let j = 0; j < numbers.length; j += 1) {
			const p2 = numbers[j];
			if (i === j) {
				continue;
			}
			pairs.push([p1, p2]);
		}
	}

	return Math.max(...pairs.map((pair) => getMagnitude(reduce(pair))));
}

assertEquals(largestPairSumMagnitude(sample), 3993);
assertEquals(largestPairSumMagnitude(input), 4935);
