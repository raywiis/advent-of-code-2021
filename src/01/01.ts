import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
const __dirname = dirname(fromFileUrl(import.meta.url));
const input = await Deno.readTextFile(join(__dirname, "01.input.txt"));
const data = input.split("\n").map((num) => parseInt(num, 10));

const getPeaks = (depths: number[]) =>
	depths
		.map((num, idx, arr) => num > arr[idx - 1])
		.reduce((acc, curr) => (curr ? acc + 1 : acc), 0);

export const singlePeaks = getPeaks(data);

console.log(`Single dips ${singlePeaks}`);

const windowedDepths = data
	.map((_, idx, arr) =>
		idx < arr.length - 2 ? arr[idx] + arr[idx + 1] + arr[idx + 2] : undefined
	)
	.filter((a): a is number => !!a);

export const windowedPeaks = getPeaks(windowedDepths);

console.log(`Window dips ${windowedPeaks}`);
