import {
	assert,
} from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { Register, Instruction, monad } from "./monad.ts";

type Memory = { [r in Register]: number };

type State = {
	input: number[];
	registers: Memory;
};

const initialRegs: Memory = {
	w: 0,
	x: 0,
	y: 0,
	z: 0,
};

function isRegister(r: Register | number): r is Register {
	return typeof r === "string";
}

function exec(op: Instruction, state: State): State {
	if (op[0] === "inp") {
		assert(state.input.length > 0, "Input too short");
		const dest = op[1];
		return {
			registers: { ...state.registers, [dest]: state.input[0] },
			input: state.input.slice(1),
		};
	}
	const aReg = op[1];
	const a = state.registers[aReg];
	const b: number = isRegister(op[2]) ? state.registers[op[2]] : op[2];

	if (op[0] === "add") {
		return {
			...state,
			registers: {
				...state.registers,
				[aReg]: a + b,
			},
		};
	}
	if (op[0] === "div") {
		assert(b !== 0, "Division by zero");
		return {
			...state,
			registers: {
				...state.registers,
				[aReg]: Math.floor(a / b),
			},
		};
	}
	if (op[0] === "mul") {
		return {
			...state,
			registers: {
				...state.registers,
				[aReg]: Math.floor(a * b),
			},
		};
	}
	if (op[0] === "mod") {
		assert(a >= 0 && b >= 0, "Negative mod");
		return {
			...state,
			registers: {
				...state.registers,
				[aReg]: Math.floor(a % b),
			},
		};
	}
	if (op[0] === "eql") {
		return {
			...state,
			registers: {
				...state.registers,
				[aReg]: a === b ? 1 : 0,
			},
		};
	}

	throw new Error("unsupported instruction");
}

const run = (ops: Instruction[], input: number[]) => {
	const initialState = {
		registers: initialRegs,
		input,
	};

	return ops.reduce((state, op) => exec(op, state), initialState);
};

const arrayify = (n: number) => [...n.toString()].map((d) => parseInt(d, 10));
function verify(num: number): boolean {
	const input = arrayify(num);
	assert(input.length === 14);
	if (input.some((n) => n === 0)) {
		return false;
	}
	const state = run(monad, input);
	return state.registers.z === 0;
}

const largest = parseInt([9, 9, 9, 9, 5, 9, 6, 9, 9, 1, 9, 3, 2, 6].join(''), 10)
console.log(verify(largest), largest);

const smallest = parseInt([4, 8, 1, 1, 1, 5, 1, 4, 7, 1, 9, 1, 1, 1].join(''))
console.log(verify(smallest), smallest);
