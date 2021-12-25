export type Register = "w" | "x" | "y" | "z";
export type Instruction =
	| ["inp", Register]
	| ["add", Register, Register | number]
	| ["mul", Register, Register | number]
	| ["div", Register, Register | number]
	| ["mod", Register, Register | number]
	| ["eql", Register, Register | number];

const commonInstruction = (fx: number, fy: number): Instruction[] => [
	["inp", "w"],
	["mul", "x", 0],
	["add", "x", "z"],
	["mod", "x", 26],
	["div", "z", fx < 0 ? 26 : 1],
	["add", "x", fx],
	["eql", "x", "w"],
	["eql", "x", 0],
	["mul", "y", 0],
	["add", "y", 25],
	["mul", "y", "x"],
	["add", "y", 1],
	["mul", "z", "y"],
	["mul", "y", 0],
	["add", "y", "w"],
	["add", "y", fy],
	["mul", "y", "x"],
	["add", "z", "y"],
];

export const monad: Instruction[] = [
	...commonInstruction(10, 10),
	...commonInstruction(13, 5),
	...commonInstruction(15, 12),
	...commonInstruction(-12, 12),
	...commonInstruction(14, 6),
	...commonInstruction(-2, 4),
	...commonInstruction(13, 15),
	...commonInstruction(-12, 3),
	...commonInstruction(15, 7),
	...commonInstruction(11, 11),
	...commonInstruction(-3, 2),
	...commonInstruction(-13, 12),
	...commonInstruction(-12, 4),
	...commonInstruction(-13, 11),
];
