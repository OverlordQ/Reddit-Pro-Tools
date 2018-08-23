





"use strict";

var settings;
var db;
var users = {};
var domains = [];
var working = [];
var saved = [];
var startTime = Date.now();
var redditVersion = 'old';

const day = 60 * 60 * 24; // one day
const cacheTime = day;
//const cacheTime = 60;
let numUsers = 0;


// add google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-124046785-1']);
_gaq.push(['_trackPageview']);



//$(document).ready(function() {
//$(window).load(function(){
jQuery(document).ready(function($) {
	getSettings();
	/*
	console.log('');
	console.log('Reddit Pro Tools!');
	console.log('');
	*/
	
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
	
	whenFinished();
});


function rptMain() {
	if (!settings) {
		console.log('settings loading... ');
		setTimeout(function () { rptMain(); }, 100);
		return;
	}
	
	if (!db) {
		console.log('db loading... ');
		setTimeout(function () { rptMain(); }, 1000);
		return;
	}
	
	// get list of users on page
	let authors = getAuthors();
	
	authors.forEach(function(user) {
		if (!working[user]) {
			if (!users[user]) { users[user] = new User(user); }
			working[user] = true;
			users[user].dbGet();
			users[user].aboutGet();
			users[user].commentsGet();
			users[user].addTags();
		}
	});
	
	
	
	// get a list of offending domains on page
	domains = getDomains();
	domains.forEach(function(domain) {
		// tag offenders
		domain.addTag();
	});
}


// check if new comments have been loaded onto the page
function newComments() {
	let users = $('.author, .s1b41naq-1, ._2tbHP6ZydRpjI44J3syuqC, .s1461iz-1');
	
	if (numUsers != users.length) {
		numUsers = users.length;
		
		// if so, run the main loop again
		rptMain();
	}
}






function whenFinished() {
	if (!checkFinished()) {
			//console.log('not finished...');
			setTimeout(function() { whenFinished(); }, 100);
			return;
	}
	
	let timeElapsed = Math.round((Date.now() - startTime) / 1000);
	let store = navigator.storage.estimate().then((data) => { handleQuota(data); });
}


function checkFinished() {
	if (Object.keys(users).length <= 0) { return false; }
	
	let authors = Object.keys(users);
	for (var i = 0; i < authors.length; i++) {
		if (saved.indexOf(authors[i]) < 0) {
			//console.log('waiting on', authors[i]);
			return false;
		}
	}
	return true;
}





function addHoverEvent(name) {
	$('.rptUser.rpt-' + name).mouseenter((e) => {
		$('.rptTagInfo').remove();
		let label = $(e.target)[0].textContent;
		
		$('<div></div>')
			.addClass('rptTagInfo')
			.css({
				left: 		(e.pageX - 10) + 'px',
				top: 		(e.pageY - 10) + 'px'
			})
			.mouseleave(function () { $('.rptTagInfo').remove();} )
			.appendTo(document.body);
			
		$('.rptTagInfo').html($('<div></div>').addClass('rptTagInfoHeader'));
		$('.rptTagInfo').append($('<div></div>').addClass('rptTagInfoBody'));
		$('.rptTagInfoBody').html($('<table></table>').addClass('rptTagInfoTable'));
		
		
		let header = $('<a href="https://www.reddit.com/user/' + name + '">/u/' + name + '</a>');
		let tag = $('<span></span>')
			.addClass('rptTag rptUser ' + label + 'Color')
			.css({float: 'right'})
			.html(label);
		$('.rptTagInfoHeader').html(header.add(tag));
		
		if (label == 'troll') {
			// Highlight reel of awful
			let subs = users[name].stats.subreddits;
			$('.rptTagInfoTable').append('<tr class="underline"><td class="textCenter" style="width: 100px;">Subreddit</td><td class="textCenter">Comment Karma</td></tr>');
			
			Object.keys(subs).sort(function(a,b){return subs[a].comment.total - subs[b].comment.total}).forEach(function(sub) {
				if (subs[sub].comment.total <= -100) {
					$('.rptTagInfoTable').append('<tr><td class="textCenter" style="width: 100px;">' + sub + '</td><td class="textCenter">' + numPretty(subs[sub].comment.total) + '</td></tr>');
				}
			});
			
			
			
		} else if (label == 'deplorable') {
			//console.log(users[name].stats.subreddits);
			
			let subs = users[name].stats.subreddits;
			let depStats = {};
			//Object.keys(subs).forEach(function(sub) {
			settings.deplorables.forEach(function(sub) {
				if (subs[sub] && subs[sub].comment.total > settings.maxKarma) {
				//if (subs[sub]) {
					depStats[sub] = subs[sub].comment.total;
				}
			});
			
			$('.rptTagInfoTable').append('<tr class="underline"><td class="textCenter" style="width: 100px;">Subreddit</td><td class="textCenter">Comment Karma</td></tr>');
			Object.keys(depStats).sort(function(a,b){return depStats[b] - depStats[a]}).forEach(function(sub) {
				//console.log(sub);
				$('.rptTagInfoTable').append('<tr><td class="textCenter" style="width: 100px;">' + sub + '</td><td class="textCenter">' + numPretty(subs[sub].comment.total) + '</td></tr>');
			});
			
		} else if (label == 'sub troll') {
			
			let url = window.location.href.split('/');
			let viewing = (url[3] == 'r') ? url[4].split('+') : [];
			
			let subs = users[name].stats.subreddits;
			$('.rptTagInfoTable').append('<tr class="underline"><td class="textCenter" style="width: 100px;">Subreddit</td><td class="textCenter">Comment Karma</td></tr>');
			viewing.forEach(function(sub) {
				if (subs[sub] && subs[sub].comment.total <= -100) {
					$('.rptTagInfoTable').append('<tr><td class="textCenter" style="width: 100px;">' + sub + '</td><td class="textCenter">' + numPretty(subs[sub].comment.total) + '</td></tr>');
				}
			});
			
			
		}
		
		//$('.rptTagInfoTable').append('<tr><td>data1</td><td>data2</td></tr>');
		//$('.rptTagInfoTable').append('<tr><td>data1</td><td>data2</td></tr>');
	});
}


function numPretty(num) {
	num = num.toString();
	let nums = num.split('');
	for (var i = num.length - 3; i >= 1; i -= 3) {
		if (nums[i-1] == '-') { continue; }
		nums.splice(i, 0, ',');
	}
	
	return nums.join('');
}










////
// add snoop snoo link to the RES user mouse over div

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










