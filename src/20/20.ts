import {
	fromFileUrl,
	dirname,
	join,
	os,
	assertEquals,
	assert,
	wrapIterator,
} from "../deps.ts";

async function readInput(fileName: string): Promise<[Pixel[], Picture]> {
	const inputFilePath = join(dirname(fromFileUrl(import.meta.url)), fileName);
	const input = await Deno.readTextFile(inputFilePath);

	const [enhanceSeq, image] = input.split(os.EOL() + os.EOL());

	const picture: Picture = new Map();
	image.split(os.EOL()).forEach((row, y) => {
		[...row].forEach((pixel, x) => {
			assert(pixel === "#" || pixel === ".");
			picture.set(positionToKey([x, y]), pixel);
		});
	});

	const seq = [...enhanceSeq].map((i) => {
		assert(i === "#" || i === ".");
		return i;
	});

	return [seq, picture];
}

function draw(map: Picture, seq: Pixel[], even: boolean) {
	const defaultPixel = seq[0] === "#" && !even ? "#" : ".";
	const yMax =
		5 +
		Math.max(
			...wrapIterator(map.keys())
				.map((key) => keyToPosition(key))
				.map(([_x, y]) => y)
				.toArray()
		);

	const xMax =
		5 +
		Math.max(
			...wrapIterator(map.keys())
				.map((key) => keyToPosition(key))
				.map(([x, _y]) => x)
				.toArray()
		);

	const yMin =
		-5 +
		Math.min(
			...wrapIterator(map.keys())
				.map((key) => keyToPosition(key))
				.map(([_x, y]) => y)
				.toArray()
		);

	const xMin =
		-5 +
		Math.min(
			...wrapIterator(map.keys())
				.map((key) => keyToPosition(key))
				.map(([x, _y]) => x)
				.toArray()
		);

	for (let y = yMin; y <= yMax; y++) {
		let row = "";
		for (let x = xMin; x <= xMax; x++) {
			row += map.get(positionToKey([x, y])) || defaultPixel;
		}
		console.log(row);
	}
}

const lookups: [number, number][] = [
	[-1, -1],
	[+0, -1],
	[+1, -1],
	[-1, +0],
	[+0, +0],
	[+1, +0],
	[-1, +1],
	[+0, +1],
	[+1, +1],
];

type Pixel = "#" | ".";
type PositionKey = string;
type Picture = Map<PositionKey, Pixel>;
type Position = [x: number, y: number];

const applyDelta = ([x, y]: Position, [dx, dy]: [number, number]): Position => [
	x + dx,
	y + dy,
];

const positionToKey = (p: Position): PositionKey => JSON.stringify(p);
const keyToPosition = (k: PositionKey): Position => JSON.parse(k);

function getNumber(
	picture: Picture,
	pos: Position,
	seq: Pixel[],
	even: boolean
): number {
	const defaultPixel = seq[0] === "#" && even ? "#" : ".";
	const bits = lookups
		.map((delta) => {
			const bp = applyDelta(pos, delta);
			const pixel = picture.get(positionToKey(bp)) || defaultPixel;
			return pixel === "." ? "0" : "1";
		})
		.join("");
	return parseInt(bits, 2);
}

function enhance(
	picture: Picture,
	enhanceSeq: Pixel[],
	even: boolean
): Picture {
	const enhancedImage: Picture = new Map();

	const yMax = Math.max(
		...wrapIterator(picture.keys())
			.map((key) => keyToPosition(key))
			.map(([_x, y]) => y)
			.toArray()
	);

	const xMax = Math.max(
		...wrapIterator(picture.keys())
			.map((key) => keyToPosition(key))
			.map(([x, _y]) => x)
			.toArray()
	);

	const yMin = Math.min(
		...wrapIterator(picture.keys())
			.map((key) => keyToPosition(key))
			.map(([_x, y]) => y)
			.toArray()
	);

	const xMin = Math.min(
		...wrapIterator(picture.keys())
			.map((key) => keyToPosition(key))
			.map(([x, _y]) => x)
			.toArray()
	);

	for (let x = xMin - 5; x < xMax + 5; x++) {
		for (let y = yMin - 5; y < yMax + 5; y++) {
			const position: Position = [x, y];
			const num = getNumber(picture, position, enhanceSeq, even);
			const pixel = enhanceSeq[num];
			enhancedImage.set(positionToKey(position), pixel);
		}
	}

	return enhancedImage;
}

const [sampleSequence, samplePicture] = await readInput("20.sample.txt");
const [inputSequence, inputPicture] = await readInput("20.input.txt");

function countLights(pic: Picture) {
	return wrapIterator(pic.values()).reduce(
		(acc, p) => (p === "#" ? acc + 1 : acc),
		0
	);
}

function doubleEnhance(image: Picture, seq: Pixel[]): Picture {
	const single = enhance(image, seq, false);
	const double = enhance(single, seq, true);

	const litSpots = wrapIterator(double.entries())
		.filter(([_key, pixel]) => pixel === "#")
		.toArray();

	const xMax = Math.max(...litSpots.map(([key]) => keyToPosition(key)[0]));
	const yMax = Math.max(...litSpots.map(([key]) => keyToPosition(key)[1]));
	const xMin = Math.min(...litSpots.map(([key]) => keyToPosition(key)[0]));
	const yMin = Math.min(...litSpots.map(([key]) => keyToPosition(key)[1]));

	const reducedImage: Picture = new Map();
	for (let x = xMin; x <= xMax; x++) {
		for (let y = yMin; y <= yMax; y++) {
			const k = positionToKey([x, y]);
			const pixel = double.get(k);
			assert(pixel);
			reducedImage.set(k, pixel);
		}
	}
	return reducedImage;
}

function doubleEnhanceTimes(
	image: Picture,
	seq: Pixel[],
	times: number
): Picture {
	let img = image;
	for (let i = 0; i < times; i++) {
		img = doubleEnhance(img, seq);
	}
	return img;
}

const deSample = doubleEnhance(samplePicture, sampleSequence);
const fiftyTimeSample = doubleEnhanceTimes(samplePicture, sampleSequence, 25);
assertEquals(countLights(deSample), 35);
assertEquals(countLights(fiftyTimeSample), 3351);

const doubleEnh = doubleEnhance(inputPicture, inputSequence);
const fiftyTimeInput = doubleEnhanceTimes(inputPicture, inputSequence, 25);
assertEquals(countLights(doubleEnh), 5065);
assertEquals(countLights(fiftyTimeInput), 14790);
