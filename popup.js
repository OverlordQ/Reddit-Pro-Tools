

"use strict";

//settings
var settings = {};
var startSettings = {};
getSettings();

var domainText 		= 'add domain here';
var deplorableText 	= 'add subreddit here';

var selected = {
	type: 'subreddits',
	tag:  false
};


$(document).ready(function() {
	drawMenu();
	drawMain();
});



function drawMenu() {
	let tags = getTags(selected.type);
	selected.tag = (selected.tag) ? selected.tag : tags[0];
	
	
	$('.menuType').remove();
	$('.menuTag').remove();
	$('.menuReset').remove();
	
	// menu types
	$.each(menu, function(type, tag) {
		let tags = getTags(type);
		
		let btn = addDeleteBtn('add', 'white', 9).attr('type', type);
		btn.click(function(e) {
			selected.type = $(this).attr('type');
			selected.tag = tag;
			// console.log('set selected:', selected.type, selected.tag);
			
			let input = floatingInput('Add ' + selected.type.replace(/s$/, '') + ' Tags Here');
			
			let div = floatingDiv().append(input);
			$(this).after(div);
			
			div.css({
				left: e.pageX - div.width() / 2 + 'px', 
				top:  e.pageY - div.height() / 2 + 'px'
			});
			
			input.focus().select();
			
			input.keyup(function(e) {
				if (e.which == 13) {
					selected.type = $(e.target).attr('menuType');
					selected.tag = $(this).val();
					
					if (!(selected.tag in settings[selected.type])) {
						// console.log('add tag: ' + selected.tag);
						let tag = newTag(selected.type);
						settings[selected.type][selected.tag] = tag;
						
						drawMenu();
						drawMain();
						saveSettings();
					}
					
					$(this).focusout();
				}
			});
		});
		
		let typeSpan = $('<span/>').addClass('menuType').attr('type', type).text(menu[type].label);
		
		if (type == selected.type) {
			typeSpan.addClass('bold');
		}
		
		typeSpan.click(function(e) {
			// let clicked = $(e.target).text();
			selected.type = $(e.target).attr('type');
			selected.tag = (selected.tag in settings[selected.type]) ? selected.tag : false;
			drawMenu();
			drawMain();
		});
		
		typeSpan.hover(
			function() { $(this).addClass('menuHover'); },
			function() { $(this).removeClass('menuHover'); }
		);
	
		let menuTypeDiv = $('<div/>').addClass('menuType');
		if (type != 'supportrpt') {
			menuTypeDiv.append(btn);
		} else {
			menuTypeDiv.css('margin-left', '15px');
		}
		menuTypeDiv.append(typeSpan);
		$('.menuFrame').append(menuTypeDiv);
		
		// if (type == 'supportrpt') {
			// return true;
		// }
		
		// menu tags
		for (var tag of tags.reverse()) {
			let tagDiv = $('<div/>').addClass('menuTag');
			let btn = addDeleteBtn('delete', 'white', 6).attr({type: type, menuTag: tag});
			
			btn.click(function() {
				let type = $(this).attr('type');
				let tag = $(this).attr('menuTag');
				delete settings[type][tag];
				
				if (type == selected.type && tag == selected.tag) {
					selected.tag = false;
				}
				
				drawMenu();
				drawMain();
				saveSettings();
			});
			
			let tagSpan = $('<span/>').addClass('menuTag').attr({type: type, tag: tag}).text(tag);
			
			// console.log(type, tag, settings[type][tag].enabled);
			
			if (!settings[type][tag].enabled) {
				tagSpan.css('color', '#cccccc');
			}
			
			tagSpan.click(function(e) {
				selected.type = $(this).attr('type');
				selected.tag = $(this).attr('tag');
				// console.log('set selected:', selected.type, selected.tag);
				
				drawMenu();
				drawMain();
			});
	
			tagSpan.hover(
				function() { $(this).addClass('menuHover'); },
				function() { $(this).removeClass('menuHover'); }
			);
		
			tagDiv.append(btn);
			tagDiv.append(tagSpan);
			menuTypeDiv.after(tagDiv);
			
			if (type == selected.type && tag == selected.tag) {
				tagSpan.addClass('bold');
			}
		}
	});
	
	let undoDiv = $('<div/>').attr('id', 'undoDiv').css('cursor', 'pointer').text('Undo Changes');
	undoDiv.click(function(){
		settings = $.extend(true, {}, startSettings);
		saveSettings();
		
		if (!(selected.tag in settings[selected.type])) {
			selected.tag = false;
		}
		
		drawMenu();
		drawMain();
	});
	
	let resetDiv = $('<div/>').attr('id', 'resetDiv').css('cursor', 'pointer').text('Reset to Defaults');
	resetDiv.click(function(){
		settings = $.extend(true, {}, defaultSettings);
		saveSettings();
		
		if (!(selected.tag in settings[selected.type])) {
			selected.tag = false;
		}
		
		drawMenu();
		drawMain();
	});
	
	/*
	let advancedDiv = $('<div/>').css({cursor: 'pointer', position: 'relative'}).text('Advanced Settings');
	
	advancedDiv.click(function(e){
		let div = floatingDiv().append($('<div/>').css('margin-bottom', '5px').text('Copy settings to clipboard:'));
		
		div.mouseleave(function() {
			$(this).remove();
		});
		
		let btnDiv = $('<div/>');
		let copyBtn = $('<input/>').addClass('settingsInput').attr({type: 'submit'}).val('Copy');
		let pasteBtn = $('<input/>').addClass('settingsInput').attr({type: 'submit'}).val('Paste');
		btnDiv.append(copyBtn, pasteBtn);
		
		$(this).after(div.append(btnDiv));
		div.css({
			left: e.pageX - div.width() / 2 + 'px', 
			top:  e.pageY - div.height() * 5 / 6 + 'px'
		});
		
		copyBtn.click(function() {
			let data = JSON.stringify(settings, null, '\t');
			let textArea = $('<textarea>').val(data);
			$(this).after(textArea);
			textArea.select();
			document.execCommand("Copy");
			div.remove();
		});
		
		pasteBtn.click(function() {
			console.log('paste click');
			div.remove();
		});
	});
	
	let undoResetDiv = $('<div/>').addClass('menuReset').append([advancedDiv, undoDiv, resetDiv]);
	*/
	let undoResetDiv = $('<div/>').addClass('menuReset').append([undoDiv, resetDiv]);
	$('.menuFrame').append(undoResetDiv);
	
	if (settingsEqual(startSettings)) {
		$('#undoDiv').hide();
	}
	
	if (settingsEqual(defaultSettings)) {
		$('#resetDiv').hide();
	}
		
	setTimeout(function(){ setMenuSize(); }, 10);
}

