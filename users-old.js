











"use strict";

// get a list of users on the page
function getAuthors() {
	let authors = [];
	
	// create array of users on the page
	let users = $('.author, .s1b41naq-1, ._2tbHP6ZydRpjI44J3syuqC, .s1461iz-1');
	
	for (var i = 0; i < users.length; i++) {
		let author = $(users[i]).text().replace(/^u\//, '');
		
		if (author == 'AutoModerator') { continue; }
		if (author == 'PoliticsModeratorBot') { continue; }
		if (author == '[deleted]') { continue; }
		
		// if not already in our list of authors
		if (author && author != '' && authors.indexOf(author) < 0) {
			authors.push(author);
		}
	}
	
	// $.each(authors.sort(), function(i, author) {
		// console.log(i + ': ' + author)
	// });
	
	return authors;
}


function SubStats() {
	let empty = function () {
			this.average 	= null;
			this.total 		= 0
			this.length		= 0;
	};
	
	this.link		= new empty();
	this.comment 	= new empty();
}

function User(user) {
	// console.log('user:', user);
	let empty = (typeof(user) == 'string');
	let emptyStats = {
		link:		{
			//updated:	null,
			average:	null,
			total:		0
		},
		'comment':		{
			updated:	null,
			average:	null,
			total:		0
		},
		subreddits: 	{}
	};
	
	this.name 				= (empty) ? user 			: user.name;
	this.about 				= (empty) ? {updated: null}	: user.about;
	this.comments 			= (empty) ? null 			: user.comments;
	this.stats				= (empty) ? emptyStats		: user.stats;
	
	// console.log('empty:', empty);
	this.tags = {}
	for (let type in settings) {
		this.tags[type] = {}
	}
	
	// if (!empty) {
		// console.log(this.name, this.tags);
	// }
	
	
	
	
	
	
	this.dbGet = function() {
		// don't reload user data from the db
		if (this.about.updated) { return; }
		
		let transaction = db.transaction([table]);
		
		// errors
		transaction.onerror = function(e) {
			console.log('user.dbGet transaction error:');
			console.log(e);
		};
		
		let os = transaction.objectStore(table);
		let req = os.get(this.name);
		
		// errors
		req.onerror = function(e) {
			console.log('user.dbGet error: ' + table + '!');
		};
		
		req.onsuccess = () => {
			if (req.result) {
				users[this.name] = new User(req.result);
			} else {
				this.about.updated 			= 0;
				this.stats.comment.updated	= 0;
			}
		};
	}
	

	this.dbSave = function() {
		var os = db.transaction([table], "readwrite").objectStore(table);
		
		var save = {
			name: 				this.name,
			about: 				this.about,
			comments: 			this.comments,
			stats:				this.stats
		};
		
		var req = os.put(save);
		
		req.onerror = function(event) {
			console.log('user.dbSave error: ' + table + ' - ' + this.name + '!');
		};
		
		// req.onsuccess = () => {
			// saved.push(this.name);
		// };
	}
	
	
	
	
	
	this.aboutGet = function () {
		let user = users[this.name];
		
		// wait for the user to load from the db
		if (user.about.updated == null) {
			//console.log('waiting on user from db:', user.name);
			setTimeout(() => { user.aboutGet(); }, 100);
			return;
		}
		
		// if we didn't have about data saved or if the about data is outdated...
		if (user.about.link_karma == undefined || datenow() - user.about.updated > cacheTime) {
			let url = 'https://www.reddit.com/user/' + user.name + '/about.json';
			$.getJSON(url, (json) => { user.aboutSave(json); })
			.fail(function () { user.about.updated = datenow(); });
		}
	};
	
	this.aboutSave = function (json) {
		this.about.link_karma 		= json.data.link_karma;
		this.about.comment_karma 	= json.data.comment_karma;
		this.about.created 			= json.data.created;
		this.about.updated 			= datenow();
	};
	
	
	
	
	this.addTags = function () {
		let user = users[this.name];
		
		// wait on user stats to be generated
		if (!user.about.updated || !user.stats.comment.updated) {
			setTimeout(function() { user.addTags(); }, 100);
			return;
		}
		
		// if (user.name == 'DEYoungRepublicans') {
			// console.log('\t\t\taddTags():', '\t', user.name);
			for (let type in settings) {
				if (type == 'domains') { continue; }
				for (let tag in settings[type]) {
					user.addTag(type, tag);
				}
			}
		// }
		
		delete working[user.name];
	}

	this.tagSpan = function (type, tag, name) {
		let span = $('<span/>').addClass('rptTag').css({
			'background-color': '#' + settings[type][tag].color, 
			'color': 			'#' + settings[type][tag].tcolor
		}).attr({
			user: name,
			type: type,
			tag: tag
		}).text(tag);
		
		return span;
	}
	
	this.addTag  = function(type, tag) {
		let user = users[this.name];
		if (!settings[type][tag].enabled) { return false; }
		
		// console.log('addTag():', '\t', user.name, '\t', type, '\t', tag);
		
		// console.log(user.tags[type]);
		if (tag in user.tags[type]) {
			console.log('\tfound:', type, tag, user.tags[type][tag]);
			return;
		} else {
			// console.log(type, tag, user.name);
			user.tags[type][tag] = this.tagSpan(type, tag, user.name);
		}
		
		if (type == 'accountage') {
			
			let age = Math.round((datenow() - user.about.created) / day);
			if ((settings[type][tag].gtlt == 'greater' && age > settings[type][tag].age) || 
				(settings[type][tag].gtlt != 'greater' && age < settings[type][tag].age)) {
				// console.log(tag, '\t', user.name);
				user.addTagSpan(type, tag);
				return true;
			}
			
		} else if (type == 'subreddits') {
			let subs = [];
			settings[type][tag].list.forEach((sub) => {
				if (!sub || !user.stats.subreddits[sub]) { return; }
				if (settings[type][tag].avgtotal == 'average' && user.stats.subreddits[sub].comment.length <10) { return; }
				
				let comparator = (settings[type][tag].avgtotal == 'total') ? user.stats.subreddits[sub].comment.total : user.stats.subreddits[sub].comment.average;
				
				if ((settings[type][tag].gtlt == 'greater' && comparator > settings[type][tag].karma) ||
					(settings[type][tag].gtlt != 'greater' && comparator < settings[type][tag].karma)) {
					subs.push(sub);
				}
			});
			if (subs.length) {
				user.addTagSpan(type, tag, subs);
			}
			
		} else if (type == 'subkarma') {
			let url = window.location.href.split('/');
			let urlSubs = (url[3] == 'r') ? url[4].split('+') : [];
			let subs = [];
			urlSubs.forEach((sub) => {
				if (!sub || !user.stats.subreddits[sub]) { return; }
				if (settings[type][tag].avgtotal == 'average' && user.stats.subreddits[sub].comment.length <10) { return; }
				
				let comparator = (settings[type][tag].avgtotal == 'total') ? user.stats.subreddits[sub].comment.total : user.stats.subreddits[sub].comment.average;
				
				if ((settings[type][tag].gtlt == 'greater' && comparator > settings[type][tag].karma) ||
					(settings[type][tag].gtlt != 'greater' && comparator < settings[type][tag].karma)) {
					// console.log(tag, sub, settings[type][tag].avgtotal, comparator, settings[type][tag].gtlt, settings[type][tag].karma, user.name);
					subs.push(sub);
				}
			});
			if (subs.length) {
				user.addTagSpan(type, tag, subs);
			}
		} else if (type == 'karma') {
			
			
			
		}
	}
	
	this.addTagSpan = function(type, tag, subs = false) {
		let user = users[this.name];
		// console.log(user);
		let timer = Date.now();
		
		$('.rptTag[user="' + this.name + '"][type="' + type + '"][tag="' + tag + '"]').remove();
		let span = $('<span/>').addClass('rptTag').css({
			'background-color': '#' + settings[type][tag].color, 
			'color': 			'#' + settings[type][tag].tcolor
		}).attr({
			user: user.name,
			type: type,
			tag: tag
		}).text(tag);
		let displayTag = span.clone().css({'position': 'relative', 'top': '-2px'});
		
		let div = $('<div/>')
			.addClass('rptTagInfo')
			.css('font-size', 'x-small')
			.mouseleave(function () { this.remove();});
		
		let header = $('<div/>').addClass('textCenter').css({
			'margin-bottom': '10px', 
			'white-space': 'nowrap', 
			'font-size': '110%'});
			
		let rpt = $('<span/>').addClass('textCenter bold').css({
			'color': '#dd0000', 
			'font-size': '130%',
			'margin-right': '5px'
		}).text('Reddit Pro Tools');
		header.append([rpt, displayTag]);
				
		if (type == 'accountage') {
			let year = 365.25;
			let age = Math.round((datenow() - user.about.created) / day);
			let years = Math.floor(age / year);
			let months = Math.floor(age % year / year * 12);
			let days = Math.floor(age - years * year - months * year / 12);
			
			let ageText = (years) ? years + ' years,' : '';
			ageText += (months) ? ' ' + months + ' months,' : ''
			ageText += (days) ? ' ' + days + ' days' : '';
			
			// console.log(user.name, years, months, days);
			
			span.mouseenter((e) => {
				this.positionRptTagInfo(div, e.pageX, e.pageY);
				
				// console.log(menu[type].label);
				
				let body = $('<div/>');
				body.append($('<a/>').attr('href', 'http://reddit.com/u/' + user).text('/u/' + user.name));
				// body.append($('<span/>').text(': ' + years + ' years, ' + months + ' months, and ' + days + ' days'));
				body.append($('<span/>').text(': ' + ageText));
				
				
				
				div.empty();
				div.append([header, body]);
				
				span.after(div);
			});
		} else if (type == 'subreddits') {
			span.mouseenter((e) => {
				this.positionRptTagInfo(div, e.pageX, e.pageY);
			
				// let subs = settings[type][tag].list;
				// console.log(subs);
				let body = $('<div/>').append(this.statsTable(type, tag, subs));
				
				div.empty();
				div.append([header, body]);
				span.after(div);
			});
			
		} else if (type == 'subkarma') {
			span.mouseenter((e) => {
				this.positionRptTagInfo(div, e.pageX, e.pageY);
			
				let url = window.location.href.split('/');
				let urlSubs = (url[3] == 'r') ? url[4].split('+') : [];
				// console.log(subs);
				let body = $('<div/>').append(this.statsTable(type, tag, urlSubs));
				
				div.empty();
				div.append([header, body]);
				span.after(div);
			});
			
		} else if (type == 'karma') {
			
			
			
		}
		
		
		
		
		let userDiv = $(
			'.author:contains(' + 
			this.name + '), .s1b41naq-1:contains(' + 
			this.name + '), ._2tbHP6ZydRpjI44J3syuqC:contains(' + 
			this.name + '), .s1461iz-1:contains(' + 
			this.name + ')');
		userDiv.after(span);
		
		// console.log(Date.now() - timer + '\t' + user.name);
	}
	
	this.statsTable = function(type, tag, subs) {
		let user = users[this.name];
		
		// used to sort subreddits
		let sortBy = {};
		subs.forEach(function(sub) {
			if (user.stats.subreddits[sub]) {
				sortBy[sub] = user.stats.subreddits[sub].comment.total;
			}
		});
		
		let table = $('<table/>').css('width', '100%');
		let tr = $('<tr/>');
		let td = $('<td/>').addClass('textCenter').css({
			'padding-left': '5px', 
			'padding-right': '5px',
		});
		table.append(
			tr.clone().css('color', '#000000').append([
				td.clone().addClass('border').css('border-width', '0px 1px 1px 0px').text('Subreddit'),
				td.clone().addClass('border').css('border-width', '0px 1px 1px 0px').text('Total Karma'),
				td.clone().addClass('border').css('border-width', '0px 1px 1px 0px').text('Average Karma'),
				td.clone().addClass('border').css('border-width', '0px 0px 1px 0px').text('Comments')
			])
		);
		
		Object.keys(sortBy).sort(function(a,b){return sortBy[b] - sortBy[a]}).forEach(function(sub) {
			let comparator = (settings[type][tag].avgtotal == 'total') ? user.stats.subreddits[sub].comment.total : user.stats.subreddits[sub].comment.average;
			table.append(tr.clone().append([
				td.clone().text(sub), 
				td.clone().text(numPretty(user.stats.subreddits[sub].comment.total)),
				td.clone().text(numPretty(user.stats.subreddits[sub].comment.average)),
				td.clone().text(numPretty(user.stats.subreddits[sub].comment.length))
			]));
		});
		return table;
	}
	
	this.positionRptTagInfo = function(div, pageX, pageY) {
		div.css({
			left: 		(pageX - 50) + 'px',
			top: 		(pageY - 20) + 'px'
		});
		return div;
	}
	
	// Old code from previous version
	// this.addTag = function (label) {
		// let user = $('.author:contains(' + this.name + '), .s1b41naq-1:contains(' + this.name + '), ._2tbHP6ZydRpjI44J3syuqC:contains(' + this.name + '), .s1461iz-1:contains(' + this.name + ')');
		
		// user.after('<span>' + label + '</span>');
		// user.next().addClass('rptTag rptUser rpt-' + this.name + ' ' + label.split(' ').join('') + 'Color');
		// if (label == 'troll' || label == 'sub troll' || label == 'deplorable') { addHoverEvent(this.name); }
	// }
	
	// Old code from previous version
	// this.labels = function() {
		// return []; // remove for production
		// let labels = [];
		
		// frank
		// let age = Math.round((datenow() - this.about.created) / day);
		// if (this.about.comment_karma < settings.minKarma && age < settings.minAge) {
			// labels.push('frank');
		// }
		
		// troll
		// if (this.about.comment_karma <= -100) {
			// labels.push('troll');
			
		// } else {
			// sub troll
			// let url = window.location.href.split('/');
			// let subs = (url[3] == 'r') ? url[4].split('+') : [];
			// let subTroll = false;
			// subs.forEach((sub) => {
				// if (sub && this.stats.subreddits[sub] && this.stats.subreddits[sub].comment.total <= -100) {
					// console.log(sub + ': ' + this.stats.subreddits[sub].comment.total);
					// subTroll = true;
				// }
			// });
			// if (subTroll) { labels.push('sub troll'); }
		// }
		
		// deplorable
		// let deplorable = false;
		// settings.deplorables.forEach((sub) => {
			// if (this.stats.subreddits[sub] && this.stats.subreddits[sub].comment.total > settings.maxKarma) {
				// deplorable = true;
			// }
		// });
		// if (deplorable) { labels.push('deplorable') }
		
		// return labels.reverse();
	// }
	
	
	this.commentsGet = function () {
		let user = users[this.name];
		
		// wait for the user to load from the db
		if (user.stats.comment.updated == null) {
			//console.log('waiting on user from db:', user.name, user.about.updated);
			setTimeout(() => { user.commentsGet(); }, 100);
			return;
		}
		
		// if no saved comments
		if (user.comments == null) {
			user.comments = [];
			console.log('get all comments: ' + user.name);
			let url = 'https://www.reddit.com/user/' + user.name + '/comments.json?limit=100';
			//console.log(url);
			
			$.getJSON(url, function(json) { user.commentsSave(json); })
				.fail(function () { user.stats.comment.updated = datenow(); });
		// saved comments but needs update
		} else if (!user.stats.comment.updated || (datenow() - user.stats.comment.updated) > cacheTime) {
			if (user.stats.comment.updated && (datenow() - user.stats.comment.updated) > cacheTime) {
				let since = round((datenow() - user.stats.comment.updated) / cacheTime);
				console.log('update comments: ' + user.name + ' - days since last seen: - ' + since);
			}
			
			//console.log('update comments', user.name);
			user.purgeRecent();
			let before = (user.comments[0]) ? user.comments[0].name : '';
			let url = 'https://www.reddit.com/user/' + user.name + '/comments.json?limit=100&before=' + before;
			//console.log(url);
			$.getJSON(url, function(json) { user.commentsUpdate(json); })
				.fail(function () { user.stats.comment.updated = datenow(); });
			
		// comments are up to date, no need to hit the api
		// } else {
			// console.log('use saved comments:', user.name);
			// saved.push(user.name);
		}
		
	};
	
	
	// delete comments less than 2 days old
	this.purgeRecent = function () {
		
		let twodays = datenow() - (2 * day);
		let i;
		for (i = 0; i < this.comments.length; i++) {
			if (this.comments[i].created < twodays) { break; }
		}
		
		this.comments.splice(0, i-1);
	}
	
	this.commentsSave = function (json) {
		let user = users[this.name];
		
		//console.log(json.data.children);
		json.data.children.forEach(function(comment) {
			let save = {
				name: 				comment.data.name,
				parent_id:			comment.data.parent_id,
				created:			comment.data.created_utc,
				permalink:			comment.data.permalink,
				subreddit:			comment.data.subreddit,
				body:				comment.data.body,
				controversiality:	comment.data.controversiality,
				score:				comment.data.score,
				ups:				comment.data.ups
			};
			
			user.comments.push(save);
		});
		
		// more comments left
		if (json.data.after) {
			let after = json.data.children[json.data.children.length-1].data.name;
			let url = 'https://www.reddit.com/user/' + user.name + '/comments.json?limit=100&after=' + after;
			//console.log(url);
			$.getJSON(url, function (json) { user.commentsSave(json); })
				.fail(function () { user.stats.comment.updated = datenow(); });
			
		// finished getting all comments
		} else {
			//console.log('save finished: ' + user.name);
			user.commentsEval();
		}
	};
	
	this.commentsUpdate = function(json) {
		let user = users[this.name];
		
		json.data.children.reverse().forEach(function(comment) {
			let save = {
				name: 				comment.data.name,
				parent_id:			comment.data.parent_id,
				created:			comment.data.created_utc,
				permalink:			comment.data.permalink,
				subreddit:			comment.data.subreddit,
				body:				comment.data.body,
				controversiality:	comment.data.controversiality,
				score:				comment.data.score,
				ups:				comment.data.ups
			};
			
			user.comments.unshift(save);
		});
		
		// more comments left
		if (json.data.before) {
			let before = json.data.children[0].data.name;
			let url = 'https://www.reddit.com/user/' + user.name + '/comments.json?limit=100&before=' + before;
			//console.log(url);
			$.getJSON(url, function(json){ user.commentsUpdate(json); })
				.fail(function () { user.stats.comment.updated = datenow(); });
			
		// finished getting all comments
		} else {
			//console.log('update finished: ' + user.name);
			user.commentsEval();
		}
	};
	
	this.commentsEval = function() {
		//console.log('commentsEval:', this.name);
		
		// keep up to 1000 comments, discard old ones over 1000
		if (this.comments.length >= 1000) {
			this.comments.splice(1000, this.comments.length-1);
		}
		
		this.stats.comment.total = 0;
		this.comments.forEach((comment) => {
			this.stats.comment.total += comment.score;
		});
		let scoreAvg = Math.round(this.stats.comment.total / this.comments.length * 100) / 100;
		this.stats.comment.average = scoreAvg;
		
		
		this.stats.subreddits = {};
		this.comments.forEach((comment) => {
			if (!this.stats.subreddits[comment.subreddit]) { this.stats.subreddits[comment.subreddit] = new SubStats; }
			//if (comment.subreddit == 'link' || comment.subreddit == 'comment') { console.log('sub: ' + comment.subreddit); }
			let sub = this.stats.subreddits[comment.subreddit];
			sub.comment.total += comment.score;
			sub.comment.length++;
			sub.comment.average = Math.round(sub.comment.total / sub.comment.length * 100) / 100;
			//console.log(comment.subreddit + ': ' +  this.stats.subreddits[sub].comment.total);
		});
		
		
		this.stats.comment.updated = datenow();
		this.dbSave();
	}
	
	
	
	
	/*
	// for future development
	this.linksGet = function () {
		
	}
	
	this.linksSave() {
		
	}
	*/
}



function round(num) {
	return Math.round(num * 100) / 100;
}

function datenow() {
	return Math.round(Date.now() / 1000);
}






























