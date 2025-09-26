class Map {
    constructor(matrix) {
        this.matrix = matrix;
        this.length = matrix.length;
        this.min = this.getMin();
        this.max = this.getMax();
        this.nonZeroMin = this.getMin(true);
    }

    get(x) {
        return this.matrix[x];
    }

    set(x, value) {
        this.matrix[x] = value;
    }

    getMin(nonZero = false) {
        let min = Number.MAX_VALUE;
		for (let i = 0; i < this.matrix.length; i++) {
			if (nonZero && this.matrix[i] <= 0) {
				continue;
			}
			if (this.matrix[i] < min) {
				min = this.matrix[i];
			}
		}
		return min;
    }

    getMax() {
		let max = Number.MIN_VALUE;
		for (let i = 0; i < this.matrix.length; i++) {
			if (this.matrix[i] > max) {
				max = this.matrix[i];
			}
		}
		return max;
    }

	normalize(min, max) {
		this.matrix = this.matrix.map((value) => ((value - this.min) / (this.max - this.min)) * (max - min) + min);
		this.min = this.getMin();
		this.max = this.getMax();
		this.nonZeroMin = this.getMin(true);
	}

	getLogScaleMap() {
		let matrixLog = this.matrix.map((value) => Math.log10(Math.max(value, 0)));
		let logMap = new Map(matrixLog);
		logMap.min = Math.log10(this.min);
		logMap.max = Math.log10(this.max);
		logMap.nonZeroMin = Math.log10(this.nonZeroMin);
		return logMap;
	}
}

function readInputMap(fileInputId) {
	let file = document.getElementById(fileInputId).files[0];
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const content = reader.result; // Get file content
			const map = readMap(content);
			resolve(map); // Resolve with processed text
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsText(file);
	});
}

function readMap(mapFileContent) {
	const data = mapFileContent.split("\n");
	let matrix = [];
	for (let i = 0; i < data.length; i++) {
		matrix.push(
			data[i].split(" ").map((value) => Math.max(Number(value), 0))
		);
	}

	matrix = matrix.flat();
    map = new Map(matrix);
	return map;
}

function downloadMap(map, filename) {
	let data = "";
	for (let i = 0; i < map.length; i++) {
		data += map.get(i).toFixed(30);
		if (i !== map.length - 1) {
			data += " ";
		}
		if ((i + 1) % 512 === 0 && i !== 0) {
			data += "\n";
		}
	}

	// TODO: check if the a tag is already in the document
	let blob = new Blob([data], { type: "text/plain" });
	let url = URL.createObjectURL(blob);
	let a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
}