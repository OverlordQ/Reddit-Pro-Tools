





"use strict";

const printLogs = false;
// const printLogs = true;

var settings;
var db;
var users = {};
var domains = [];
// var working = {};
// var startTime = Date.now();
// var redditVersion = 'old';

const day = 60 * 60 * 24; // one day
const cacheTime = day;
// const cacheTime = 0;
//const cacheTime = 60;
let numUsers = 0;
let usersWorking = false;
let domainsWorking = false;


// add google analytics
ga('create', 'UA-124046785-1', 'auto');
ga('send', 'pageview');



$(document).ready(function() {
	getSettings();
	
	addRemovedditLink();
	addPatreonLink();
	
	// give the settings and the db a extra blink of time to load
	setTimeout(function() { rptMain(); }, 100);
	
	// find new comments
	numUsers = getNumUsers();
	setTimeout(function() { 
		setInterval(function () { checkNewComments(); }, 500) 
	}, 5000);
});


function rptMain() {
	whenFinished(Date.now());
	
	if (!settings) {
		console.log('RPT: Settings Loading... ');
		setTimeout(function () { rptMain(); }, 100);
		return;
	}
	
	if (!db) {
		console.log('RPT: DB Loading... ');
		setTimeout(function () { rptMain(); }, 1000);
		return;
	}
	
	// get list of users on page
	let authors = getAuthors();
	
	authors.forEach(function(user) {
		if (!users[user]) {	users[user] = new User(user); }
		
		if (!users[user].working) {
			users[user].working = true;
			setTimeout(function(){ users[user].addTags(); }, Math.random() * 200);
			
		} else {
			printLog('working:', user);
		}
	});
	
	addDomainTags();
}


// check if new comments have been loaded onto the page
function checkNewComments() {
	let users = getNumUsers();
	
	if (numUsers != users) {
		// console.log('new comments loaded');
		numUsers = users;
		
		// if so, run the main loop again
		rptMain();
	}
}