function drawMain() {
	let tags = getTags(settings[selected.type]);
	if (selected.tag == false) {
		selected.tag = tags[0];
	}
	
	$('.mainFrame').empty();
	
	// console.log('selected.type:');
	// console.log('type:', selected.type);
	// console.log(menu[selected.type]);
	// console.log(menu[selected.type].desc);
	
	// mainFrame header
	let header = $('<div/>').addClass('header').text(menu[selected.type].label);
	let desc   = $('<div/>').addClass('description').text(menu[selected.type].desc);
	let banner = $('<div/>').addClass('banner');
	let tag    = $('<div/>').addClass('tagname').text(selected.tag);
	$(banner).append(header);
	$(banner).append(desc);
	
	$(banner).append(tag);
	$('.mainFrame').append(banner);
	
	// if no selected tag, skip printing the rest of the settings page
	if (!selected.tag) { return; }
	
	//mainFrame settings
	let table = $('<table/>');
	if (selected.type == 'accountage') {
		let trs = basicSettings();
		
		trs.push(tableRow([settingsLabel('Account Age'), tableData([selectBox('gtlt', settings[selected.type][selected.tag].gtlt), 'than ', textBox('age', settings[selected.type][selected.tag].age), ' (days)'])]));
		
		table.append(trs);
		$('.mainFrame').append(table);

	} else if (selected.type == 'subkarma' || selected.type == 'karma') {
		let trs = basicSettings();
		
		trs.push(tableRow([settingsLabel('Karma'), tableData([selectBox('avgtotal', settings[selected.type][selected.tag].avgtotal), selectBox('gtlt', settings[selected.type][selected.tag].gtlt), 'than ', textBox('karma', settings[selected.type][selected.tag].karma)])]));
		
		table.append(trs);
		$('.mainFrame').append(table);
		
	} else if (selected.type == 'subreddits') {
		let trs = basicSettings();
		
		trs.push(tableRow([settingsLabel('Karma'), tableData([selectBox('avgtotal', settings[selected.type][selected.tag].avgtotal), selectBox('gtlt', settings[selected.type][selected.tag].gtlt), 'than ', textBox('karma', settings[selected.type][selected.tag].karma)])]));
		trs.push(settingsListTr('Subreddits'));
		
		table.append(trs);
		$('.mainFrame').append(table);		
		
	} else if (selected.type == 'domains') {
		let trs = basicSettings();
		
		trs.push(settingsListTr('Domains'));
		
		table.append(trs);
		$('.mainFrame').append(table);
	}
}

