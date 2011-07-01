var canvas;
var ctx;
var x = 75;
var y = 50;
var WIDTH = 400;
var HEIGHT = 300;
var dragok = false;

var ctypes = [];

// Our layout needs are primitive for now. We expect the user to do some re-arranging, so for now we
// just generally
var spacing = 15;
var last_x = 15;
var last_y = 15;
var row_height = 0;

function addCtype(entry, i) {
	var id = 'ctype-' + entry.type;
	var html = '<div class="ctype" id="' + id + '" style="z-index: ' + (5+parseInt(i)) + '">';

	html += '<h2>' + entry.label + '</h2>';
	
	for (i = 0; i < entry.groups.length; i++) {
		html += '<div class="group group-' + (i % 6) + ' group-' + entry.groups[i].name + '">';
		html += '<h3>' + entry.groups[i].label + '</h3>';
		html += '<table cellpadding="0" cellspacing="0">';
		for (j = 0; j < entry.groups[i].fields.length; j++) {
			html += '<tr>';
			html += '<td class="name">' + entry.groups[i].fields[j].machine_name + '</td>';
			html += '<td class="multiple">' + (entry.groups[i].fields[j].multiple == 1 ? '&#8734;' : '') + '</td>';
			html += '<td class="shared">' + (entry.groups[i].fields[j].shared == 1 ? '<a href="#" title="Shared by other types">&sect;</a>' : '') + '</td>';
			html += '<td class="type">' + entry.groups[i].fields[j].type + '</td>';
			html += '</tr>';
		}
		html += '</table></div>';
	}
	
	html += '</div>';
	
	$('#scrollpane').append(html);
	
	var width = $('#' + id).width();
	var height = $('#' + id).height();
	
	if (last_x + width >= $('#scrollpane').width()) {
		last_y += row_height + spacing;
		last_x = spacing;
		row_height = 0;
	}
	
	$('#' + id).css({left: last_x + 'px', top: last_y + 'px'});
	last_x += width + spacing;
}

function getCtypes() {
	$.getJSON(base_path + 'admin/content/types/schemr/ajax', { r: 'types' }, function(data) {
		last_x = last_y = spacing;
		row_height = 0;
		for (var i in data) {
			addCtype(data[i], i);
			console.log(data[i]);
		}
	});
}

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

	getCtypes();	
	
	redrawCanvas();

	canvas.onmousedown = myDown;
	canvas.onmouseup = myUp;
});
