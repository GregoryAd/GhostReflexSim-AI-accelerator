// function to read file from input file element
function readFile() {
    let file = document.getElementById("file").files[0];
	let fr = new FileReader();
	fr.onload = function () {
		
        let data = fr.result.split("\n");
        let matrix = [];
        let min = Infinity;
        let max = -Infinity;

        for (let i = 0; i < data.length; i++) {
            matrix.push(data[i].split(" ").map(Number));
            min = Math.min(min, ...matrix[i]);
            max = Math.max(max, ...matrix[i]);
        }
        console.log(min, max);
        convertMatrixToImage(matrix, min, max);
	};

	fr.readAsText(file);
}


function convertMatrixToImage(matrix , min, max) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let imageData = ctx.createImageData(matrix[0].length, matrix.length);

    let matrixLog = matrix.map(row => row.map(value => Math.log(value)));
    let minLog = Math.log(min);
    let maxLog = Math.log(max);

    let matrixImage = matrixLog.map(row => row.map(value => Math.round((value - minLog) / (maxLog - minLog) * 255)));

    for (let i = 0; i < matrixImage.length; i++) {
        for (let j = 0; j < matrixImage[i].length; j++) {
            let index = (i * matrixImage[i].length + j) * 4;
            imageData.data[index + 0] = matrixImage[i][j];
            imageData.data[index + 1] = matrixImage[i][j];
            imageData.data[index + 2] = matrixImage[i][j];
            imageData.data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}