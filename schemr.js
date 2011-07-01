var canvas;
var ctx;
var x = 75;
var y = 50;
var WIDTH = 400;
var HEIGHT = 300;
var dragok = false;

var tables = [];

function drawCType(x,y,w,h) {
	ctx.beginPath();
	ctx.rect(x,y,w,h);
	ctx.closePath();
	ctx.fill();
}

function rect(x,y,w,h) {
	ctx.beginPath();
	ctx.rect(x,y,w,h);
	ctx.closePath();
	ctx.fill();
}

function clear() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function redrawCanvas() {
	// TODO: Dynamically set the canvas size to fit all of the tables' extents
	ctx.canvas.width  = WIDTH;
	ctx.canvas.height = HEIGHT;

	clear();
	ctx.fillStyle = "#FAF7F8";
	rect(0,0,WIDTH,HEIGHT);
	ctx.fillStyle = "#444444";
	rect(x - 15, y - 15, 30, 30);
}

function myMove(e){
	if (dragok){
		x = e.pageX - canvas.offsetLeft;
		y = e.pageY - canvas.offsetTop;
		redrawCanvas();
	}
}

function myDown(e){
	if (e.pageX < x + 15 + canvas.offsetLeft &&
		e.pageX > x - 15 + canvas.offsetLeft &&
		e.pageY < y + 15 + canvas.offsetTop &&
		e.pageY > y -15 + canvas.offsetTop) {
		x = e.pageX - canvas.offsetLeft;
		y = e.pageY - canvas.offsetTop;
		dragok = true;
		canvas.onmousemove = myMove;
	}
}

function myUp(){
	dragok = false;
	canvas.onmousemove = null;
}

$(document).ready(function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	
	scrollpane = document.getElementById('scrollpane');
	scrollpane.style.width = window.innerWidth + 'px';
	scrollpane.style.height = (window.innerHeight-35) + 'px';

	WIDTH = window.innerWidth + 100;
	HEIGHT = window.innerHeight-35 + 100; // Should be 30, but for some reason we get scrollbars until we expand a bit
	
	redrawCanvas();

	canvas.onmousedown = myDown;
	canvas.onmouseup = myUp;
});
