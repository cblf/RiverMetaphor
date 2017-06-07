
var _nbDocs; // = m
var _nbPoints;
const NB_CONCEPTS = 10; // Le nombre de concepts recueilli est fixé par l'analyse 
var timeMin = 655350;
var timeMax = 0;
var _timespan;

var headerHeight = 100;
var footerHeight = 100;
var canvasWidth;
var canvasHeight;
var originX = 0;
var originY = 0;

var _definition = 1;

var RED;
var WHITE;
var GREEN;
var BLUE;
var YELLOW;
var BLACK;
var _font1;

var path = "data/nysk/";

function DocumentInfo(id) {
	this.docId = id;
	this.timestamp = 0;
	this.position = 0;
	this.conceptScores = Array(NB_CONCEPTS).fill(0);
	this.label = "";
	//this.getInfo = getAppleInfo;
}
var _documentInfos = {};

function HotspotInfo() {
	this.timestamp = 0;
	this.conceptScores = Array(NB_CONCEPTS).fill(0);
	this.topDocsIds = [];
	this.label = "";
}
var _hotspotInfos = {};

var _maxScorePerConcept = Array(NB_CONCEPTS).fill(0);
var _minScorePerConcept = Array(NB_CONCEPTS).fill(65535);

function preload() {
	LoadSentimentData(path + "sentPerDoc.tsv");
	//LoadConceptsData(path + "conceptsPerDoc.tsv");
	//LoadHotspotsData(path + "conceptsPerRange.tsv");

	//_font1 = loadFont("Helvetica");
	//textFont("Arial");
}

function setup() {
	RED = color(255, 0, 0);
	WHITE = color(255, 255, 255);
	GREEN = color(0, 255, 0);
	BLUE = color(0, 0, 255);
	YELLOW = color(255, 255, 0);
	BLACK = color(0, 0, 0);
	_font1;

	createCanvas(1728, 1080);
	canvasWidth = width;
	canvasHeight = height - headerHeight - footerHeight;
	originX = 0;
	originY = 0;//canvasHeight / 2 + headerHeight;


	smooth();
	strokeJoin(ROUND);

	frameRate(1);

	redraw();
}



function draw() {
	//ellipse(50, 50, 80, 80);
	drawConceptsStrengths();
	//drawAxis();
}

function redraw() {
	background(WHITE);
	//drawAffectivePosition2();
	//drawAffectivePosition();
	//drawConceptsStrengths();
	drawAxis();
}

