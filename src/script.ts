import { readFileSync } from "fs";

class Map {
	size: string;
	start: string;
	shortestEnd: string = "";
	end: string[] = [];
	table: object = {};
	step: number = 0;
	curentNode: string[] = [];
	nextNode: string[] = [];
	maxStep: number = 10000;
	pathFound: boolean = false;

	getSize(): number[] {
		return this.size.split("x").map((val) => { return parseInt(val, 10) });
	}

	executeStep() {
		this.step++

		for (const coord of this.curentNode) {
			if (coord === this.start) {
				this.table[coord].step = 0;
			}
			let intCoord = coord.split(";").map((val) => { return parseInt(val, 10) });

			this.updateStep((intCoord[0] + 1) + ";" + intCoord[1], this.table[coord].step + 1);
			this.updateStep((intCoord[0] - 1) + ";" + intCoord[1], this.table[coord].step + 1);
			this.updateStep(intCoord[0] + ";" + (intCoord[1] + 1), this.table[coord].step + 1);
			this.updateStep(intCoord[0] + ";" + (intCoord[1] - 1), this.table[coord].step + 1);
		}

		this.curentNode = this.nextNode;
		this.nextNode = [];
	}

	drawPath() {
		let step = this.table[this.shortestEnd].step;

		let prevCoord = this.shortestEnd;
		for (let i = step; i > 0; i--) {
			let currentCoord = prevCoord;
			
			let intCoord = currentCoord.split(";").map((val) => { return parseInt(val, 10) });
			prevCoord = this.isLowerStep((intCoord[0] + 1) + ";" + intCoord[1], i) ? prevCoord = (intCoord[0] + 1) + ";" + intCoord[1] : prevCoord;
			prevCoord = this.isLowerStep((intCoord[0] - 1) + ";" + intCoord[1], i) ? prevCoord = (intCoord[0] - 1) + ";" + intCoord[1] : prevCoord;
			prevCoord = this.isLowerStep(intCoord[0] + ";" + (intCoord[1] + 1), i) ? prevCoord = intCoord[0] + ";" + (intCoord[1] + 1) : prevCoord;
			prevCoord = this.isLowerStep(intCoord[0] + ";" + (intCoord[1] - 1), i) ? prevCoord = intCoord[0] + ";" + (intCoord[1] - 1) : prevCoord;

			this.table[prevCoord].isResult = true;
		}
	}

	private isLowerStep(coord: string, step: number): boolean {
		if (this.table[coord] && this.table[coord].step && this.table[coord].step > -1 && this.table[coord].step < step) {
			return true;
		} else {
			return false;
		}
	}

	private updateStep(coord: string, step: number) {
		if (!this.table[coord]) { return; }

		switch (this.table[coord].value) {
			case " ":
				if (this.table[coord].step >= 0) { return; }
				this.table[coord].step = step;
				this.nextNode.push(coord);
				break;
			case "2":
				this.table[coord].step = step;
				this.nextNode.push(coord);
				this.shortestEnd = coord;
				this.pathFound = true;
				break;
			default:
				break;
		}
	}
}

function main() {
	if (!process.argv[2]) { throw "no map found"; }

	const map = importMap(process.argv[2]);
	map.curentNode.push(map.start);

	while (map.step < map.maxStep && !map.pathFound && map.curentNode !== []) {
		map.executeStep();
	}

	if(map.pathFound) {
		map.drawPath();
	} else {
		console.log("No solution found. Maybe increase maxStep can help you");
	}

	printMap(map, false);
}

function printMap(map: Map, info: boolean = false) {
	let intSize = map.getSize();
	let rawRes: string[][] = new Array(intSize[1]).fill("").map(() => Array(intSize[0]).fill(""));
	for (const coord in map.table) {
		let intCoord = coord.split(";").map((val) => { return parseInt(val, 10) });

		if (map.table[coord].isResult && coord !== map.start && coord !== map.end[0]) {
			rawRes[intCoord[1]][intCoord[0]] = "0";
		} else {
			if (info && map.table[coord].step >= 0 && coord !== map.start && coord !== map.end[0]) {
				rawRes[intCoord[1]][intCoord[0]] = ".";
			} else {
				rawRes[intCoord[1]][intCoord[0]] = map.table[coord].value;
			}
		}
	}
	const result = rawRes.map((line) => line.join("")).join("\n");

	if (info) {
		const infoRes = { ...map, table: null }
		// const infoRes = { ...map }
		console.log(infoRes);
	}

	console.log(result);
}

function importMap(mapPath: string): Map {
	let rawMap = readFileSync(mapPath, 'utf8');
	let mapLine = rawMap.split('\n');
	let map = new Map();

	if (mapLine[0][0] !== "*") {
		map.size = mapLine.shift();
	} else {
		map.size = mapLine[0].length + "x" + mapLine.length;
	}

	let y = -1;
	for (const line of mapLine) {
		let x = -1;
		y++;
		if (!line) { break; }
		for (const char of line.split('')) {
			x++
			const key = x + ";" + y;
			map.table[key] = {
				value: char,
				step: -1,
				isResult: false
			}

			switch (char) {
				case "1":
					map.start = key;
					break;
				case "2":
					map.end.push(key);
					break;
				default:
					break;
			}
		}
	}

	return map;
}

main();
