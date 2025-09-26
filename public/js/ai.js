async function runModelInference() {
	if (!map) {
		return;
	}
	let oldNonZeroMin = map.nonZeroMin;
	let oldMax = map.max;
	map.normalize(0, 1000);

	const x = Float32Array.from(map.matrix);
	const input = new ort.Tensor("float32", x, [1, 512, 512, 1]);

	const y = await session.run({ x: input });
	const output = y.output.data;

	resultMap = new Map(output);
	resultMap.normalize(oldNonZeroMin, oldMax);

	convertMapToImage(resultMap, "output");

	return output;
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
	return await ort.InferenceSession.create(model);
}