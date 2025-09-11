const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function isFormula(cell) {
	return typeof cell.v === 'string' && typeof cell.f === 'string';
}

function summarizeWorkbook(filePath) {
	const workbook = XLSX.readFile(filePath, { cellFormula: true, cellHTML: false, cellText: true });
	const summary = [];
	for (const sheetName of workbook.SheetNames) {
		const sheet = workbook.Sheets[sheetName];
		let formulaCount = 0;
		let totalCells = 0;
		Object.keys(sheet)
			.filter((k) => !k.startsWith('!'))
			.forEach((addr) => {
				const cell = sheet[addr];
				totalCells += 1;
				if (cell && typeof cell.f === 'string') formulaCount += 1;
			});
		summary.push({ sheetName, totalCells, formulaCount });
	}
	return summary;
}

function extractFormulas(filePath, limitPerSheet = 50) {
	const workbook = XLSX.readFile(filePath, { cellFormula: true });
	const result = {};
	for (const sheetName of workbook.SheetNames) {
		const sheet = workbook.Sheets[sheetName];
		const formulas = [];
		Object.keys(sheet)
			.filter((k) => !k.startsWith('!'))
			.forEach((addr) => {
				const cell = sheet[addr];
				if (cell && typeof cell.f === 'string') {
					formulas.push({ address: addr, formula: cell.f });
				}
			});
		result[sheetName] = formulas.slice(0, limitPerSheet);
	}
	return result;
}

if (require.main === module) {
	const filename = process.argv[2];
	if (!filename) {
		console.error('Usage: node scripts/read_excel.js <path-to-xlsx>');
		process.exit(1);
	}
	const filePath = path.resolve(process.cwd(), filename);
	if (!fs.existsSync(filePath)) {
		console.error('File not found:', filePath);
		process.exit(1);
	}
	const summary = summarizeWorkbook(filePath);
	console.log(JSON.stringify({ summary }, null, 2));
	const formulas = extractFormulas(filePath, 100);
	console.log(JSON.stringify({ formulas }, null, 2));
}

module.exports = { summarizeWorkbook, extractFormulas };



