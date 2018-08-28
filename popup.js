

"use strict";

//settings
var settings = {};
var startSettings = {};
getSettings();

var domainText 		= 'add domain here';
var deplorableText 	= 'add subreddit here';

var menuItems = {
	'Support RPT': {
		name:	'supportrpt',
		desc:	'Support Reddit Pro Tools'
	},
	'Subreddits': {
		name: 	'subreddits',
		desc: 	'Tags based on karma in specific subreddits'
	},
	'Domains': {
		name: 	'domains',
		desc: 	'Tags based on link domains'
	},
	'Karma': {
		name:	'karma',
		desc:	'Tags based on karma for the entire account'
	},
	'Sub Karma': {
		name:	'subkarma',
		desc:	'Tags based on karma in the current subreddit'
	},
	'Account Age': {
		name:	'accountage',
		desc:	'Tags based on account age'
	}
};

var selected = {
	type: 'Subreddits',
	tag:  false
};


$(document).ready(function() {
	drawMenu(selected.type);
	showFrame(selected.type);
});



function drawMenu(menuType, menuTag = false) {
	let menuName = menuItems[menuType].name;
	let tags = getTags(settings[menuName]);
	menuTag = (menuTag) ? menuTag : tags[0];
	
	selected.type = menuType;
	selected.tag = menuTag;
	// console.log('set selected:', selected.type, selected.tag);
	
	$('.menuType').remove();
	$('.menuTag').remove();
	$('.menuReset').remove();
	
	// menu types
	$.each(menuItems, function(menuType, tag) {
		let tags = getTags(settings[tag.name]);
		
		let btn = addDeleteBtn('add', 'white', 9).attr('menuType', menuType);
		btn.click(function() {
			let menuType = $(this).attr('menuType');
			selected.type = menuType;
			selected.tag = tag;
			// console.log('set selected:', selected.type, selected.tag);
			
			let input = floatingInput('Add ' + menuType.replace(/s$/, '') + ' Tags Here', menuType);
			let div = floatingDiv($(this).position().top, $(this).position().left);
			
			$(this).after(div.append(input));
			input.focus().select();
			
			input.keyup(function(e) {
				if (e.which == 13) {
					let menuType = $(e.target).attr('menuType');
					let menuTag = $(this).val();
					let menuName = menuItems[menuType].name;
					
					
					if (!(menuTag in settings[menuName])) {
						console.log('add tag: ' + menuTag);
						let tag = newTag(menuName);
						settings[menuName][menuTag] = tag;
						
						drawMenu(menuType, menuTag);
						showFrame(menuType, menuTag);
						saveSettings();
						$('#undoDiv').show();
					}
					
					$(this).focusout();
				}
			});
		});
		
		let typeSpan = $('<span/>').addClass('menuType').attr('id', 'menuType_' + tag.name).text(menuType);
		
		if (menuType == selected.type) {
			typeSpan.addClass('bold');
		}
		
		typeSpan.click(function(e) {
			let clicked = $(e.target).text();
			selected.type = clicked;
			drawMenu(clicked);
			showFrame(clicked);
		});
		
		typeSpan.hover(
			function() { $(this).addClass('menuHover'); },
			function() { $(this).removeClass('menuHover'); }
		);
	
		let menuTypeDiv = $('<div/>').addClass('menuType');
		menuTypeDiv.append(btn);
		menuTypeDiv.append(typeSpan);
		$('.menuFrame').append(menuTypeDiv);
		
		
		// menu tags
		for (var menuTag of tags.reverse()) {
			let tagDiv = $('<div/>').addClass('menuTag');
			let btn = addDeleteBtn('delete', 'white', 5).attr({menuType: menuType, menuTag: menuTag});
			
			btn.click(function() {
				let menuType = $(this).attr('menuType');
				let menuTag = $(this).attr('menuTag');
				
				delete settings[menuItems[menuType].name][menuTag];
				
				if (menuType == selected.type && menuTag == selected.tag) {
					selected.tag = false;
				}
				
				drawMenu(menuType);
				showFrame(menuType);
				saveSettings();
				$('#undoDiv').show();
			});
			
			let tagSpan = $('<span/>').addClass('menuTag').attr({menuType: menuType, menuTag: menuTag}).text(menuTag);
			
			tagSpan.click(function(e) {
				selected.type = $(this).attr('menuType');
				selected.tag = $(this).attr('menuTag');
				// console.log('set selected:', selected.type, selected.tag);
				
				drawMenu(selected.type, selected.tag);
				showFrame(selected.type, selected.tag);
			});
	
			tagSpan.hover(
				function() { $(this).addClass('menuHover'); },
				function() { $(this).removeClass('menuHover'); }
			);
		
			tagDiv.append(btn);
			tagDiv.append(tagSpan);
			menuTypeDiv.after(tagDiv);
			
			if (menuType == selected.type && menuTag == selected.tag) {
				tagSpan.addClass('bold');
			}
		}
	});
	
	let undoDiv = $('<div/>').attr('id', 'undoDiv').css('cursor', 'pointer').text('Undo Changes');
	undoDiv.click(function(){
		console.log('undo');
		console.log(startSettings);
		
		settings = $.extend(true, {}, startSettings);
		saveSettings();
		
		drawMenu(selected.type, selected.tag);
		showFrame(selected.type, selected.tag);
	});
	
	let resetDiv = $('<div/>').css('cursor', 'pointer').text('Reset to Defaults');
	resetDiv.click(function(){
		console.log('reset');
		
		settings = $.extend(true, {}, defaults);
		saveSettings();
		
		drawMenu(selected.type);
		showFrame(selected.type);
	});
	
	let undoResetDiv = $('<div/>').addClass('menuReset');
	$('.menuFrame').append(undoResetDiv.append([undoDiv, resetDiv]));
		
	setTimeout(function(){ setMenuWidth(); }, 10);
}

