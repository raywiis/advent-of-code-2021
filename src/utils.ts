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

export function* iterFilter<T>(
	it: IterableIterator<T>,
	filterFn: (value: T) => boolean
) {
	for (const value of it) {
		if (filterFn(value)) {
			yield value;
		}
	}
}

export function setRemove<T>(from: Set<T>, what: Set<T>): Set<T> {
	const set = new Set(from);
	for (const item of what) {
		set.delete(item);
	}
	return set;
}

export function bothHave<T>(s1: Set<T>, s2: Set<T>): Set<T> {
	const set = new Set<T>();
	for (const item of s1) {
		if (s2.has(item)) {
			set.add(item);
		}
	}
	for (const item of s2) {
		if (s1.has(item)) {
			set.add(item);
		}
	}
	return set;
}
