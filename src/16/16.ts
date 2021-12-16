import { assert } from "https://deno.land/std@0.117.0/testing/asserts.ts";

type Packet = {
	type: number;
	version: number;
	subPackets?: Packet[];
	data?: number;
	bitsUsed: number;
};

export function sumVersions(p: Packet): number {
	if (p.subPackets) {
		return p.subPackets.reduce(
			(acc, subP) => acc + sumVersions(subP),
			p.version
		);
	}
	return p.version;
}

const packetOperations: { [key: string]: (p: Packet) => number } = {
	0: (p) => {
		assert(p.subPackets);
		return p.subPackets.reduce((acc, p) => acc + runPacket(p), 0);
	},
	1: (p) => {
		assert(p.subPackets);
		return p.subPackets?.reduce((acc, p) => acc * runPacket(p), 1);
	},
	2: (p) => {
		assert(p.subPackets);
		return Math.min(...p.subPackets.map((p) => runPacket(p)));
	},
	3: (p) => {
		assert(p.subPackets);
		return Math.max(...p.subPackets.map((p) => runPacket(p)));
	},
	4: (p) => {
		assert(p.data);
		return p.data;
	},
	5: (p) => {
		assert(p.subPackets?.length === 2);
		const [val1, val2] = p.subPackets.map((p) => runPacket(p));
		return val1 > val2 ? 1 : 0;
	},
	6: (p) => {
		assert(p.subPackets?.length === 2);
		const [val1, val2] = p.subPackets.map((p) => runPacket(p));
		return val1 < val2 ? 1 : 0;
	},
	7: (p) => {
		assert(p.subPackets?.length === 2);
		const [val1, val2] = p.subPackets.map((p) => runPacket(p));
		return val1 === val2 ? 1 : 0;
	},
};

export function runPacket(p: Packet): number {
	if (p.type === 4){
		assert(p.data);
		return p.data
	}
	assert(p.subPackets)
	const op = packetOperations[p.type as keyof typeof packetOperations];
	return op(p);
}

export function parsePacket(s: string, start = 0): Packet {
	assert(s.length - 6 > start);
	const { type, version } = parseHeader(s, start);

	if (type === 4) {
		const { number, bitsUsed } = parseData(s, start + 6);
		return {
			type,
			version,
			data: number,
			bitsUsed: bitsUsed + 6,
		};
	}

	const lengthTypeId = s.slice(start + 6, start + 7);

	const subPackets =
		lengthTypeId === "1"
			? parseByCount(s, start + 7)
			: parseByLength(s, start + 7);

	const bitsUsed =
		subPackets.reduce((acc, p) => acc + p.bitsUsed, 0) +
		7 +
		(lengthTypeId === "1" ? 11 : 15);

	return { type, version, subPackets, bitsUsed };
}

export function hexToBinary(hex: string) {
	let binary = "";
	for (const char of hex) {
		binary += `0000${parseInt(char, 16).toString(2)}`.slice(-4);
	}
	return binary;
}

function parseByLength(s: string, start: number): Packet[] {
	const lengthSize = 15;
	const length = parseInt(s.slice(start, start + lengthSize), 2);
	const packets: Packet[] = [];
	let totalUse = 0;
	while (totalUse < length) {
		const pos = start + lengthSize + totalUse;
		const p = parsePacket(s, pos);
		totalUse += p.bitsUsed;
		packets.push(p);
	}
	return packets;
}

function parseByCount(s: string, start: number): Packet[] {
	const length = parseInt(s.slice(start, start + 11), 2);
	const packets: Packet[] = [];
	let pos = start + 11;
	while (packets.length < length) {
		const p = parsePacket(s, pos);
		pos += p.bitsUsed;
		packets.push(p);
	}
	return packets;
}

function parseData(
	s: string,
	start: number
): { number: number; bitsUsed: number } {
	let numberString = "";
	let pos = start;

	let next5 = s.slice(pos, pos + 5);
	let bits = 5;

	while (next5[0] === "1") {
		bits += 5;
		pos += 5;
		numberString = numberString + next5.slice(1);
		next5 = s.slice(pos, pos + 5);
	}

	numberString += next5.slice(1);

	return { number: parseInt(numberString, 2), bitsUsed: bits };
}

function parseHeader(s: string, start: number) {
	const versionBits = s.slice(start, start + 3);
	const typeBits = s.slice(start + 3, start + 6);
	const version = parseInt(versionBits, 2);
	const type = parseInt(typeBits, 2);
	return { version, type };
}