function addDeleteBtn(btnType, color, offset = 3) {
	let btn = $('<div/>').addClass('button').css('top', offset).html('&nbsp;');
	btn.css('background-image',	'url("images/' + btnType + '-' + color + '.png")');
	
	btn.hover(
		function() {
			btn.css('background-image',	'url("images/' + btnType + '-' + color + '-hover.png")');
		},
		function() {
			btn.css('background-image',	'url("images/' + btnType + '-' + color + '.png")');
		}
	);
	
	return btn;
}

function setMenuSize() {
	$('.menuFrame').css('width', 'auto');
	$('.menuFrame').css('width', $('.menuFrame').width() + 20);
	$('.mainLayout').css('height', $(window).height());
}

function basicSettings() {
	let trs = [];
	trs.push(tableRow([settingsLabel('Enabled'), tableData(checkbox(settings[selected.type][selected.tag].enabled))]));
	trs.push(tableRow([settingsLabel('Tag Color'), tableData([textBox('color', settings[selected.type][selected.tag].color), colorDisp('color', settings[selected.type][selected.tag].color)])]));
	trs.push(tableRow([settingsLabel('Text Color'), tableData([textBox('tcolor', settings[selected.type][selected.tag].tcolor), colorDisp('tcolor', settings[selected.type][selected.tag].tcolor)])]));
	
	return trs;
}

function tableRow(tds) {
	let tr = $('<tr/>');
	$.each(tds, function(index, td) {
		tr.append(td);
	});
	return tr;
}

function tableData(data) {
	return $('<td/>').html(data);
}

function settingsLabel(label) {
	return $('<td/>').addClass('settingsLabel').css('white-space', 'nowrap').text(label + ':')
}





function checkbox(checked) {
	let input = $('<input/>').addClass('settingsInput').attr({type: 'checkbox', id: 'enabled'}).prop('checked', checked);
	
	input.change(function(e) {
		settings[selected.type][selected.tag].enabled = $(this).prop('checked');
		drawMenu();
	});
	
	input.focusout(function() {
		saveSettings();
	});
	
	input.change(function() {
		saveSettings();
	});
	
	return input;
}

function textBox(id, value) {
	let input = $('<input/>').addClass('settingsInput textInput').attr({type: 'text', id: id}).val(value);
	
	input.keyup(function(e) {
		settings[selected.type][selected.tag][id] = $(this).val();
		
		// if this is one of the hex color inputs, check that it is hex and set the colorDisp to reflect that change
		let regex = /^[A-F0-9]{6}$/ig;
		if ((id == color || id == 'tcolor') && regex.test($(this).val())) {
			$('#' + id + 'Disp').css('background-color', '#' + $(this).val())
		}
		
		drawMenu();
	});
	
	input.focusout(function() {
		saveSettings();
	});
	
	return input;
}

function selectBox(id, value) {
	let options = {
		gtlt: ['greater', 'less'],
		avgtotal: ['average', 'total']
	}
	let select = $('<select/>').addClass('settingsInput').attr({id: id});
	
	options[id].forEach(function(type) {
		let option = $('<option/>').html(type);
		select.append(option);
	});
	select.val(value);
	
	select.change(function(e) {
		settings[selected.type][selected.tag][id] = $(this).val();
		drawMenu();
	});
	
	select.focusout(function() {
		saveSettings();
	});
	
	return select;
}






function settingsListTr(label) {
	let btn = addDeleteBtn('add', 'blue', 7).attr({type: selected.type, tag: selected.tag});
	
	btn.click(function(e) {
		let input = floatingInput('Add ' + menu[selected.type].label + ' Here');
		
		let div = floatingDiv().append(input);
		$(this).after(div);
		
		div.css({
			left: e.pageX - div.width() / 2 + 'px', 
			top:  e.pageY - div.height() / 2 + 'px'
		});
		
		
		
		$(this).after(div);
		input.focus().select();
		input.keyup(function(e) {
			if (e.which == 13) {
				let item = $(this).val();
				
				if (!(item in settings[selected.type][selected.tag].list)) {
					if (selected.type == 'domains') {
						item = item.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*/, '').toLowerCase();
					}
					
					if (!settings[selected.type][selected.tag].list.includes(item)) { 
						settings[selected.type][selected.tag].list.push(item);
						
						drawMenu();
						drawMain();
						saveSettings();
					}
				}
				
				$(this).focusout();
			}
		});
	});
	
	return tableRow([
		settingsLabel(label).prepend(btn),
		tableData(settingsList()).css('padding-top', 4 + 'px')
	]);
}