function showFrame(menuType, menuTag = false) {
	let menuName = menuItems[menuType].name;
	let tags = getTags(settings[menuName]);
	if (menuTag == false) {
		menuTag = tags[0];
	}
	
	$('.mainFrame').empty();
	
	// mainFrame header
	let header = $('<div/>').addClass('header').text(menuType);
	let desc   = $('<div/>').addClass('description').text(menuItems[menuType].desc);
	let banner = $('<div/>').addClass('banner');
	let tag    = $('<div/>').addClass('tagname').text(menuTag)
	$(banner).append(header);
	$(banner).append(desc);
	$(banner).append(tag);
	$('.mainFrame').append(banner);
	
	if (!(menuTag in settings[menuName])) {
		setWidth();
		return;
	}
	
	//mainFrame settings
	let table = $('<table/>');
	// let tr;
	if (menuName == 'accountage') {
		let trs = basicSettings(menuName, menuTag, table);
		
		trs.push(tableRow([settingsLabel('Account Age'), tableData([gtlt(settings[menuName][menuTag].gtlt), 'than ', textBox('age', settings[menuName][menuTag].age), ' (days)'])]));
		
		table.append(trs);
		$('.mainFrame').append(table);
		
		$('.settingsInput').focusout(function(e){
			settings[menuName][menuTag].enabled = $('#enabled').prop('checked');
			settings[menuName][menuTag].color = $('#color').val();
			settings[menuName][menuTag].tcolor = $('#tcolor').val();
			settings[menuName][menuTag].gtlt = $('#gtlt').val();
			settings[menuName][menuTag].age = $('#age').val();
			$('#colorDisp').css('background-color', '#' + $('#color').val());
			$('#tcolorDisp').css('background-color', '#' + $('#tcolor').val());
			
			saveSettings();
			$('#undoDiv').show();
		});

	} else if (menuName == 'subkarma' || menuName == 'karma') {
		let trs = basicSettings(menuName, menuTag, table);
		
		trs.push(tableRow([settingsLabel('Karma'), tableData([avgtotal(settings[menuName][menuTag].avgtotal), gtlt(settings[menuName][menuTag].gtlt), 'than ', textBox('karma', settings[menuName][menuTag].karma)])]));
		
		table.append(trs);
		$('.mainFrame').append(table);
		
		$('.settingsInput').focusout(function(e){
			settings[menuName][menuTag].enabled 	= $('#enabled').prop('checked');
			settings[menuName][menuTag].color 		= $('#color').val();
			settings[menuName][menuTag].tcolor 		= $('#tcolor').val();
			settings[menuName][menuTag].avgtotal 	= $('#avgtotal').val();
			settings[menuName][menuTag].gtlt 		= $('#gtlt').val();
			settings[menuName][menuTag].karma 		= $('#karma').val();
			
			$('#colorDisp').css('background-color', '#' + $('#color').val());
			$('#tcolorDisp').css('background-color', '#' + $('#tcolor').val());
			
			saveSettings();
			$('#undoDiv').show();
		});
		
	} else if (menuName == 'subreddits') {
		let trs = basicSettings(menuName, menuTag, table);
		
		trs.push(tableRow([settingsLabel('Karma'), tableData([avgtotal(settings[menuName][menuTag].avgtotal), gtlt(settings[menuName][menuTag].gtlt), 'than ', textBox('karma', settings[menuName][menuTag].karma)])]));
		trs.push(settingsListTr('Subreddits', menuType, menuTag));
		
		table.append(trs);
		$('.mainFrame').append(table);
		
		$('.settingsInput').focusout(function(e){
			settings[menuName][menuTag].enabled 	= $('#enabled').prop('checked');
			settings[menuName][menuTag].color 		= $('#color').val();
			settings[menuName][menuTag].tcolor 		= $('#tcolor').val();
			settings[menuName][menuTag].avgtotal 	= $('#avgtotal').val();
			settings[menuName][menuTag].gtlt 		= $('#gtlt').val();
			settings[menuName][menuTag].karma 		= $('#karma').val();
			
			$('#colorDisp').css('background-color', '#' + $('#color').val());
			$('#tcolorDisp').css('background-color', '#' + $('#tcolor').val());
			
			saveSettings();
			$('#undoDiv').show();
		});
		
	} else if (menuName == 'domains') {
		let trs = basicSettings(menuName, menuTag, table);
		
		trs.push(settingsListTr('Domains', menuType, menuTag));
		
		table.append(trs);
		$('.mainFrame').append(table);
		
		$('.settingsInput').focusout(function(e){
			settings[menuName][menuTag].enabled 	= $('#enabled').prop('checked');
			
			$('#colorDisp').css('background-color', '#' + $('#color').val());
			$('#tcolorDisp').css('background-color', '#' + $('#tcolor').val());
			
			saveSettings();
			$('#undoDiv').show();
		});
	}
	setWidth();
}

