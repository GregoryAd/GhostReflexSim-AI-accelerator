function convertMapToImage(map, canvasId) {
	let canvas = document.getElementById(canvasId);
	let ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 512, 512);
	let imageData = ctx.createImageData(512, 512);

	let logScaleMap = map.getLogScaleMap()
	let matrixLog = logScaleMap.matrix;

	let matrixImage = matrixLog.map((value) => {
		let color = Math.round(((value - logScaleMap.nonZeroMin) / (logScaleMap.max - logScaleMap.nonZeroMin)) * 255);
		// console.log(color, logScaleMap.min);
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