const input = await Deno.readTextFile("src/01.input.txt");
const depths = input.split("\n").map((num) => parseInt(num, 10));

const getPeaks = (depths: number[]) =>
	depths
		.map((num, idx, arr) => num > arr[idx - 1])
		.reduce((acc, curr) => (curr ? acc + 1 : acc), 0);

const singlePeaks = getPeaks(depths);
console.log(`Single dips ${singlePeaks}`);

const windowedDepths = depths
	.map((_, idx, arr) =>
		idx < arr.length - 2 ? arr[idx] + arr[idx + 1] + arr[idx + 2] : undefined
	)
	.filter((a): a is number => !!a);

const windowedPeaks = getPeaks(windowedDepths);

console.log(`Window dips ${windowedPeaks}`);
