import { wrapIterator } from "https://deno.land/x/iterator_helpers@v0.1.1/mod.ts";
import { assert } from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { setRemove, DefaultMap } from "../utils.ts";

const startNode = "start";
const endNode = "end";

export type CaveNode = string | typeof startNode | typeof endNode;
export type Cave = [CaveNode, CaveNode][];

export const findPaths = (
	cave: Cave,
	duplicateVisits: Set<CaveNode> = new Set()
): CaveNode[][] => {
	const map = buildMap(cave);
	const stack: [CaveNode, Set<CaveNode>][] = [[startNode, new Set()]];
	const visitedNodes = new DefaultMap<CaveNode, number>(0);

	const visitLimits = calculateVisitLimits(map, duplicateVisits);

	const paths = new Set<CaveNode[]>();
	visitedNodes.set(startNode, 1);

	while (true) {
		const lastPair = stack.pop();
		if (!lastPair) {
			break;
		}
		const [currentNode, checkedNeighbors] = lastPair;
		visitedNodes.set(currentNode, visitedNodes.get(currentNode) - 1);
		if (currentNode === endNode) {
			const path = [...stack.map(([node]) => node), currentNode];
			paths.add(path);
			continue;
		}
		const allNeighbors = map.get(currentNode);
		assert(allNeighbors);

		const unvisitedHeighbors = setRemove(allNeighbors, checkedNeighbors);

		if (unvisitedHeighbors.size === 0) {
			continue;
		}

		const nextNeighbor = wrapIterator(unvisitedHeighbors.values()).find(
			(node) => {
				const limit = visitLimits.get(node);
				assert(limit);
				return visitedNodes.get(node) < limit;
			}
		);

		if (!nextNeighbor) {
			continue;
		}

		checkedNeighbors.add(nextNeighbor);

		stack.push([currentNode, checkedNeighbors]);
		visitedNodes.set(currentNode, visitedNodes.get(currentNode) + 1);
		stack.push([nextNeighbor, new Set()]);
		visitedNodes.set(nextNeighbor, visitedNodes.get(nextNeighbor) + 1);
	}

	return wrapIterator(paths.values()).toArray();
};

export function findPathsMultivisit(cave: Cave): Set<string> {
	const allPaths = new Set<string>();
	const twiceVisitableNodes = new Set(
		wrapIterator(cave.values())
			.flatMap((nodes) => nodes)
			.filter(
				(node) => !isLargeNode(node) && node !== startNode && node !== endNode
			)
			.toArray()
	);

	wrapIterator(twiceVisitableNodes.values())
		.map((node) => findPaths(cave, new Set([node])))
		.forEach((paths) => {
			for (const p of paths) {
				allPaths.add(p.join(","));
			}
		});

	return allPaths;
}

function calculateVisitLimits(
	map: Map<string, Set<string>>,
	duplicateVisits: Set<string>
) {
	const mapIt = wrapIterator(map.keys()).map((node): [CaveNode, number] => {
		if (isLargeNode(node)) {
			return [node, Infinity];
		}
		if (duplicateVisits.has(node)) {
			return [node, 2];
		}
		return [node, 1];
	});
	return new Map<CaveNode, number>(mapIt.toArray());
}

function isLargeNode(node: CaveNode): boolean {
	return node.toUpperCase() === node;
}

function buildMap(cave: Cave): Map<CaveNode, Set<CaveNode>> {
	const map = new Map<CaveNode, Set<CaveNode>>();

	for (const [a, b] of cave) {
		const setA = map.get(a) || new Set();
		const setB = map.get(b) || new Set();

		setA.add(b);
		setB.add(a);

		map.set(a, setA);
		map.set(b, setB);
	}

	return map;
}
