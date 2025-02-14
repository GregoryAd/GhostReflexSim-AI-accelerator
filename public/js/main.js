let result = [];
let matrix = [];
let matrixMin = +Infinity;
let matrixMax = -Infinity;
let session = null;

window.onload = async function () {
	session = await loadModel();
};

function readFile() {
	matrix = [];
	MatrixMin = +Infinity;
	MatrixMax = -Infinity;
	let file = document.getElementById("file").files[0];
	let fileReader = new FileReader();
	fileReader.onload = async function () {
		readMap(fileReader);
		convertMatrixToImage(matrix, getMin(matrix, true), matrixMax, "input");
	};

	fileReader.readAsText(file);
}

function getMax(mat) {
	let max = -Infinity;
	for (let i = 0; i < mat.length; i++) {
		if (mat[i] > max) {
			max = mat[i];
		}
	}
	return max;
}

function getMin(mat, nonZero = false) {
	let min = +Infinity;
	for (let i = 0; i < mat.length; i++) {
		if (nonZero && mat[i] === 0) {
			continue;
		}
		if (mat[i] < min) {
			min = mat[i];
		}
	}
	return min;
}

async function runModelInference() {
	const matrixNormalized = normalize(matrix, matrixMin, matrixMax, matrixMin, 1000);

	const x = Float32Array.from(matrixNormalized);
	const input = new ort.Tensor("float32", x, [1, 512, 512, 1]);
	const y = await session.run({ x: input });
	const output = y.output.data;

	const newMin = getMin(output);
	const newMax = getMax(output);

	const result = normalize(output, newMin, newMax, matrixMin, matrixMax);
	convertMatrixToImage(result, getMin(result, true), matrixMax, "output");

	return output;
}

function readMap(fileReader) {
	let data = fileReader.result.split("\n");

	for (let i = 0; i < data.length; i++) {
		matrix.push(
			data[i].split(" ").map((value) => Math.max(Number(value), 0))
		);
	}

	matrix = matrix.flat();

	matrixMin = getMin(matrix);
	matrixMax = getMax(matrix);
}

function downloadFile(matrix, filename) {
	let data = "";
	for (let i = 0; i < matrix.length; i++) {
		data += matrix[i].toFixed(30);
		if (i !== matrix.length - 1) {
			data += " ";
		}
		if ((i + 1) % 512 === 0 && i !== 0) {
			data += "\n";
		}
	}
	let blob = new Blob([data], { type: "text/plain" });
	let url = URL.createObjectURL(blob);
	let a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
}

function downloadResult() {
	downloadFile(result, "result.txt");
}

function normalize(matrix, min, max, newMin, newMax) {
	const newMatrix = matrix.map(
		(value) => newMin + ((value - min) * (newMax - newMin)) / (max - min)
	);
	return newMatrix;
}

function clip(value, minValue, maxValue) {
	return Math.max(minValue, Math.min(maxValue, value));
}

function convertMatrixToImage(matrix, min, max, canvasId) {
	let canvas = document.getElementById(canvasId);
	let ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 512, 512);
	let imageData = ctx.createImageData(512, 512);

	let { matrixLog, minLog, maxLog } = matrixLogScale(matrix, max, min);

	let matrixImage = matrixLog.map((value) => {
		let color = Math.round(((value - minLog) / (maxLog - minLog)) * 255);
		if (!isFinite(color) || color < 0) {
			return 256;
		}
		return color;
	});

	for (let i = 0; i < 512 * 512; i++) {
		let index = i * 4;
		const color = _viridis_data[matrixImage[i]];
		imageData.data[index + 0] = Math.round(color[0] * 255);
		imageData.data[index + 1] = Math.round(color[1] * 255);
		imageData.data[index + 2] = Math.round(color[2] * 255);
		imageData.data[index + 3] = 255;
	}

	ctx.putImageData(imageData, 0, 0);
}

function matrixLogScale(matrix, max, min) {
	let matrixLog = matrix.map((value) => Math.log10(clip(value, 0, max)));
	let minLog = Math.log10(min);
	let maxLog = Math.log10(max);
	return { matrixLog, minLog, maxLog };
}

async function fetchMyModel(filepathOrUri) {
	// use fetch to read model file (browser) as ArrayBuffer
	if (typeof fetch !== "undefined") {
		const response = await fetch(filepathOrUri, {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods":
				"GET, POST, PUT, DELETE, PATCH, OPTIONS",
			"Access-Control-Allow-Headers":
				"X-Requested-With, Content-Type, Authorization",
		});
		return await response.arrayBuffer();
	}
}

async function loadModel() {
	const model = await fetchMyModel(
		"https://raw.githubusercontent.com/GregoryAd/GhostReflexSim-AI-accelerator/refs/heads/main/model/autoencoder.onnx"
	);
	return await ort.InferenceSession.create("../../model/autoencoder.onnx");
}
