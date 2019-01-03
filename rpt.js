





"use strict";

var settings;
var db;
var users = {};
var domains = [];
var working = {};
// var startTime = Date.now();
// var redditVersion = 'old';

const day = 60 * 60 * 24; // one day
const cacheTime = day;
//const cacheTime = 60;
let numUsers = 0;


// add google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-124046785-1']);
_gaq.push(['_trackPageview']);



$(document).ready(function() {
	getSettings();
	
	console.log('');
	console.log('Reddit Pro Tools!');
	console.log('');
	
	// console.log('length: ' + $('meta[property="og:site_name"]').length)
	// which version of reddit are we using?
	if ($('meta[property="og:site_name"]').length) {
		redditVersion = 'new';
	}
	
	addCedditLink();
	
	// give the settings and the db a extra blink of time to load
	setTimeout(function() { rptMain(); }, 100);
	
	// find new comments
	// there is probably a better way to do this with
	// DOM events like I did with the domains
	numUsers = $('.author').length;
	setInterval(function () { newComments(); }, 1000);
});


function rptMain() {
	whenFinished(Date.now());
	// console.log('rptMain():');
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
		if (!working[user]) {
			if (!users[user]) {	users[user] = new User(user); }
			
			working[user] = true;
			users[user].dbGet();
			users[user].aboutGet();
			users[user].commentsGet();
			users[user].addTags();
			// console.log('rptMain():', user + '.addTags();');
		} else {
			console.log('\t\tworking:', user);
		}
	});
	// console.log(users);
	
	addDomainTags();
}


// check if new comments have been loaded onto the page
function newComments() {
	let users = $('.author, .s1b41naq-1, ._2tbHP6ZydRpjI44J3syuqC, .s1461iz-1');
	
	if (numUsers != users.length) {
		// console.log('new comments loaded');
		numUsers = users.length;
		
		// if so, run the main loop again
		rptMain();
	}
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
	console.log('');
	let store = navigator.storage.estimate().then((data) => { handleQuota(data); });
}


function checkFinished() {
	if (Object.keys(working).length <= 0) { return false; }
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










////
// add snoopsnoo link to the RES user mouse over div

// event triggered by elements being loaded into the page
$(document).on('DOMNodeInserted', function(e) {
	// if element loading is the RES user mouseover thingie
	if ($(e.target).attr('class') == 'RESHoverTitle') {
		addSnoopSnooTag();
	}
});


function addSnoopSnooTag() {
	let elem = $($('.RESHoverTitle > div')[0]);
	
	// the children are rendered from an api call.
	// if they haven't been loaded...
	if (elem.children().length < 4) {
		// do the recursion dance
		setTimeout(function(){ addSnoopSnooTag() }, 100);
		return;
	}
	
	let children = elem.children();
	let user = children[0].text;
	let last = children[(children.length - 1)];
	children[(children.length - 1)].remove();
	elem.append('<span class="snoopSnoo">(<a href="https://snoopsnoo.com' + user + '">SnoopSnoo</a>)</span>');
	elem.append(last);
	elem.css('font-size', 'smaller');
}




function addCedditLink() {
	let img = chrome.extension.getURL('images/ceddit.png');
	let url = window.location.href.split('/');
	
	url[2] = 'www.ceddit.com';
	url = url.join('/');
	$('#header-bottom-right').append('<span class="separator">|</span><a href="' + url + '"><img class="ceddit" src="' + img + '"></a>');
	
}










