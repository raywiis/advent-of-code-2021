const targetArea: [number, number, number, number] = [70, 96, -179, -124];
// const targetArea: [number, number, number, number] = [20, 30, -10, -5];

function isWithinArea(
	area: [number, number, number, number],
	position: [number, number]
) {
	const [ax1, ax2, ay1, ay2] = area;
	const [x1, y1] = position;

	return isWithin(x1, [ax1, ax2]) && isWithin(y1, [ay1, ay2]);
}

function isWithin(position: number, range: [number, number]) {
	const [r1, r2] = range;
	const min = Math.min(r1, r2);
	const max = Math.max(r1, r2);
	return position <= max && position >= min;
}

const initialPosition = [0, 0];

function runYThrow(
	initialVelocity: number,
	[y1, y2]: [number, number]
): number[] {
	const positions = [];

	let velocity = initialVelocity;
	let position = 0;

	const minRange = Math.min(y1, y2);

	while (position > minRange) {
		position += velocity;
		velocity -= 1;
		positions.push(position);
	}

	return positions;
}

function runXThrow(initialVelocity: number, cap: number) {
	const positions = [0];

	let position = 0;
	let velocity = initialVelocity;
	while (velocity > 0 && position < cap) {
		position += velocity;
		velocity -= 1;
		positions.push(position);
	}

	return positions;
}

function getHighestYThrow(
	area: [number, number, number, number]
): [number, Set<number>] {
	const [, , y1, y2] = area;

	let velocity = Math.min(y1, y2) - 1;
	let positions: number[] = [];
	let bestPositions: number[] = [];
	let isWithinRange = 0;
	const validVelocities = new Set<number>();

	do {
		velocity += 1;
		positions = runYThrow(velocity, [y1, y2]);
		const inRangePositions = positions.filter((pos) => isWithin(pos, [y1, y2]));
		isWithinRange =
			inRangePositions.length > 0 ? isWithinRange : isWithinRange + 1;
		if (inRangePositions.length > 0) {
			validVelocities.add(velocity);
			bestPositions = positions;
		}
	} while (isWithinRange < 1000);

	return [Math.max(...bestPositions), validVelocities];
}

function getValidXThrows(area: [number, number, number, number]) {
	const [x1, x2] = area;
	const cap = Math.max(x1, x2) + 1;
	const validVelocities = new Set<number>();
	let fallsWithin = 0;

	let velocity = 0;
	do {
		velocity += 1;
		const positions = runXThrow(velocity, cap);
		fallsWithin = positions.some((p) => isWithin(p, [x1, x2])) ? 1 : 0;
	} while (fallsWithin === 0);

	validVelocities.add(velocity);

	do {
		velocity += 1;
		const positions = runXThrow(velocity, cap);
		const goodThrow = positions.some((p) => isWithin(p, [x1, x2]));
		fallsWithin = goodThrow ? fallsWithin + 1 : fallsWithin;
		if (goodThrow) {
			validVelocities.add(velocity);
		}
	} while (fallsWithin < 1000 && velocity < cap);

	return validVelocities;
}

function runThrow(initialVelocity: [number, number]) {
	let [x, y] = [0, 0];
	let [vX, vY] = initialVelocity;
	const positions: [number, number][] = [];

	for (let i = 0; i < 1000; i += 1) {
		x += vX;
		y += vY;
		vX = Math.max(vX - 1, 0);
		vY = vY - 1;
		positions.push([x, y]);
	}

	return positions;
}

const [highestThrow, validYThrows] = getHighestYThrow(targetArea);
// 15931
console.log(highestThrow);

const validXThrows = getValidXThrows(targetArea);

const validVelocities = new Set();
for (const x of validXThrows) {
	for (const y of validYThrows) {
		const velocity: [number, number] = [x, y];
		const positions = runThrow(velocity);
		const somePositionsInArea = positions.some((p) =>
			isWithinArea(targetArea, p)
		);
		if (somePositionsInArea) {
			validVelocities.add(velocity);
		}
	}
}

console.log(validVelocities.size);
