import {
	fromFileUrl,
	dirname,
	join,
} from "https://deno.land/std@0.116.0/path/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";
import { wrapIterator } from "https://deno.land/x/iterator_helpers@v0.1.1/mod.ts";
// console.log(template, rules)

function bucket<T>(elements: T[]): Map<T, number> {
	const map = new Map<T, number>();
	for (const element of elements) {
		map.set(element, (map.get(element) || 0) + 1);
	}
	return map;
}

export function getAnswer(
	template: string,
	rules: Map<string, string>,
	iterationCount: number
) {
	let patterns = new Map<string, number>();

	const firstChar = template[0];
	const lastChar = template[template.length - 1];

	for (let idx = 1; idx < template.length; idx++) {
		const pattern = template[idx - 1] + template[idx];
		patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
	}

	for (let i = 0; i < iterationCount; i += 1) {
		const newPatterns = new Map();

		for (const [pattern, times] of patterns.entries()) {
			const insertion = rules.get(pattern);
			const pattern1 = pattern[0] + insertion;
			const pattern2 = insertion + pattern[1];

			newPatterns.set(pattern1, (newPatterns.get(pattern1) || 0) + times);
			newPatterns.set(pattern2, (newPatterns.get(pattern2) || 0) + times);
		}

		patterns = newPatterns;
	}

	const counts = new Map([
		[firstChar, 1],
		[lastChar, 1],
	]);
	for (const [pat, times] of patterns) {
		counts.set(pat[0], (counts.get(pat[0]) || 0) + times);
		counts.set(pat[1], (counts.get(pat[1]) || 0) + times);
	}

	const max = Math.max(...wrapIterator(counts.values()).toArray()) / 2;
	const min = Math.min(...wrapIterator(counts.values()).toArray()) / 2;

	return max - min;

	// for (let i = 0; i < iterationCount; i++) {
	// 	let newPattern = pattern[0];
	// 	for (let idx = 1; idx < pattern.length; idx++) {
	// 		const rule = pattern[idx - 1] + pattern[idx];
	// 		const product = rules.get(rule)
	// 		newPattern += product;
	// 		newPattern += pattern[idx]
	// 	}
	// 	pattern = newPattern
	// }

	// const counts = bucket([...pattern])
	// const minCount = Math.min(...wrapIterator(counts.values()).toArray())
	// const maxCount = Math.max(...wrapIterator(counts.values()).toArray())
	// return maxCount - minCount;
}
