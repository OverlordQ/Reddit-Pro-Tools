

"use strict";

//settings
var settings;
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

$(document).ready(function() {
	let start = 'Subreddits';
	// let start = 'Domains';
	// let start = 'Karma';
	// let start = 'Account Age';
	drawMenu(start);
	showFrame(start);
});

function drawMenu(selectedItem, selectedTag = false) {
	$('.menuItem').remove();
	$('.menuTag').remove();
	
	$.each(menuItems, function(menuType, tag) {
		let tags = getTags(settings[tag.name]);
		let menuItemDiv = $('<div/>').addClass('menuItem');
		let addDiv = $('<div/>').addClass('button').attr('alt', 'Add Tag').attr('menuType', menuType).html('&nbsp;&nbsp;&nbsp;&nbsp;');
		let typeDiv = $('<span/>').addClass('menuType').attr('id', 'menuType_' + tag.name).text(menuType);
		if (menuItems[menuType].name != 'supportrpt') {
			addDiv.addClass('addButton');
		}
		menuItemDiv.append(addDiv);
		menuItemDiv.append(typeDiv);
		$('.menuFrame').append(menuItemDiv);
		
		if (menuType == selectedItem) {
			typeDiv.addClass('bold');
			if (selectedTag == false) {
				selectedTag = tags[0];
			}
		}
		// console.log(tags);
		
		for (var menuTag of tags.reverse()) {
			let menuTagDiv = $('<div/>').addClass('menuTag');
			let delDiv = $('<div/>').addClass('button deleteButton').attr('menuType', menuType).attr('menuTag', menuTag).html('&nbsp;&nbsp;&nbsp;&nbsp;');
			let tagDiv = $('<span/>').attr('menuType', menuType).addClass('menuTag').text(menuTag);
			menuTagDiv.append(delDiv);
			menuTagDiv.append(tagDiv);
			menuItemDiv.after(menuTagDiv)
			if (menuType == selectedItem && menuTag == selectedTag) {
				tagDiv.addClass('bold');
			}
		}
	});
		
	$('.menuType').click(function(e) {
		let clicked = $(e.target).text();
		drawMenu(clicked);
		showFrame(clicked);
	});
		
	$('span.menuTag').click(function(e) {
		let menuType = $(e.target).attr('menuType');
		let menuTag = $(e.target).text();
		drawMenu(menuType, menuTag);
		showFrame(menuType, menuTag);
	});
		
	$('span.menuType').hover(
		function() { $(this).addClass('menuHover'); },
		function() { $(this).removeClass('menuHover'); }
	);
		
	$('span.menuTag').hover(
		function() { $(this).addClass('menuHover'); },
		function() { $(this).removeClass('menuHover'); }
	);
	
	$('.addButton').hover(
		function() { $(this).addClass('addHoverButton'); },
		function() { $(this).removeClass('addHoverButton'); },
	);
	
	$('.deleteButton').hover(
		function() { $(this).addClass('deleteHoverButton'); },
		function() { $(this).removeClass('deleteHoverButton'); },
	);
		
	$('.deleteButton').click(function(e) {
		let menuType = $(e.target).attr('menuType');
		let menuTag = $(e.target).attr('menuTag');
		
		delete settings[menuItems[menuType].name][menuTag];
		saveSettings();
		drawMenu(menuType);
		showFrame(menuType);
	});
	
	$('.addButton').click(function(e) {
		let menuType = $(e.target).attr('menuType');
		// console.log('add: ' + menuType);
		
		let input = $('<input>').attr({type: 'text', menuType: menuType});
		let tagDiv = $('<div/>').addClass('tagInput').text('Add tag: ' + menuType);
		tagDiv.append(input).addClass('addTagDiv');
		$(e.target).after(tagDiv);
		input.focus();
		
		tagDiv.focusout(function() {
			tagDiv.remove();
		});
		
		input.keyup(function(e) {
			if (e.which == 13) {
				let menuType = $(e.target).attr('menuType');
				let menuTag = $(this).val();
				let menuName = menuItems[menuType].name;
				
				
				if (!(menuTag in settings[menuName])) {
					// console.log('add tag: ' + menuTag);
					let tag = newTag(menuName);
					settings[menuName][menuTag] = tag;
					saveSettings();
					drawMenu(menuType, menuTag);
					showFrame(menuType, menuTag);
				}
				
				$(this).focusout();
			}
		});
	});
	setTimeout(function(){ setMenuWidth(); }, 10);
}

