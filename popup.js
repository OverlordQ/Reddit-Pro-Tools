

"use strict";

//settings
var settings;
var startSettings;
getSettings();

var domainText 		= 'add domain here';
var deplorableText 	= 'add subreddit here';

var selected = {
	section: 	'supportrpt',
	// section: 	'tags',
	// section: 	'settings',
	type: 		false,
	tag:  		false
};



// add google analytics
ga('create', 'UA-124046785-1', 'auto');
ga('set', 'checkProtocolTask', function(){});
ga('send', 'event', 'Settings', 'view');


$(document).ready(function() {
	drawMenu();
	drawMain();
});



function drawMenu() {
	if (!settings) {
		console.log('RPT: Settings Loading... ');
		setTimeout(function () { drawMenu(); }, 100);
		return;
	}
	
	// set default type and tag if none is selected
	if (selected.section == 'tags') {
		if (!selected.type) { selected.type = Object.keys(menu[selected.section].list)[0]; }
		if (!selected.tag) { selected.tag = Object.keys(settings[selected.section][selected.type]).sort()[0]; }
	}
	
	
	$('.menuSection').remove();
	$('.menuType').remove();
	$('.menuTag').remove();
	$('.menuReset').remove();
	
	// menu sections
	$.each(menu, function(section) {
		
		let sectionDiv = $('<div/>').addClass('menuSection').attr({section: section}).text(menu[section].label);
		
		if (section == selected.section) {
			sectionDiv.addClass('bold');
		}

		sectionDiv.click(function(e) {
			selected.section = $(e.target).attr('section');
			selected.type = false;
			selected.tag = false;
			drawMenu();
			drawMain();
		});
		
		sectionDiv.hover(
			function() { $(this).addClass('menuSectionHover'); },
			function() { $(this).removeClass('menuSectionHover'); }
		);
		
		$('.menuFrame').append(sectionDiv);
		
		// menu types
		if (section == 'tags') {
			$.each(menu[section].list, function(type) {
				
				let menuTypeDiv = $('<div/>').addClass('menuType');
				let typeSpan = $('<span/>').addClass('menuType').attr({section: section, type: type}).text(menu[section].list[type].label);
				
				if (type == selected.type) {
					typeSpan.addClass('bold');
				}

				typeSpan.click(function(e) {
					selected.section = $(e.target).attr('section');
					selected.type = $(e.target).attr('type');
					selected.tag = false;
					drawMenu();
					drawMain();
				});
				
				typeSpan.hover(
					function() { $(this).addClass('menuTypeHover'); },
					function() { $(this).removeClass('menuTypeHover'); }
				);
				
		
				let btn = addDeleteBtn('add', 'white', 6).attr('type', type);
				btn.click(function(e) {
					selected.type = $(this).attr('type');
					
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
							selected.section = section;
							selected.type = $(e.target).attr('menuType');
							selected.tag = $(this).val();
							
							if (!(selected.tag in settings.tags[selected.type])) {
								// console.log('add tag: ' + selected.tag);
								let tag = newTag(selected.type);
								settings.tags[selected.type][selected.tag] = tag;
								
								drawMenu();
								drawMain();
								saveSettings();
							}
							
							$(this).focusout();
						}
					});
				});
				
				menuTypeDiv.append(btn, typeSpan);
				$('.menuFrame').append(menuTypeDiv);
				
				// menu tags
				$.each(settings.tags[type], function(tag, tagData) {
					// console.log('\t\t', tag);
					let tagDiv = $('<div/>').addClass('menuTag');
					let tagSpan = $('<span/>').addClass('menuTag').attr({section: section, type: type, tag: tag}).text(tag);
				
					if (tag == selected.tag) {
						tagSpan.addClass('bold');
					}
				
					tagSpan.click(function(e) {
						selected.section = $(e.target).attr('section');
						selected.type = $(e.target).attr('type');
						selected.tag = $(e.target).attr('tag');
						drawMenu();
						drawMain();
					});
					tagSpan.hover(
						function() { $(this).addClass('menuTagHover'); },
						function() { $(this).removeClass('menuTagHover'); }
					);
					
					let btn = addDeleteBtn('delete', 'white', 3).attr({type: type, menuTag: tag});
					
					btn.click(function() {
						let type = $(this).attr('type');
						let tag = $(this).attr('menuTag');
						delete settings.tags[type][tag];
						
						if (type == selected.type && tag == selected.tag) {
							selected.tag = false;
						}
						
						drawMenu();
						drawMain();
						saveSettings();
					});
				
					tagDiv.append(btn, tagSpan);
					$('.menuFrame').append(tagDiv);
				});
			});
		}
	});
	
	let undoDiv = $('<div/>').attr('id', 'undoDiv').css('cursor', 'pointer').text('Undo Changes');
	undoDiv.click(function(){
		settings = $.extend(true, {}, startSettings);
		saveSettings();
		
		if (selected.tag && !(selected.tag in settings[selected.section][selected.type])) {
			selected.tag = false;
		}
		
		drawMenu();
		drawMain();
	});
	
	let resetDiv = $('<div/>').attr('id', 'resetDiv').css('cursor', 'pointer').text('Reset to Defaults');
	resetDiv.click(function(){
		settings = $.extend(true, {}, defaultSettings);
		saveSettings();
		
		if (selected.tag && !(selected.tag in settings[selected.section][selected.type])) {
			selected.tag = false;
		}
		
		drawMenu();
		drawMain();
	});
	
	
	let advancedDiv = $('<div/>').css({cursor: 'pointer'}).text('Advanced Settings');
	
	advancedDiv.click(function(e){
		let div = floatingDiv().append($('<div/>').css('margin-bottom', '5px').text('Copy settings to clipboard:'));
		
		div.mouseleave(function() {
			$(this).remove();
		});
		
		let btnDiv = $('<div/>');
		let copyBtn = $('<input/>').addClass('settingsInput').attr('type', 'submit').val('Copy');
		let pasteBtn = $('<input/>').addClass('settingsInput').attr('type', 'submit').val('Import');
		btnDiv.append(copyBtn, pasteBtn);
		
		$(this).after(div.append(btnDiv));
		div.css({
			left: e.pageX - div.width() / 2 + 'px', 
			top:  e.pageY - div.height() * 5 / 6 + 'px'
		});
		
		copyBtn.click(function() {
			div.remove();
			let data = JSON.stringify(settings, null, 4);
			data = data.replace(/^.*\n/, '').replace(/\n.*$/, '');
			let textArea = $('<textarea>').val(data);
			$(document.body).append(textArea);
			textArea.select();
			document.execCommand('copy');
		});
		
		pasteBtn.click(function() {
			div.remove();
			
		let importDiv = floatingDiv().css({color: '#FFFFFF', padding: '10px 20px'}).text('Paste settings in the box below:').append($('<br>'));
			
			// .css({top: '0px', left: '0px'})
			$(document.body).append(importDiv);
			
			let textArea = $('<textarea>').attr({rows: '40', cols: '50'}).val(testImport);
			textArea.select();
			let buttonDiv = $('<div>').css({float: 'right'});
			let importBtn = $('<button>').text('Import').css({margin: '5px 0px 5px 5px'});
			let cancelBtn = $('<button>').text('Cancel').css({margin: '5px'});
			buttonDiv.append(importBtn, cancelBtn);
			importDiv.append(textArea, $('<br>'), buttonDiv);
			centerDiv(importDiv, $('.mainFrame'));
			
			cancelBtn.click(function() {
				importDiv.remove();
			});
			
			importBtn.click(function() {
				let importText = '{\n' + textArea.val() + '\n}';
				let data = tryParseJSON(importText);
				importDiv.empty();
				
				let selectAllDiv = $('<div>').text('Select All').prepend(importCheckBox(false, 'selectAll'));
				importDiv.append(selectAllDiv);
				for (let type in data) {
					if (type == 'rptStats') { continue; }
					
					let typeDiv = $('<div>').css('margin-left', '15px').text(menu[type].label).prepend(importCheckBox(false, type));
					
					let divs = [typeDiv];
					for (let tag in data[type]) {
						let tagsEqual = tagCompare(data[type][tag], settings[type][tag]);
						
						let cbox = importCheckBox(false, type, tag);
						let tagDiv = $('<div>').css('margin-left', '30px').text(tag).prepend(cbox);
						
						if (tag in settings[type]) {
							 if (!tagsEqual) {
								// console.log(type + ',', tag + ':', 'Overwrite Tag');
								tagDiv.css({color: 'rgb(255, 153, 153)'})
								divs.push(tagDiv);
							 }
						} else {
							// console.log(type + ',', tag + ':', 'New Tag');
							divs.push(tagDiv);
						}
						console.log();
					}
					
					if (divs.length > 1) {
						importDiv.append(divs);
					}
				}
				
				centerDiv(importDiv, $('.mainFrame'));
			});
		});
	});
	
	// let undoResetDiv = $('<div/>').addClass('menuReset').append([advancedDiv, undoDiv, resetDiv]);
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
	if (!settings) {
		console.log('RPT: Settings Loading... ');
		setTimeout(function () { drawMain(); }, 100);
		return;
	}
	
	let labelText, descText;
	if (selected.section == 'tags') {
		labelText = menu[selected.section].list[selected.type].label;
		descText = menu[selected.section].list[selected.type].desc;
	} else {
		labelText = menu[selected.section].label;
		descText = menu[selected.section].desc;
	}
	
	$('.mainFrame').empty();

	
	// mainFrame header
	let header = $('<div/>').addClass('header').text(labelText);
	let desc   = $('<div/>').addClass('description').text(descText);
	let banner = $('<div/>').addClass('banner');
	let tag    = $('<div/>').addClass('tagname').text(selected.tag);
	$(banner).append(header);
	$(banner).append(desc);
	
	if (selected.section == 'tags') {
		$(banner).append(tag);
	}
	$('.mainFrame').append(banner);
	
	//mainFrame settings
	let table = $('<table/>');
	if (selected.section == 'tags' && selected.type == 'accountage') {
		let trs = basicSettings();
		
		trs.push(tableRow([settingsLabel('Account Age'), tableData([selectBox('gtlt', settings[selected.section][selected.type][selected.tag].gtlt), 'than ', textBox('age', settings[selected.section][selected.type][selected.tag].age), ' (days)'])]));
		
		table.append(trs);
		$('.mainFrame').append(table);

	} else if (selected.section == 'tags' && selected.type == 'subkarma' || selected.type == 'karma') {
		let trs = basicSettings();
		
		trs.push(tableRow([settingsLabel('Karma'), tableData([selectBox('avgtotal', settings[selected.section][selected.type][selected.tag].avgtotal), selectBox('gtlt', settings[selected.section][selected.type][selected.tag].gtlt), 'than ', textBox('karma', settings[selected.section][selected.type][selected.tag].karma)])]));
		
		table.append(trs);
		$('.mainFrame').append(table);
		
	} else if (selected.section == 'tags' && selected.type == 'subreddits') {
		let trs = basicSettings();
		
		trs.push(tableRow([settingsLabel('Karma'), tableData([selectBox('avgtotal', settings[selected.section][selected.type][selected.tag].avgtotal), selectBox('gtlt', settings[selected.section][selected.type][selected.tag].gtlt), 'than ', textBox('karma', settings[selected.section][selected.type][selected.tag].karma)])]));
		trs.push(settingsListTr('Subreddits'));
		
		table.append(trs);
		$('.mainFrame').append(table);
		
	} else if (selected.section == 'tags' && selected.type == 'domains') {
		let trs = basicSettings();
		
		trs.push(settingsListTr('Domains'));
		
		table.append(trs);
		$('.mainFrame').append(table);
		
	} else if (selected.section == 'supportrpt') {
		let numPatrons = 0;
		for (var key in supporters) {
			for (var i in supporters[key].list) {
				numPatrons++;
			}
		}
		
		let patreonLink = $('<a>').attr('href', 'https://www.patreon.com/feeling_impossible').text('Support Reddit Pro Tools through Patreon!');
		let patreonLinkDiv = $('<div>').addClass('patreonLink').append(patreonLink);
		
		let header = $('<div>').addClass('patreonHeader');
		header.append(patreonLinkDiv);
		header.append($('<div>').text('This project is entirely supported through Patreon. If you find Reddit Pro Tools useful, you have these ' + numPatrons + ' people to thank. Become a Patron so I can add you to the list.'));
		
		$('.mainFrame').append(header);
		
		
		for (var key in supporters) {
			let pDiv = $('<div>').addClass('patrons');
			pDiv.append($('<div>').addClass('tagname').text(supporters[key].label));
			
			supporters[key].list.forEach(function(patron) {
				pDiv.append($('<div>').addClass('patron').text(patron));
				
			});
			
			
			$('.mainFrame').append(pDiv);
		}
		
		let redditLink = $('<a>').attr('href', 'https://www.reddit.com/r/redditprotools/').text('/r/RedditProTools');
		let techSupport = $('<div>').addClass('patreonHeader').append('If you need technical support, see ', redditLink, '.');
		
		let impossibleLink = $('<a>').attr('href', 'https://www.reddit.com/user/feeling_impossible/overview').text('/u/feeling_impossible');
		let createdBy = $('<div>').addClass('patreonHeader').append('Reddit Pro Tools was created by ', impossibleLink, '.');
		
		$('.mainFrame').append(techSupport, createdBy);
		
	} else if (selected.section == 'settings') {
		let trs = tableRow([tableData('Enable Patreon Support Button:'), tableData(checkbox(settings[selected.section].patreonLink, 'patreonLink'))]);
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
	trs.push(tableRow([settingsLabel('Enabled'), tableData(checkbox(settings[selected.section][selected.type][selected.tag].enabled))]));
	trs.push(tableRow([settingsLabel('Tag Color'), tableData([textBox('color', settings[selected.section][selected.type][selected.tag].color), colorDisp('color', settings[selected.section][selected.type][selected.tag].color)])]));
	trs.push(tableRow([settingsLabel('Text Color'), tableData([textBox('tcolor', settings[selected.section][selected.type][selected.tag].tcolor), colorDisp('tcolor', settings[selected.section][selected.type][selected.tag].tcolor)])]));
	
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





function checkbox(checked, id = 'enabled') {
	let input = $('<input/>').addClass('settingsInput checkbox').attr({type: 'checkbox', id: id}).prop('checked', checked);
	
	input.change(function(e) {
		if (selected.section == 'tags') {
			settings[selected.section][selected.type][selected.tag][id] = $(this).prop('checked');
		} else {
			settings[selected.section][id] = $(this).prop('checked');
		}
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
		settings[selected.section][selected.type][selected.tag][id] = $(this).val();
		
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
		settings[selected.section][selected.type][selected.tag][id] = $(this).val();
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
		let input = floatingInput('Add ' + menu[selected.section].list[selected.type].label + ' Here');
		
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
				
				if (!(item in settings[selected.section][selected.type][selected.tag].list)) {
					if (selected.type == 'domains') {
						item = item.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*/, '').toLowerCase();
					}
					
					if (!settings[selected.section][selected.type][selected.tag].list.includes(item)) { 
						settings[selected.section][selected.type][selected.tag].list.push(item);
						
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
	let list = settings[selected.section][selected.type][selected.tag].list;
	
	list = list.sort(function (a, b) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});
	
	let divs = [];
	list.forEach(function(item){
		let btn = addDeleteBtn('delete', 'blue', 5);
		
		btn.click(function(){
			var index = settings[selected.section][selected.type][selected.tag].list.indexOf(item);
			if (index !== -1) settings[selected.section][selected.type][selected.tag].list.splice(index, 1);
			
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
		settings[selected.section][selected.type][selected.tag][type] = hex;
		
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

// function getTags(type) {
	// let keys = []
	// for (var key in settings[type]) {
		// keys.push(key);
	// }
	
	// keys = keys.sort(function (a, b) {
		// return a.toLowerCase().localeCompare(b.toLowerCase());
	// });
	
	// return keys;
// }



// import code
function tagCompare(importTag, tag) {
	if (!tag) { return false; }
	for (var key in importTag) {
		if (!(key in tag)) { return false; }
			
		if (typeof(importTag[key]) == 'object') {
			importTag[key].sort();
			tag[key].sort();
			
			for (var i in importTag[key]) {
				if (importTag[key][i] != tag[key][i]) {
					return false;
				}
			}
		} else {
			if (importTag[key] != tag[key]) {
				return false;
			}
		}
	}
	
	return true;
}

function importCheckBox(checked, type, tag = false) {
	let input = $('<input>').attr({type: 'checkbox', importtype: type, importtag: tag}).prop('checked', checked).css({position: 'relative', top: '3px'});
	
	input.change(function() {
		let checked = $(this).prop('checked');
		
		
			
		let allChecked = true;
		$('input[importtype!="selectAll"]').each((index, cbox) => {
			if ($(cbox).prop('checked') == false) {
				console.log($(cbox).attr('importtype'), $(cbox).attr('importtag'), $(cbox).prop('checked'));
				allChecked = false;
				return;
			}
		});
		console.log('');
		if (allChecked) {
			$('input[importtype="selectAll"][importtag="false"]').prop('checked', true);
		} else {
			$('input[importtype="selectAll"][importtag="false"]').prop('checked', false);
		}
		
		// Auto check/uncheck when type checkbox changed
		if (tag) {
			allChecked = true;
			$('input[importtype="' + type + '"][importtag!="false"]').each((index, cbox) => {
				if ($(cbox).prop('checked') == false) {
					allChecked = false;
					return;
				}
			});
			
			if (allChecked) {
				$('input[importtype="' + type + '"][importtag="false"]').prop('checked', true);
			} else {
				$('input[importtype="' + type + '"][importtag="false"]').prop('checked', false);
			}
			
		} else {
			$('input[importtype="' + type + '"]').each((index, cbox) => {
				$(cbox).prop('checked', checked);
			});
		}
		
		if (type == 'selectAll') {
			$('input').each((index, cbox) => {
				$(cbox).prop('checked', checked);
			});
		}
		
	});
	return input;
}

function centerDiv(elem, target) {
	let position = target.offset();
	elem.css({left: (position.left + target.width() / 2 - elem.width() / 2) + 'px', top: ($(document.body).height() / 2 - elem.height() / 2) + 'px'})
}
	
function tryParseJSON (jsonString){
	try {
		var o = JSON.parse(jsonString);
		if (o && typeof o === "object") {
			return o;
		}
	}
	catch (e) { }

	return false;
};