function addDeleteBtn(type, color, offset = 3) {
	let btn = $('<div/>').addClass('button').css('top', offset).html('&nbsp;');
	btn.css('background-image',	'url("images/' + type + '-' + color + '.png")');
	
	btn.hover(
		function() {
			btn.css('background-image',	'url("images/' + type + '-' + color + '-hover.png")');
		},
		function() {
			btn.css('background-image',	'url("images/' + type + '-' + color + '.png")');
		}
	);
	
	return btn;
}

function setMenuWidth() {
	$('.menuFrame').css('width', 'auto');
	$('.menuFrame').css('width', $('.menuFrame').width() + 20);
}

function setWidth() {
	let width = 700;
	let sbWidth = 34;
	
	// if scrollbar is visible...
	if ($(document).height() > $(window).height()) {
		$('html').css('min-width', width - sbWidth);
	} else {
		$('html').css('min-width', width);
	}
}

function basicSettings(menuName, menuTag, table) {
	let trs = [];
	trs.push(tableRow([settingsLabel('Enabled'), tableData(enabled(settings[menuName][menuTag].enabled))]));
	trs.push(tableRow([settingsLabel('Tag Color'), tableData([textBox('color', settings[menuName][menuTag].color), colorDisp('colorDisp', settings[menuName][menuTag].color)])]));
	trs.push(tableRow([settingsLabel('Text Color'), tableData([textBox('tcolor', settings[menuName][menuTag].tcolor), colorDisp('tcolorDisp', settings[menuName][menuTag].tcolor)])]));	
	
	// trs.push(tableRow([settingsLabel('Enabled'), tableData(enabled(settings[selected.type][selected.tag].enabled))]));
	// trs.push(tableRow([settingsLabel('Tag Color'), tableData([textBox('color', settings[selected.type][selected.tag].color), colorDisp('colorDisp', settings[selected.type][selected.tag].color)])]));
	// trs.push(tableRow([settingsLabel('Text Color'), tableData([textBox('tcolor', settings[selected.type][selected.tag].tcolor), colorDisp('tcolorDisp', settings[selected.type][selected.tag].tcolor)])]));
	
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
	return $('<td/>').addClass('settingsLabel').text(label + ':')
}

function enabled(checked) {
	return $('<input/>').addClass('settingsInput').attr({type: 'checkbox', id: 'enabled'}).prop('checked', checked);
}

function textBox(id, value) {
	return $('<input/>').addClass('settingsInput textInput').attr({type: 'text', id: id}).val(value);
}

function colorDisp(id, color) {
	return $('<div/>').addClass('settingsInput colorDisp').attr('id', id).css('background-color', '#' + color).html('&nbsp;');
}

