import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";

const inputFilePath = join(dirname(fromFileUrl(import.meta.url)), '03.input.txt');
const input = await Deno.readTextFile(inputFilePath);

const data = input.split('\n').map(a => a.trim());

const initialFrequencies = [...data[0]].map(_ => 0);
const addFrequencies = (frequencies: number[], bits: string) =>
	frequencies.map((f, idx) => (bits[idx] === "1" ? f + 1 : f));

const oneFrequencies = data.reduce(addFrequencies, initialFrequencies);
const zeroFrequencies = oneFrequencies.map(f => data.length - f);

const gammaBits = oneFrequencies
	.map((f1, idx) => (f1 >= zeroFrequencies[idx] ? 1 : 0))

const epsilonBits = gammaBits.map((g) => g === 1 ? 0 : 1)

const gamma = parseInt(gammaBits.join(''), 2);
const epsilon = parseInt(epsilonBits.join(''), 2);

export const powerRate = gamma * epsilon;

const advancedFrequencies = (mostCommon = true) => {
	let workingBits = data;

	for (const idx in initialFrequencies) {
		const freqs = workingBits.reduce(addFrequencies, initialFrequencies);
		const bit = freqs[idx] >=(workingBits.length - freqs[idx]) ? '1' : '0';
		
		workingBits = workingBits.filter((seq) =>
			mostCommon ? seq[idx] === bit : seq[idx] !== bit
		);

		if (workingBits.length === 1) {
			return workingBits[0]
		}
	}

	throw new Error('goofed');
}

const oxygenRating = parseInt(advancedFrequencies(true), 2);
const co2Rating = parseInt(advancedFrequencies(false), 2);

export const lifeSupportRating = oxygenRating * co2Rating;
