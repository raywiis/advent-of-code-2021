export type Key = string;
export type Risk = number;

const directions = [
	[-1, 0],
	[0, -1],
	[1, 0],
	[0, 1],
];

export const toKey = ([x, y]: [number, number]) => JSON.stringify([x, y]);
const fromKey = (k: Key) => JSON.parse(k);

const getModValue = (originalVal: number, modifier: number): number => {
	let v = originalVal + modifier;
	while (v > 9) {
		v -= 9;
	}
	return v;
};

export function findPathCost(map: Map<Key, Risk>, sizeMultiplier = 1): number {
	const startingPoint = toKey([0, 0]);
	const fromMap = new Map<Key, Key | null>([[startingPoint, null]]);
	const costMap = new Map<Key, number>([[startingPoint, 0]]);

	const q: [Key, number][] = [[startingPoint, 0]];

	const coords = [...map.keys()].map((k) => fromKey(k));
	const xMax = Math.max(...coords.map(([x]) => x));
	const yMax = Math.max(...coords.map(([_, y]) => y));
	const [xCap, yCap] = [xMax + 1, yMax + 1];
	const lastKey = toKey([xCap * sizeMultiplier - 1, yCap * sizeMultiplier - 1]);

	while (q.length > 0) {
		const [nextNode, lastCost] = q.shift() as [Key, number];

		const [cx, cy] = fromKey(nextNode);

		for (const [dx, dy] of directions) {
			const [x, y] = [cx + dx, cy + dy];

			if (x >= sizeMultiplier * xCap || y >= sizeMultiplier * yCap) {
				continue;
			}
			const lookupX = x % xCap;
			const lookupY = y % yCap;
			const xMod = Math.floor(x / xCap);
			const yMod = Math.floor(y / yCap);

			const totalMod = xMod + yMod;

			const neighborKey = toKey([x, y]);
			const lookupKey = toKey([lookupX, lookupY]);
			const neighborVal = map.get(lookupKey);

			if (!neighborVal || fromMap.has(neighborKey)) {
				continue;
			}

			fromMap.set(neighborKey, nextNode);
			const currentCost = lastCost + getModValue(neighborVal, totalMod);

			const queuePriority = q.findIndex(([_, cost]) => cost > currentCost);
			costMap.set(neighborKey, currentCost);

			queuePriority === -1
				? q.push([neighborKey, currentCost])
				: q.splice(queuePriority, 0, [neighborKey, currentCost]);
		}
	}

	return costMap.get(lastKey) as number;
}
