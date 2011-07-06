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
	$('.ctype').remove();
	last_x = last_y = spacing;
	row_height = 0;
	for (var i in ctypes) {
		addCtype(ctypes[i], i);
	}

	$('.ctype').easydrag().ondrop(function(e, element) {
		$('header .save').show();
	});
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
				$('#ctype-' + data[i].ctype).css({ left: data[i].left + 'px', top: data[i].top + 'px'});
			}
			$('header .reset').show();
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

$(document).ready(function() {
	canvas = $('#canvas');
	scrollpane = $('#scrollpane');
	
	$(scrollpane).width(window.innerWidth);
	$(scrollpane).height(window.innerHeight - 30);

	getCtypes();
	resetLayout();
	loadLayout();
	
	$('header .reset').click(function() {
		resetLayout();
		$('header .reset').hide();
		$('header .save').show();
		return false;
	});

	$('header .save').click(function() {
		var positions = [];
		$('.ctype').each(function(index, el) {
			positions.push({
				ctype: $(el).attr('id').replace('ctype-', ''),
				left: parseInt($(el).css('left')),
				top: parseInt($(el).css('top'))
			});
		});
		$.get(base_path + 'admin/content/types/schemr/ajax', { r: 'save', d: positions }, function(data) {
			if (data == "OK") {
				alert("Layout saved to server.");
				$('header .save').hide();
			} else {
				alert("Error while saving: " + data + "\nHas your session expired?");
			}
		});
		return false;
	});
});