function gtlt(selected) {
	let select = $('<select/>').addClass('settingsInput').attr({id: 'gtlt'});
	$.each(['greater', 'less'], function(i, type) {
		let option = $('<option/>').html(type);
		select.append(option);
	});
	select.val(selected);
	return select;
}

function avgtotal(selected) {
	// console.log('avgtotal: ' + selected);
	let select = $('<select/>').addClass('settingsInput').attr({id: 'avgtotal'});
	$.each(['average', 'total'], function(i, type) {
		let option = $('<option/>').html(type);
		select.append(option);
	});
	select.val(selected);
	return select;
}

function settingsListTr(label, menuType, menuTag) {
	let btn = addDeleteBtn('add', 'blue', 5).attr({menuType: menuType, menuTag: menuTag});
	
	btn.click(function() {
		let menuType = $(this).attr('menuType');
		let menuTag = $(this).attr('menuTag');
		
		// console.log('add btn: ' + menuType + ' - ' + menuTag);
		
		let input = floatingInput('Add ' + menuType + ' Here', menuType, menuTag);
		let div = floatingDiv($(this).position().top, $(this).position().left);
		
		$(this).after(div.append(input));
		input.focus().select();
		input.keyup(function(e) {
			if (e.which == 13) {
				let menuType = $(e.target).attr('menuType');
				let menuTag = $(e.target).attr('menuTag');
				let menuName = menuItems[menuType].name;
				let item = $(this).val();
				
				if (!(item in settings[menuName][menuTag].list)) {
					// console.log('add list item: ' + item);
					settings[menuName][menuTag].list.push(item);
					
					showFrame(menuType, menuTag);
					saveSettings();
					$('#undoDiv').show();
				}
				
				$(this).focusout();
				
			}
		});
	});
	
	return tableRow([
		settingsLabel(label).prepend(btn),
		tableData(settingsList(menuType, menuTag)).css('padding-top', 4 + 'px')
	]);
}

function floatingInput(label, menuType, menuTag = false) {
	let input = $('<input>').attr({type: 'text', menuType: menuType}).val(label);
	if (menuTag) {
		input.attr('menuTag', menuTag);
	}
	
	input.focusout(function() {
		console.log('input focus out');
		input.parent().remove();
	});
	
	return input;
}

function floatingDiv(x, y) {
	let div = $('<div/>').addClass('floatingInput border');
	
	div.css({top: x - 10, left: y - 15});
	div.focusout(function() {
		console.log('div focus out');
		div.remove();
	});
	
	return div;
}


function settingsList(menuType, menuTag) {
	let menuName = menuItems[menuType].name;
	let list = settings[menuName][menuTag].list;
	
	list = list.sort(function (a, b) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});
	
	let divs = [];
	$.each(list, function(i, item){
		let btn = addDeleteBtn('delete', 'blue');
		
		btn.click(function(){
			var index = settings[menuName][menuTag].list.indexOf(item);
			if (index !== -1) settings[menuName][menuTag].list.splice(index, 1);
			
			showFrame(menuType, menuTag);
			saveSettings();
			$('#undoDiv').show();
		});
		
		let div = $('<div/>').addClass('listItem').text(item)
		divs.push(div.prepend(btn));
	});
	
	return divs;
}







function newTag(menuName) {
	// console.log('new Tag: ' + menuName);
	
	let tag;
	if (menuName == 'accountage') {
		tag = {
			enabled: 	true,
			gtlt: 		'less',
			karma: 		100,
			age:		5,
			tcolor:		'#ffffff',
			color: 		'#d85417',
		}
	} else if (menuName == 'subkarma') {
		tag = {
			enabled: 	true,
			gtlt: 		'less',
			karma: 		-1000,
			tcolor:		'#ffffff',
			color: 		'#d85417',
		}
	} else if (menuName == 'karma') {
		tag = {
			enabled: 	true,
			gtlt: 		'greater',
			karma: 		1000000,
			tcolor:		'#ffffff',
			color: 		'#d85417',
		}
	} else if (menuName == 'subreddits') {
		tag = {
			enabled: 	true,
			gtlt: 		'greater',
			karma:		400,
			tcolor:		'#ffffff',
			color: 		'#d85417',
			list: 		[]
		}
	} else if (menuName == 'domains') {
		tag = {
			enabled: 	true,
			tcolor:	'#ffffff',
			color: 	'#c534db',
			list:	[]
		}
	}
	return tag;
}

function getTags(array) {
	let keys = []
	for (var key in array) {
		keys.push(key);
	}
	
	keys = keys.sort(function (a, b) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});
	
	return keys;
}