function drawConceptsStrengths() {

	var hsKeys = Object.keys(_hotspotInfos); //_hotspotInfos.keySet().toArray([_hotspotInfos.size()]);////.asList();

	var maxSumOfScores = [0, 0]; // haut et bas
	//maxSumOfScores[1] = 0;

	//print(_hotspotInfos.length);
	for (var i = 0; i < hsKeys.length; i++) {
		//print("echo");
		var sumOfScores = [0, 0];
		var hs = _hotspotInfos[hsKeys[i].toString()];

		var o = 0;
		for (var key in hs.conceptScores) {
			var score = hs.conceptScores[key];
			if (isNaN(score))
				print(key + " is not a number1 " + score);
			_maxScorePerConcept[o] = Math.max(_maxScorePerConcept[o], score);
			_minScorePerConcept[o] = Math.min(_minScorePerConcept[o], score);
			sumOfScores[o++ % 2] += score;
			//if (o % 2 == 0) print(score);
			//print(sumOfScores[o++ % 2]);
		}
		//print(o);
		// Retiens le haut et le bas
		maxSumOfScores[0] = Math.max(sumOfScores[0], maxSumOfScores[0]);
		maxSumOfScores[1] = Math.max(sumOfScores[1], maxSumOfScores[1]);
	}
	//print(maxSumOfScores[0] + " / " + maxSumOfScores[1]);
	originY = headerHeight + round(canvasHeight * maxSumOfScores[0] / (maxSumOfScores[0] + maxSumOfScores[1]));
	//print(originY);
	var sum = Array(2).fill(0).map(x => Array(hsKeys.length).fill(0));

	for (var c = 0; c < NB_CONCEPTS; c++) {
		var strokeWeight = canvasHeight / 400;
		colorMode(HSB, 255);
		var currentColor = color(255 * c / (NB_CONCEPTS), 255, 255, 255);
		colorMode(RGB, 255);
		//PShape s = createShape();    
		beginShape();
		//strokeWeight(8);//strokeWeight);
		stroke(red(currentColor) / 2, green(currentColor) / 2, blue(currentColor) / 2, 127);
		//noFill();
		fill(currentColor);
		curveVertex(0, originY);

		for (var i = 0; i < hsKeys.length; i++) {
			var hs = _hotspotInfos[hsKeys[i].toString()];

			var scaledT = round(((hs.timestamp.toFixed(0) - timeMin) / (timeMax - timeMin)) * canvasWidth);

			var sumOfScores = 0;
			var o = 0;
			for (var key in hs.conceptScores) {
				var score = hs.conceptScores[key];
				if (o++ % 2 == c % 2)
					sumOfScores += score;
			}

			//var  scaledScore = hs.conceptScores[c] / sumOfScores;
			//var  posScore = (1 - sum[c%2][i]) * sumOfScores / maxSumOfScores / 2;
			var amplitude = maxSumOfScores[0] + maxSumOfScores[1];
			var posScore = (sumOfScores - sum[c % 2][i]) / amplitude;

			//print(hs.timestamp + " " + scaledT + " " + hs.conceptScores[c] + "/" + sumOfScores + "=" + scaledScore);
			//print(sumOfScores - sum2[i] + " " + posScore);

			var posX = originX + scaledT;
			var posY = originY - (Math.pow(-1.0, c % 2) * Math.round(posScore * canvasHeight)).toFixed(0);

			curveVertex(posX, posY);
			//print(posX + " " + posY + " " + posScore);

			sum[c % 2][i] += hs.conceptScores[c];
		}
		curveVertex(canvasWidth, originY);
		curveVertex(canvasWidth, originY);

		curveVertex(canvasWidth / 2, originY);
		curveVertex(0, originY);

		curveVertex(0, originY);
		
		endShape();
	}

	// Place les étiquettes sur les max/min
	sum = Array(2).fill(0).map(x => Array(hsKeys.length).fill(0));

	for (var c = 0; c < NB_CONCEPTS; c++) {
		print("concept " + c + " ");
	
		for (var i= 0; i < hsKeys.length; i++)
		{
			print(c + "/" + i);
			var hs = _hotspotInfos[hsKeys[i].toString()];			
			var scaledT = round(((hs.timestamp.toFixed(0) - timeMin) / (timeMax - timeMin)) * canvasWidth);

			var sumOfScores = 0;
			var o= 0;
			for (var c2= 0; c2 < hs.conceptScores.length; c2++)
			{
				var score = hs.conceptScores[c2];
				if (o++ % 2 == c % 2)
					sumOfScores += score;
			}

			//double scaledScore = hs.conceptScores[c] / sumOfScores;
			//double posScore = (1 - sum[c%2][i]) * sumOfScores / maxSumOfScores / 2;
			var amplitude = maxSumOfScores[0] + maxSumOfScores[1];
			var posScore = (sumOfScores - sum[c % 2][i]) / amplitude;
			//if (c == 2)
			//  print(sumOfScores + " " + sum[c%2][i] + " " + amplitude + " " + posScore);

			//print(hs.timestamp + " " + scaledT + " " + hs.conceptScores[c] + "/" + sumOfScores + "=" + scaledScore);
			//print(sumOfScores - sum2[i] + " " + posScore);

			var posX = originX + scaledT;
			var posY = originY - (int)(Math.pow(-1.0, c % 2) * Math.round(posScore * canvasHeight));

			//text("iiizeddddddddddddddddddd", posX, posY + (15 * (c % 2)));
			//text("P" + c + ","+i, posX, posY + (15 * (c % 2)));
			if (sumOfScores < sum[c % 2][i]) {
				print("ERROR");

				text("S" + c, posX, posY + (15 * (c % 2)));
			}

			// Etiquettage
			if (i == 0) {
				text("Début " + c, posX - 120, posY + (15 * (c % 2)));
			}
			if (hs.conceptScores[c] == _maxScorePerConcept[c]) {
				vertex(posX, posY, GREEN);
				text("Max Sujet " + c, posX, posY + (15 * (c % 2)));
				//print("trouvé max sujet " + c + " en " + i + " : " + hs.conceptScores[c]);
			}
			else if (hs.conceptScores[c] == _minScorePerConcept[c]) {
				vertex(posX, posY, RED);
				text("Min Sujet " + c, posX, posY + (15 * (c % 2)));
				//print("trouvé min sujet " + c + " en " + i + " : " + hs.conceptScores[c]);
			}
			else
			{ stroke(0, 0, 255); strokeWeight=40; point(posX, posY); }

			sum[c % 2][i] += hs.conceptScores[c];
		}
	}

	drawAxis();
}



function LoadSentimentData(filePath) {
	var lines = loadStrings(filePath, ParseSentimentData);
}

function ParseSentimentData(lines) {
	var firstLineIndex = 0;
	_nbDocs = lines.length - firstLineIndex;
	print("Le fichier contient " + lines.length + " lignes");
	_nbPoints = _nbDocs; //Math.min(_nbDocs, nbPoints);
	//deltaX = canvasWidth / nb;
	//_documentInfos = new DocumentInfo[definition];
	//_documentInfos = new LinkedHashMap<Integer, DocumentInfo>();

	for (var i = firstLineIndex; i < _nbDocs; i++) {
		var fields = split(lines[i], '\t');
		//DocumentInfo p = new DocumentInfo();
		var id = parseInt(fields[1]);
		var p = new DocumentInfo(id);
		p.docId = parseInt(fields[0]);
		p.timestamp = id;
		p.position = parseFloat(fields[2]);

		//_documentInfos[i] = p;
		_documentInfos[p.docId.toString()] = p;
		//_documentInfos.put(p.docId, p);

		if (p.timestamp < timeMin) timeMin = p.timestamp;
		if (p.timestamp > timeMax) timeMax = p.timestamp;
	}
	_timespan = timeMax - timeMin;
	print("Plage de t : " + timeMin + "," + timeMax);
	//for (var key : _documentInfos.keySet())
	//{
	//  print(_documentInfos.get(key).docId);
	//}

	LoadConceptsData(path + "conceptsPerDoc.tsv");
}

