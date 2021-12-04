export function* iterMap<T, U>(
	it: IterableIterator<T>,
	mapfn: (value: T, idx: number) => U
) {
	let idx = 0;
	for (const value of it) {
		yield mapfn(value, idx);
		idx += 1;
	}
}

export function collect<T>(it: IterableIterator<T>) {
	const arr = [];
	for (const val of it) {
		arr.push(val);
	}
	return arr;
}
