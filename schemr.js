var canvas;
var scrollpane;
var dragok = false;
var ctypes = [];
var spacing = 15;
var last_x = 15;
var last_y = 15;
var row_height = 0;

function addCtype(entry, i) {
	var id = 'ctype-' + entry.type;
	var html = '<div class="ctype" id="' + id + '" style="z-index: ' + (5+parseInt(i)) + '">';

	html += '<h2>' + entry.label + ' (' + entry.type + ')</h2>';
	
	html += '<table cellpadding="0" cellspacing="0">';
	for (i = 0; i < entry.groups.length; i++) {
		html += '<tr class="group group-' + (i % 6) + ' group-' + entry.groups[i].name + '"><td colspan="5"><h3>' + entry.groups[i].label + '</h3></td></tr>';
		for (j = 0; j < entry.groups[i].fields.length; j++) {
			html += '<tr class="group group-' + (i % 6) + ' group-' + entry.groups[i].name + '">';
			html += '<td class="name">' + entry.groups[i].fields[j].machine_name + '</td>';
			html += '<td class="multiple">' + (entry.groups[i].fields[j].multiple == 1 ? '&#8734;' : '') + '</td>';
			html += '<td class="shared">' + (entry.groups[i].fields[j].shared == 1 ? '<a href="#" title="Shared by other types">&sect;</a>' : '') + '</td>';
			html += '<td class="type">' + entry.groups[i].fields[j].type + '</td>';
			html += '<td class="notes">' + entry.groups[i].fields[j].notes + '</td>';
			html += '</tr>';
		}
	}
	html += '</table>';
	
	html += '</div>';
	
	$('#canvas').append(html);
	
	var width = $('#' + id).width();
	var height = $('#' + id).height();
	
	if (last_x + width >= $('#canvas').width()) {
		last_y += row_height + spacing;
		last_x = spacing;
		row_height = 0;
	}
	
	$('#' + id).css({left: last_x + 'px', top: last_y + 'px'});
	last_x += width + spacing;
	if (height > row_height) row_height = height;
}

function resetLayout() {
	last_x = last_y = spacing;
	row_height = 0;
	for (var i in ctypes) {
		addCtype(ctypes[i], i);
	}
}

function loadLayout() {
	$.ajax({
		url: base_path + 'admin/content/types/schemr/ajax',
		dataType: 'json',
		data: { r: 'load' },
		async: false,
		success: function(data) {
			for (var i in data) {
				var id = '#ctype-' + data[i].ctype;
				$('#ctype-' + data[i].ctype).css({ left: data[i].x + 'px', top: data[i].y + 'px'});
			}
		}
	});
}

function getCtypes() {
	$.ajax({
		url: base_path + 'admin/content/types/schemr/ajax',
		dataType: 'json',
		data: { r: 'types' },
		async: false,
		success: function(data) {
			ctypes = data;
		}
	});
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
	
	$('header .reset').show();
}

$(document).ready(function() {
	canvas = $('#canvas');
	scrollpane = $('#scrollpane');
	
	$(scrollpane).width(window.innerWidth);
	$(scrollpane).height(window.innerHeight - 30);

	getCtypes();
	resetLayout();
	loadLayout();
	$('.ctype').jqDrag();
});