function floatingInput(label) {
	let input = $('<input>').attr({type: 'text', menuType: selected.type}).val(label);
	if (selected.tag) {
		input.attr('menuTag', selected.tag);
	}
	
	input.focusout(function() {
		input.parent().remove();
	});
	
	return input;
}

function floatingDiv() {
	let div = $('<div/>').addClass('floatingDiv border'); // position: 'absolute', 
	return div;
}


function settingsList() {
	let list = settings[selected.type][selected.tag].list;
	
	list = list.sort(function (a, b) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});
	
	let divs = [];
	list.forEach(function(item){
		let btn = addDeleteBtn('delete', 'blue', 5);
		
		btn.click(function(){
			var index = settings[selected.type][selected.tag].list.indexOf(item);
			if (index !== -1) settings[selected.type][selected.tag].list.splice(index, 1);
			
			drawMenu();
			drawMain();
			saveSettings();
		});
		
		let itemText = $('<span/>').text(item);
		if (selected.type == 'subreddits') {
			itemText = $('<a/>').attr('href', 'http://reddit.com/r/' + item).text(item);
		
		} else if (selected.type == 'domains') {
			itemText = $('<a/>').attr('href', 'http://' + item).text(item);
		}
		
		let div = $('<div/>').addClass('listItem').append([btn, itemText]);
		divs.push(div);
	});
	
	return divs;
}

function colorDisp(type, color) {
	let div = $('<div/>').attr('id', type + 'Disp').addClass('settingsInput colorDisp').css('background-color', '#' + color).html('&nbsp;');
	
	div.hover(
		function() {
			$(this).addClass('colorDispHover');
		},
		function() {
			$(this).removeClass('colorDispHover');
		}
	);
	
	div.click(function(e) {
		let pickerDiv = floatingDiv().attr('id', 'colorPicker').css('padding', '5px');
		
		pickerDiv.mouseleave(function(){
			pickerDiv.remove();
		});
		
		let numRows = 8;
		let numCols = 8;
		let s = 100;
		let v = 50;
		let offset = 0;
		
		for (let i = 0; i < numRows; i++) {
			let rowDiv = $('<div/>');
			
			let grey = componentToHex(Math.round(i / (numRows - 1) * 255));
			let colorDiv = colorSwatch(type, '#' + grey + grey + grey);
			rowDiv.append(colorDiv);
			
			let v = i * 80 / numRows + 20;
			for (let h = 0; h < 360; h += 360 / numCols) {
				colorDiv = colorSwatch(type, 'hsl(' + h + ', ' + s + '%, ' + v + '%)');
				rowDiv.append(colorDiv);
			}
			pickerDiv.append(rowDiv);
		}
		
		$(this).after(pickerDiv);
		
		pickerDiv.css({
			left: e.pageX - pickerDiv.width() / 2 + 'px', 
			top:  e.pageY - pickerDiv.height() / 2 + 'px'
		});
	});
	
	
	return div;
}


function colorSwatch(type, color) {
	let div = $('<div/>').addClass('colorBox border').css('background-color', color).html('&nbsp;');
	
	div.click(function() {
		let rgb = div.css('background-color').replace(/.*\(/, '').replace(/\).*/, '').split(/,\s*/);
		
		let hex = rgb2Hex(rgb);
		settings[selected.type][selected.tag][type] = hex;
		
		saveSettings();
		drawMenu();
		drawMain();
	});
	
	return div;
}

function rgb2Hex(rgb) {
	 return componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

function componentToHex(c) {
	c = parseInt(c, 10);
    let hex = c.toString(16);
	
    return hex.length == 1 ? "0" + hex : hex;
}







function newTag(type) {
	let color = 'ff6666';
	let tcolor = 'ffffff';
	
	let tag = {
		enabled: 	true,
		tcolor:		tcolor,
		color: 		color
	};
	
	if (type == 'subreddits' || type == 'domains') {
		tag.list = [];
	}
	if (type == 'subreddits' || type == 'karma' || type == 'subkarma') {
		jQuery.extend(tag, {
			avgtotal:	'total',
			gtlt: 		'greater',
			karma:		400
		});
	} else if (type == 'accountage') {
		jQuery.extend(tag, {
			gtlt: 		'less',
			karma: 		100,
			age:		5
		});
	}
	
	return tag;
}

function getTags(type) {
	let keys = []
	for (var key in settings[type]) {
		keys.push(key);
	}
	
	keys = keys.sort(function (a, b) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});
	
	return keys;
}