function LoadConceptsData(filePath) {
	var lines = loadStrings(filePath, ParseConceptsData);
}

function ParseConceptsData(lines) {
	print("Le fichier contient " + lines.length + " ligne");

	var firstLineIndex = 1;
	var nbLinesInFile = lines.length - firstLineIndex;

	//var nbDocsPerConcept = (lines.length-firstLineIndex) / nbConcepts;
	//nbDocsPerConcept = Math.min(nbDocsPerConcept, nbPoints);

	for (var i = firstLineIndex; i < nbLinesInFile; i++)
	//i<nbDocsPerConcept; i++)
	{
		var fields = split(lines[i], '\t');
		var conceptId = parseInt(fields[0]);
		if (conceptId < NB_CONCEPTS) {
			var docId = parseInt(fields[1]);
			var p = _documentInfos[docId.toString()];
			//p = _documentInfos[i];
			p.conceptScores[conceptId] = parseFloat(fields[2]);
			p.label = fields[3];
		}
	}

	LoadHotspotsData(path + "conceptsPerRange.tsv");
}

function LoadHotspotsData(filePath) {
	var lines = loadStrings(filePath, ParseHotspotsData);
}

function ParseHotspotsData(lines) {
	var firstLineIndex = 1;
	var nbHotspots = lines.length - firstLineIndex;
	print("Le fichier contient " + lines.length + " ligne");
	//_nbPoints = Math.min(nbHotspots, nb);

	//_hotspotInfos = new LinkedHashMap<Double, HotspotInfo>();
	_hotspotInfos = [];

	var minScore = Math.pow(2, 32);

	for (var i = firstLineIndex; i < nbHotspots; i++) {
		var fields = split(lines[i], '\t');

		var timestamp = parseFloat(fields[1]);
		//print(timestamp + " ");
		var hs = _hotspotInfos[timestamp.toString()];
		if (hs == undefined) {
			hs = new HotspotInfo();
			hs.conceptScores = [NB_CONCEPTS];
			_hotspotInfos[timestamp.toString()] = hs;
		}

		var conceptId = parseInt(fields[0]);
		if (conceptId < NB_CONCEPTS) {
			hs.timestamp = timestamp;
			hs.conceptScores[conceptId] = parseFloat(fields[2]);
			if (hs.conceptScores[conceptId] < minScore)
				minScore = hs.conceptScores[conceptId];
			//if (hs.conceptScores[conceptId] < 0) hs.conceptScores[conceptId] = 0; //TODO
			hs.topDocsIds = null; // TODO!
			hs.label = fields[4]; // topDocs en csv
		}
	}

	// Place la borne min à 0
	for (var timestamp in _hotspotInfos) {
		//print(timestamp);
		//print(_hotspotInfos[timestamp]);
		var hs = _hotspotInfos[timestamp];
		for (var c = 0; c < hs.conceptScores.length; c++) {
			hs.conceptScores[c] -= minScore;
			//if (hs.conceptScores[c] < 0) hs.conceptScores[c] = 0; //TODO
		}
	}
}

function drawAxis() {
	noFill();
	strokeWeight(1);
	stroke(BLACK);
	line(originX, originY, originX + canvasWidth, originY);
	line(originX, headerHeight, originX + canvasWidth, headerHeight);
	line(originX, height - footerHeight, originX + canvasWidth, height - footerHeight);

	// Graduations
	smooth();
	strokeJoin(ROUND);
	var n = _timespan / (60 * 60 * 24); // nb jours
	var n2 = _timespan / (60 * 60 * 2); // nb heures  

	var deltaX = canvasWidth / n2;
	for (var i = 0; i <= n2; i++) {
		var yy = originY - 5; var yy2 = originY + 5;
		strokeWeight(3);
		stroke(color(0, 0, 0, 127));
		line((float)(i * deltaX), yy, (float)(i * deltaX), yy2);
		strokeWeight(1);
		stroke(color(255, 255, 255, 127));
		line((float)(i * deltaX), yy, (float)(i * deltaX), yy2);
	}
	deltaX = canvasWidth / n;
	for (var i = 0; i <= n; i++) {
		var yy = originY - 10; var yy2 = originY + 10;
		strokeWeight(5);
		stroke(color(0, 0, 0, 127));
		line((float)(i * deltaX), yy, (float)(i * deltaX), yy2);
		strokeWeight(1);
		stroke(color(255, 255, 255, 127));
		line((float)(i * deltaX), yy, (float)(i * deltaX), yy2);
	}
}