function getNumUsers() {
	let userElems = document.evaluate(
		'//a[' + userElemEval + ']', 
		document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		
	let i = 0;
	while (userElems.snapshotItem(i)) { i++; }
	
	return i;
}


function whenFinished(timer) {
	if (!checkFinished()) {
		//console.log('not finished...');
		setTimeout(function() { whenFinished(timer); }, 100);
		return;
	}
	
	// let timeElapsed = Math.round((Date.now() - startTime) / 1000);
	// let elapsed = Math.round((Date.now() - timer) / 1000);
	// console.log('finished:', Date.now() - timer);
	// console.log('');
	let store = navigator.storage.estimate().then((data) => { handleQuota(data); });
}


function checkFinished() {
	// if (Object.keys(working).length <= 0) { return false; }
	// users.forEach(function(user) {
	for (let user in users) {
		if (users[user].working) { return false; }
	}
	return true;
}


function numPretty(num) {
	num = Math.floor(num).toString();
	let nums = num.split('');
	for (var i = num.length - 3; i >= 1; i -= 3) {
		if (nums[i-1] == '-') { continue; }
		nums.splice(i, 0, ',');
	}
	
	return nums.join('');
}


function printLog() {
	if (!printLogs) { return; }
	var log = '';
	// for (let part in arguments) {
	for (let i = 0; i < arguments.length; i++) {
		if (i != 0) { log += ' '; }
		log += arguments[i];
	}
	console.log(log);
}







////
// add snoopsnoo link to the RES user mouse over div

// event triggered by elements being loaded into the page
$(document).on('DOMNodeInserted', function(e) {
	if (typeof e.target.className != 'string') { return; }
	
	let classes = e.target.className.split(' ');
	
	// if element loading is the RES user mouseover thingie
	if (classes.includes('RESHoverTitle')) {
		addToRESHover(e.target.childNodes[0].textContent, e.target);
	}
});


function addToRESHover(user, elem) {
	// wait for RES and the Reddit API 
	if (elem.childNodes[0].childNodes.length == 0) {
		setTimeout(function(){ addToRESHover(user, elem); }, 10);
		return;
	}
	
	let title = elem.childNodes[0];
	let body = elem.parentNode.childNodes[5].childNodes[0];
	// let zIndex = elem.parentNode.style.zIndex;
	
	// add SnoopSnoo link
	let snoopSnooLink = document.createElement('a');
	snoopSnooLink.href = 'https://snoopsnoo.com/u/' + user;
	snoopSnooLink.textContent = 'SnoopSnoo';
	
	title.style.whiteSpace = 'nowrap';
	title.style.fontSize = 'smaller';
	title.childNodes[6].after('(', snoopSnooLink, ')');
	
	// add RPT Stats
	let fieldPair = document.createElement('div');
	fieldPair.className = 'fieldPair';
	
	let fieldPairLabel = document.createElement('div');
	fieldPairLabel.className = 'fieldPair-label';
	fieldPairLabel.textContent = 'RPT Stats:';
	
	let fieldPairText = document.createElement('div');
	fieldPairText.className = 'fieldPair-text';
	
	let rptPos = users[user].tagSpan('rptStats', 'RPT+');
	let rptNeg = users[user].tagSpan('rptStats', 'RPT-');
	
	fieldPairText.append(rptPos, rptNeg);
	fieldPair.append(fieldPairLabel, fieldPairText);
	body.prepend(fieldPair);
	
	// console.log(elem.parentNode.style.zIndex);
}

function addSnoopSnooTag() {
	let elem = $($('.RESHoverTitle > div')[0]);
	
	// the children are rendered from an api call.
	// if they haven't been loaded...
	if (elem.children().length < 4) {
		// do the recursion dance
		setTimeout(function(){ addSnoopSnooTag() }, 10);
		return;
	}
	
	console.log(elem.parent().parent().attr('class'));
	elem.parent().parent().css('width', '530px');
	elem.css('white-space', 'nowrap');
	let children = elem.children();
	let user = children[0].text.replace(/^\/u\//i, '');
	let last = children[(children.length - 1)];
	children[(children.length - 1)].remove();
	last.style.marginLeft = '3px';
	
	let snoopSnoo = $('<span/>').addClass('snoopSnoo').append('(', $('<a/>').attr('href', 'https://snoopsnoo.com/u/' + user).text('SnoopSnoo'), ')');
	let rptPos = users[user].tagSpan('rptStats', 'RPT+');
	let rptNeg = users[user].tagSpan('rptStats', 'RPT-');
	
	let wrapper = $('<span/>');
	// wrapper.css('margin-left', '3px');
	wrapper.append(snoopSnoo, rptPos, rptNeg, last);
	
	
	elem.append(wrapper);
	elem.css('font-size', 'smaller');
}




// function addCedditLink() {
	// let img = chrome.extension.getURL('images/ceddit.png');
	// let url = window.location.href.split('/');
	
	// url[2] = 'www.ceddit.com';
	// url = url.join('/');
	// $('#header-bottom-right').append('<span class="separator">|</span><a href="' + url + '"><img class="ceddit" src="' + img + '"></a>');
// }

function addRemovedditLink() {
	let img = chrome.extension.getURL('images/removeddit.png');
	let url = window.location.href.split('/');
	
	url[2] = 'www.removeddit.com';
	url = url.join('/');
	$('#header-bottom-right').append('<span class="separator">|</span><a href="' + url + '"><img class="removeddit" src="' + img + '"></a>');
}


function addPatreonLink() {
	if (!settings) {
		setTimeout(function () { addPatreonLink(); }, 100);
		return;
	}
	
	if (!settings.settings.patreonLink) {
		return;
	}
	
	let patreonUrl = 'https://www.patreon.com/join/feeling_impossible/checkout';
	
	let elem;
	let topMargin = 22;
	let bottomMargin = 0;
	
	// new reddit
	if ($('.s10kkmv9-0').length) {
		topMargin = 15;
		elem = $($('.s10kkmv9-0')[0]);
	
	// old reddit
	} else {
		// in a subreddit
		if (window.location.href.split('/')[3] == 'r') {
			if ($('.submit-text').length) {
				elem = $($('.submit-text').parent());

			} else if ($('.submit-link').length) {
				elem = $($('.submit-link').parent());
			}
		} else {
			if ($('a[data-event-action="createsubreddit"]').length) {
				topMargin = 0;
				bottomMargin = 14;
				elem = $($('a[data-event-action="createsubreddit"]').parent().parent().parent());
			}
		}
	}
		
	// user overview
	if (!elem) {
		return;
	}
	
	// old reddit
	// if ($('a[data-event-action="createsubreddit"]').length) {
		// elem = $($('a[data-event-action="createsubreddit"]').parent().parent().parent());
		
	// } else if ($('.submit-text').length) {
		// elem = $('.submit-text');
		
	// } else if ($('.submit-link').length) {
		// elem = $('.submit-link');
		
	// new reddit
	// } else if ($('.s10kkmv9-0').length) {
		// topMargin = 15;
		// elem = $($('.s10kkmv9-0')[0]);
		
	// user overview
	// } else {
		// console.log('no ad');
		// return;
	// }
	
	// add analytics for Patreon Ad show
	ga('send', 'event', 'Patreon Ad', 'show');
	
	let patreonDiv = $('<div>').css({
		'margin-top': 		topMargin + 'px',
		'margin-bottom': 	bottomMargin + 'px',
		'text-align':		'center',
		'font-weight':		'bold',
		'font-size':		'13px',
		'color':			'#336699'
	}).text('Support Reddit Pro Tools');
	
	let btnWidth = 176;
	let btnHeight = 34;
	
	let patreonBtn = $('<div>').css({
		cursor: 			'pointer',
		margin: 			'0 auto 3px auto',
		'background-color': '#e85b46',
		'border-radius':	btnHeight / 2 + 'px',
		width: 				btnWidth + 'px', 
		height: 			btnHeight + 'px', 
		'line-height':		btnHeight + 'px',
		color:				'#ffffff',
		'font-family': 		"'America', 'GT America', 'Lato', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		'font-size':		'0.875rem',
		'font-smooth': 		'never',
		'font-weight':		'500',
		'text-rendering': 	'optimizeLegibility',
	});
	
	let patreonLogoBar = $('<span>').css({
		width: 				'2px', 
		height: 			'12px',
		display:			'inline-block',
		'vertical-align': 	'middle',
		'background-color': '#052d49',
		'font-size':		'.1em',
	}).html('&nbsp;');
	
	let patreonLogoCircle = $('<span>').css({
		width: 				'9px', 
		height: 			'9px',
		display:			'inline-block',
		'vertical-align': 	'middle',
		'background-color': '#ffffff',
		'font-size':		'.1em',
		'border-radius':	'4px',
		'margin-left':		'1px',
		position:			'relative',
		top:				'-2px',
	}).html('&nbsp;');
	
	let patreonLogo = $('<span>').append(patreonLogoBar, patreonLogoCircle);
	let patreonText = $('<span>').css({
		'margin-left': 	'12px',
		position:		'relative',
		top:			'1px',
	}).text('Become a patron');
	
	patreonBtn.append(patreonLogo, patreonText);
	
	patreonBtn.mousedown(function(e){
		if (e.which == 1) {
			ga('send', 'event', 'Patreon Ad', 'click');
			window.location = patreonUrl;
		} else if (e.which == 2) {
			ga('send', 'event', 'Patreon Ad', 'click');
			window.open(patreonUrl, '_blank');
		}
	});
	
	patreonDiv.prepend(patreonBtn);
	elem.after(patreonDiv);
}







