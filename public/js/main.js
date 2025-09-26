let session = null;
let map = null;
let resultMap = null;

window.onload = async function () {
	session = await loadModel();
};

async function readMatrixFile() {
	map = await readInputMap("inputMatrix");
	convertMapToImage(map, "input");
}

function downloadResult() {
	if (!resultMap) {
		return;
	}
	downloadMap(resultMap, "result.txt");
}