function setMenuWidth() {
	$('.menuFrame').css('width', 'auto');
	$('.menuFrame').css('width', $('.menuFrame').width() + 20);
}

function showFrame(menuType, menuTag = false) {
	let menuName = menuItems[menuType].name;
	// console.log('menuType: ' + menuType);
	let tags = getTags(settings[menuItems[menuType].name]);
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
	
	//mainFrame settings
	let table = $('<table/>');
	// let tr;
	if (menuName == 'accountage') {
		// let hidMenuType = $('<input/>').attr({type: 'hidden', id: 'menuType'}).val(menuType);
		// let hidMenuTag = $('<input/>').attr({type: 'hidden', id: 'menuTag'}).val(menuTag);
		// $('.mainFrame').append(hidMenuType, hidMenuTag);
		
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
			$('#colorDisp').css('background-color', '#' + $('#color').val())
			$('#tcolorDisp').css('background-color', '#' + $('#tcolor').val())
			saveSettings();
		});

	} else if (menuName == 'subkarma' || menuName == 'karma') {
		// enabled: 	true,
		// avgtotal:	'total',
		// gtlt: 		'less',
		// karma: 		-1000,
		// tcolor:		'ffffff',
		// color: 		'd85417',
		
		let trs = basicSettings(menuName, menuTag, table);
		
		trs.push(tableRow([settingsLabel('Karma'), tableData([avgtotal(settings[menuName][menuTag].avgtotal), gtlt(settings[menuName][menuTag].gtlt), 'than ', textBox('karma', settings[menuName][menuTag].karma)])]));
		
		table.append(trs);
		$('.mainFrame').append(table);
		
		$('.settingsInput').focusout(function(e){
			settings[menuName][menuTag].enabled = $('#enabled').prop('checked');
			settings[menuName][menuTag].color = $('#color').val();
			settings[menuName][menuTag].tcolor = $('#tcolor').val();
			settings[menuName][menuTag].avgtotal = $('#avgtotal').val();
			settings[menuName][menuTag].gtlt = $('#gtlt').val();
			settings[menuName][menuTag].karma = $('#karma').val();
			$('#colorDisp').css('background-color', '#' + $('#color').val())
			$('#tcolorDisp').css('background-color', '#' + $('#tcolor').val())
			saveSettings();
		});
		
	} else if (menuName == 'subreddits') {
		// enabled: 	true,
		// avgtotal:	'total',
		// gtlt: 		'greater',
		// karma:		10000,
		// tcolor:		'ffffff',
		// color: 		'd85417',
		// list: 		[
			// 'politics'
		// ]
		
		let trs = basicSettings(menuName, menuTag, table);
		trs.push(settingsListTr('Subreddits', menuName, menuTag));
		
		table.append(trs);
		$('.mainFrame').append(table);
		
	} else if (menuName == 'domains') {
		let trs = basicSettings(menuName, menuTag, table);
		trs.push(settingsListTr('Domains', menuName, menuTag));
		
		table.append(trs);
		$('.mainFrame').append(table);
	}
	setWidth();
}

function setWidth() {
	let width = 680;
	let sbWidth = 34;
	
	// if scrollbar is visible...
	if ($(document).height() > $(window).height()) {
		$('html').css('min-width', width - sbWidth);
	} else {
		$('html').css('min-width', width);
	}
}

function settingsListTr(label, menuName, menuTag) {
	return tableRow([
		settingsLabel('Subreddits'),
		tableData(settingsList(menuName, menuTag))
	]);
}

function settingsList(menuName, menuTag) {
	let list = settings[menuName][menuTag].list;
	
	let divs = [];
	$.each(list, function(i, value){
		divs.push($('<div/>').text(value));
	});
	return divs;
}

function basicSettings(menuName, menuTag, table) {
	let trs = [];
	trs.push(tableRow([settingsLabel('Enabled'), tableData(enabled(settings[menuName][menuTag].enabled))]));
	trs.push(tableRow([settingsLabel('Tag Color'), tableData([textBox('color', settings[menuName][menuTag].color), colorDisp('colorDisp', settings[menuName][menuTag].color)])]));
	trs.push(tableRow([settingsLabel('Text Color'), tableData([textBox('tcolor', settings[menuName][menuTag].tcolor), colorDisp('tcolorDisp', settings[menuName][menuTag].tcolor)])]));
	
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









