function readFile() {
	let file = document.getElementById("file").files[0];
	let fr = new FileReader();
	fr.onload = async function () {
		let data = fr.result.split("\n");
		let matrix = [];
		let min = Infinity;
		let max = -Infinity;

		for (let i = 0; i < data.length; i++) {
			matrix.push(data[i].split(" ").map(Number));
			min = Math.min(min, ...matrix[i]);
			max = Math.max(max, ...matrix[i]);
		}

        convertInputMatrixToImage(matrix.flat(), min, max);

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                matrix[i][j] = (matrix[i][j] * 1000 - min) / (max - min);
            }
        }

        const session = await loadModel();
        const x = Float32Array.from(matrix.flat());
        const input = new ort.Tensor('float32', x, [1, 512, 512, 1]);
        const y = await session.run({"x": input});
        const output = y.output.data;

		console.log(min, max);
		convertMatrixToImage(output, min, max);
	};

	fr.readAsText(file);
}

function convertMatrixToImage(matrix, min, max) {
	let canvas = document.getElementById("output");
	let ctx = canvas.getContext("2d");
	let imageData = ctx.createImageData(512, 512);

    // rescale the matrix between max and min
    let matrixRescaled = matrix.map((value) => (value / 1000) * (max - min) + min);

	let matrixLog = matrixRescaled.map((value)  => Math.log(value));
	let minLog = Math.log(min);
	let maxLog = Math.log(max);

	let matrixImage = matrixLog.map((value) => Math.round(((value - minLog) / (maxLog - minLog)) * 255));

	for (let i = 0; i < 512*512; i++) {
        let index = i * 4;
        imageData.data[index + 0] = matrixImage[i];
        imageData.data[index + 1] = matrixImage[i];
        imageData.data[index + 2] = matrixImage[i];
        imageData.data[index + 3] = 255;
	}

	ctx.putImageData(imageData, 0, 0);
}


function convertInputMatrixToImage(matrix, min, max) {
	let canvas = document.getElementById("input");
	let ctx = canvas.getContext("2d");
	let imageData = ctx.createImageData(512, 512);

	let matrixLog = matrix.map((value)  => Math.log(value));
	let minLog = Math.log(min);
	let maxLog = Math.log(max);

	let matrixImage = matrixLog.map((value) => Math.round(((value - minLog) / (maxLog - minLog)) * 255));

	for (let i = 0; i < 512*512; i++) {
        let index = i * 4;
        imageData.data[index + 0] = matrixImage[i];
        imageData.data[index + 1] = matrixImage[i];
        imageData.data[index + 2] = matrixImage[i];
        imageData.data[index + 3] = 255;
	}

	ctx.putImageData(imageData, 0, 0);
}

async function loadModel() {
    return await ort.InferenceSession.create('../model/autoencoder.onnx');
}