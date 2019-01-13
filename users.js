





















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



function User(username) {
	printLog('User():', username);
	
	this.name = username;
	this.about = {updated: null};
	this.comments = null;
	this.working = false;
	this.hasTag = false;
	this.tags = {};
	this.stats = {
		links:		{
			updated:	null,
			average:	null,
			total:		0
		},
		comments:		{
			updated:	null,
			average:	null,
			total:		0
		},
		subreddits: 	{}
	};
	
	
	
	this.getComments = function() {
		// wait for the user to load from the db
		if (this.stats.comments.updated == null) {
			// console.log('getComments() waiting on user from db:', this.name);
			setTimeout(() => { this.getComments(); }, 100);
			return;
		}
		printLog('\tgetComments:', this.name);
		
		// console.log(this.comments);
		
		if (!this.comments || !this.comments[0] || !this.comments[0].name) {
			this.comments = [];
			this.getCommentsJson('after');
		} else if (!this.stats.comments.updated || (datenow() - this.stats.comments.updated) > cacheTime) {
			this.getCommentsJson('before', this.comments[0]);
		} else {
			this.evalComments();
		}
	}
	
	this.getCommentsJson = function(type = 'after', id = null) {
		// console.log('\t\tgetCommentsJson(' + type + ', ' + id + '):', this.name);
		let url = 'https://www.reddit.com/user/' + this.name + '/comments.json?sort=new&limit=100';
		
		if (id) {
			url += '&' + type + '=' + id;
		}
		
		// console.log('\t\t\t\turl:', url.replace(/.*\//g, ''), '\n');

		// $.getJSON(url, (json) => {
			// json.data.before = (json.data.children[0]) ? json.data.children[0].data.name : null;
			// this.saveComments(type, json);
			
			// if (json.data[type]) {
				// setTimeout(() => { this.getCommentsJson(type, json.data[type]); }, 10000);
				// this.getCommentsJson(type, json.data[type]);
			// } else {
				// console.log('finished comments:', this.name);
				// this.evalComments();
			// }
		// }).fail(function () { this.stats.comments.updated = datenow(); });
		
		$.ajax({
			type: 'GET',
			url: url,
			dataType: 'json',
			success: (json) => {
				json.data.before = (json.data.children[0]) ? json.data.children[0].data.name : null;
				this.saveComments(type, json);
				
				if (json.data[type]) {
					// setTimeout(() => { this.getCommentsJson(type, json.data[type]); }, 10000);
					this.getCommentsJson(type, json.data[type]);
				} else {
					// console.log('finished comments:', this.name);
					this.evalComments();
				}
			},
			fail: function() { 
				console.log('ajax failed:', url);
				this.stats.comments.updated = datenow();
			}
		});
	}
	
	
	this.saveComments = function (type, json) {
		// console.log('\t\t\tsaveComments(' + type + ')');
		
		let saved = [];
		json.data.children.forEach((comment) => {
			let save = {
				// parent_id:		comment.data.parent_id,
				// permalink:		comment.data.permalink,
				// body:			comment.data.body,
				// ups:				comment.data.ups,
				name: 				comment.data.name,
				created:			comment.data.created_utc,
				subreddit:			comment.data.subreddit,
				controversiality:	comment.data.controversiality,
				score:				comment.data.score,
			};
			
			saved.push(save);
		});
	
		if (type == 'after') {
			this.comments = this.comments.concat(saved);
		} else {
			this.comments = saved.concat(this.comments);
		}
	}
	
	this.evalComments = function () {
		printLog('\t\tevalComments():', this.name);
		
		// keep up to 1000 comments, discard old ones over 1000
		if (this.comments.length >= 1000) {
			this.comments.splice(1000, this.comments.length-1);
		}
		
		this.stats.comments.total = 0;
		this.comments.forEach((comment) => {
			this.stats.comments.total += comment.score;
		});
		let scoreAvg = Math.round(this.stats.comments.total / this.comments.length * 100) / 100;
		this.stats.comments.average = scoreAvg;
		
		
		this.stats.subreddits = {};
		this.comments.forEach((comment) => {
			if (!this.stats.subreddits[comment.subreddit]) { this.stats.subreddits[comment.subreddit] = new SubStats; }
			
			let sub = this.stats.subreddits[comment.subreddit];
			sub.comment.total += comment.score;
			sub.comment.length++;
			sub.comment.average = Math.round(sub.comment.total / sub.comment.length * 100) / 100;
		});
		
		this.stats.comments.updated = datenow();
		this.evalTags();
		this.saveDb();
	}
	
	
	this.evalTags = function () {
		printLog('\t\t\tevalTags():', this.name);
		let statsTableLength = 10;
	
		for (let type in settings) {
			this.tags[type] = {}
			for (let tag in settings[type]) {
				if (!settings[type][tag].enabled) { continue; }
				
				if (type == 'accountage') {
					let age = Math.round((datenow() - this.about.created) / day);
					if ((settings[type][tag].gtlt == 'greater' && age > settings[type][tag].age) || 
						(settings[type][tag].gtlt != 'greater' && age < settings[type][tag].age)) {
						this.tags[type][tag] = true;
						this.hasTag = true;
					}
					
				} else if (type == 'subreddits') {
					// let subs = [];
					settings[type][tag].list.forEach((sub) => {
						if (!sub || !this.stats.subreddits[sub]) { return; }
						if (settings[type][tag].avgtotal == 'average' && this.stats.subreddits[sub].comment.length < 10) { return; }
						
						let comparator = (settings[type][tag].avgtotal == 'total') ? this.stats.subreddits[sub].comment.total : this.stats.subreddits[sub].comment.average;
						
						if ((settings[type][tag].gtlt == 'greater' && comparator > settings[type][tag].karma) ||
							(settings[type][tag].gtlt != 'greater' && comparator < settings[type][tag].karma)) {
							// subs.push(sub);
							let subs = this.subSort(type, tag, settings[type][tag].list);
							subs.splice(statsTableLength);
							this.tags[type][tag] = subs;
							this.hasTag = true;
							return;
						}
					});
					
					// if (subs.length) {
						// subs = this.subSort(type, tag, subs);
						// subs.splice(statsTableLength);
						// this.tags[type][tag] = subs;
						// this.hasTag = true;
					// }
					
				} else if (type == 'subkarma') {
					let url = window.location.href.split('/');
					let urlSubs = (url[3] == 'r') ? url[4].split('+') : [];
					let subs = [];
					urlSubs.forEach((sub) => {
						if (!sub || !this.stats.subreddits[sub]) { return; }
						if (settings[type][tag].avgtotal == 'average' && this.stats.subreddits[sub].comment.length < 10) { return; }
						
						let comparator = (settings[type][tag].avgtotal == 'total') ? this.stats.subreddits[sub].comment.total : this.stats.subreddits[sub].comment.average;
						
						if ((settings[type][tag].gtlt == 'greater' && comparator > settings[type][tag].karma) ||
							(settings[type][tag].gtlt != 'greater' && comparator < settings[type][tag].karma)) {
							subs.push(sub);
						}
					});
					
					if (subs.length) {
						subs = this.subSort(type, tag, subs);
						subs.splice(statsTableLength);
						this.tags[type][tag] = subs;
						this.hasTag = true;
					}
					
				} else if (type == 'karma') {
					let comparator = (settings[type][tag].avgtotal == 'total') ? this.stats.comments.total : this.stats.comments.average;
					
					if ((settings[type][tag].gtlt == 'greater' && comparator > settings[type][tag].karma) ||
						(settings[type][tag].gtlt != 'greater' && comparator < settings[type][tag].karma)) {
						
						let subs = this.subSort(type, tag, Object.keys(this.stats.subreddits));
						subs.splice(statsTableLength);
						
						this.tags[type][tag] = subs;
						this.hasTag = true;
					}
					
				}
			}
		}
	}
	
	this.subSort = function (type, tag, subs) {						
		let sortBy = [];
		// for (let sub in subs) {
		subs.forEach((sub) => {
			if (!(sub in this.stats.subreddits)) { return; }
			sortBy[sub] = (settings[type][tag].avgtotal == 'total') ? this.stats.subreddits[sub].comment.total : this.stats.subreddits[sub].comment.average;
		});
		
		subs = Object.keys(sortBy).sort(function(a, b){ return sortBy[b] - sortBy[a]; });
		
		if (settings[type][tag].gtlt != 'greater') { subs = subs.reverse(); }
		
		return subs;
	}
	
	
	
	
	
	
	
	this.addTags = function () {
		// wait on tags to be generated
		if (!Object.keys(this.tags).length) {
			setTimeout(() => { this.addTags(); }, 100);
			return;
		}
		if (!this.hasTag) { return; }
		printLog('\t\t\t\taddTags():', this.name);
		
		// $('.rptTag.rptUser-' + this.name).remove();
		$('span.rptTagWrapper.rptUser-' + this.name).remove();
		
		let tagSpans = [];
		for (let type in this.tags) {
			for (let tag in this.tags[type]) {
				tagSpans.push(this.tagSpan(type, tag, this.tags[type][tag]));
			}
		}
		
		let userDiv = $(
			'.author:contains(' + 
			this.name + '), .s1b41naq-1:contains(' + 
			this.name + '), ._2tbHP6ZydRpjI44J3syuqC:contains(' + 
			this.name + '), .s1461iz-1:contains(' + 
			this.name + ')');
		userDiv.after(this.tagWrapper().append(tagSpans));
		// let test = document.createElement('p');
		// let wrapper = this.tagWrapper();
		// wrapper.appendChild(tagSpans);
		// console.log(wrapper);
		// userDiv.after(wrapper);
		this.working = false;
	}
	
	this.tagWrapper = function() {
		let span = $('<span/>').addClass('rptTagWrapper rptUser-' + this.name);
		// let span = document.createElement('span');
		// span.className = 'rptTagWrapper rptUser-' + this.name;
		return span;
	}
	
	this.tagSpan = function(type, tag, subs = []) {
		// console.log('tagSpan():', this.name);
		let span = $('<span/>').addClass('rptTag rptUser-' + this.name).css({
			'background-color': '#' + settings[type][tag].color, 
			'color': 			'#' + settings[type][tag].tcolor
		}).attr({
			user: this.name,
			type: type,
			tag: tag
		}).text(tag);
		
		// Hover elements defined here...
		let displayTag = span.clone(); //.css({'position': 'relative', 'top': '-2px'});
		
		let hoverDiv = $('<div/>')
			.addClass('rptTagInfo')
			.css('font-size', 'x-small')
			.mouseleave(function () { this.remove();});
		
		let header = $('<div/>').addClass('textCenter').css({
			'margin-bottom': '5px', 
			'white-space': 'nowrap', 
			'font-size': '110%'});
		
		let rpt = $('<div/>').addClass('textCenter bold').css({
			'color': '#dd0000', 
			'font-size': '130%',
			'margin-bottom': '5px'
		}).text('Reddit Pro Tools');
		
		header.append([$('<a/>').attr('src', '/u/' + this.name).text(' /u/' + this.name), ':', displayTag]);
		
		let tagDesc = $('<div/>').addClass('textCenter bold border').css({
			'padding-top': '5px',
			'font-size': '90%',
			'border-width': '1px 0px 0px 0px'});
			
		let body = $('<div/>').css({
			'margin-top': '7px'});
				
		if (type == 'accountage') {
			let year = 365.25;
			let age = Math.round((datenow() - this.about.created) / day);
			let years = Math.floor(age / year);
			let months = Math.floor(age % year / year * 12);
			let days = Math.floor(age - years * year - months * year / 12);
			
			let ageText = (years) ? years + ' years,' : '';
			ageText += (months) ? ' ' + months + ' months,' : ''
			ageText += (days) ? ' ' + days + ' days' : '';
			
			// console.log(this.name, years, months, days);
			
			span.mouseenter((e) => {
				tagDesc.text('Account age ' + settings[type][tag].gtlt + ' than ' + settings[type][tag].age + ' days');
				// body.append($('<a/>').attr('href', 'http://reddit.com/u/' + this.name).text('/u/' + this.name));
				body.html($('<div/>').addClass('textCenter').text('Account age: ' + ageText));
				
				hoverDiv.empty();
				hoverDiv.append([rpt, header, tagDesc, body]);
				
				$('body').append(hoverDiv);
				hoverDiv = this.positionRptTagInfo(hoverDiv, e.pageX, e.pageY);
			});
		} else if (type == 'subreddits') {
			span.mouseenter((e) => {
				tagDesc.text('Comment karma ' + settings[type][tag].gtlt + ' than ' + settings[type][tag].karma + ' in:');
				
				let subLimit = 4;
				let subsText = '';
				for (let i in settings[type][tag].list) {
					if (i > subLimit - 1) { continue; }
					// console.log(i, settings[type][tag].list[i]);
					if (i != 0) {
						subsText += ', ';
					}
					subsText += settings[type][tag].list[i];
				}
				if (settings[type][tag].list.length > subLimit) { 
					subsText += ', ...';
				}
				let subsList = $('<div/>').addClass('textCenter').text(subsText);
				
				body.html(this.statsTable(type, tag, subs));
				
				hoverDiv.empty();
				hoverDiv.append([rpt, header, tagDesc, subsList, body]);
				
				$('body').append(hoverDiv);
				hoverDiv = this.positionRptTagInfo(hoverDiv, e.pageX, e.pageY);
			});
			
		} else if (type == 'subkarma') {
			span.mouseenter((e) => {
				tagDesc.text('Comment karma ' + settings[type][tag].gtlt + ' than ' + settings[type][tag].karma + ' in current subreddit');
				body.html(this.statsTable(type, tag, subs));
				
				hoverDiv.empty();
				hoverDiv.append([rpt, header, tagDesc, body]);
				
				$('body').append(hoverDiv);
				hoverDiv = this.positionRptTagInfo(hoverDiv, e.pageX, e.pageY);
			});
			
		} else if (type == 'karma') {
			span.mouseenter((e) => {
				tagDesc.text('Total comment karma ' + settings[type][tag].gtlt + ' than ' + settings[type][tag].karma);
				body.html(this.statsTable(type, tag, subs));
				
				hoverDiv.empty();
				hoverDiv.append([rpt, header, tagDesc, body]);
				
				$('body').append(hoverDiv);
				hoverDiv = this.positionRptTagInfo(hoverDiv, e.pageX, e.pageY);
			});
		}
		
		return span;
	}
	
	this.positionRptTagInfo = function(div, pageX, pageY) {
		div.css({
			left: 		(pageX - 50) + 'px',
			top: 		(pageY - 20) + 'px'
		});
		
		let pos = $(div)[0].getBoundingClientRect();
		
		if (0 > pos.left) {
			div.css('left', '0px');
		}
		if (0 > pos.top) {
			div.css('top', $(window).scrollTop() + 'px');
		}
		if (pos.right > $(window).innerWidth()) {
			div.css('left', ($(window).scrollLeft() + $(window).innerWidth() - pos.width - 10) + 'px');
		}
		if (pos.bottom > $(window).innerHeight()) {
			div.css('top', ($(window).scrollTop() + $(window).innerHeight() - pos.height) + 'px');
		}
		
		return div;
	}
	
	this.statsTable = function(type, tag, subs) {
		// console.log(type, tag, subs);
		// used to sort subreddits
		// let sortBy = {};
		// subs.forEach((sub) => {
			// console.log(this.stats);
			// if (this.stats.subreddits[sub]) {
				// sortBy[sub] = this.stats.subreddits[sub].comment.total;
			// }
		// });
		
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
		
		subs.forEach((sub) => {
			let comparator = (settings[type][tag].avgtotal == 'total') ? this.stats.subreddits[sub].comment.total : this.stats.subreddits[sub].comment.average;
			table.append(tr.clone().append([
				td.clone().text(sub), 
				td.clone().text(numPretty(this.stats.subreddits[sub].comment.total)),
				td.clone().text(numPretty(this.stats.subreddits[sub].comment.average)),
				td.clone().text(numPretty(this.stats.subreddits[sub].comment.length))
			]));
		});
		return table;
	}
	
	
	
	
	
	
	
	
	
	
	
	this.getAbout = function () {
		// wait for the db to load the user
		if (this.about.updated == null) {
			// console.log('waiting on user from db:', this.name);
			setTimeout(() => { this.getAbout(); }, 100);
			return;
		}
		// console.log('\taboutGet():\t\t', this.name);
		
		// if we didn't have about data saved or if the about data is outdated...
		if (this.about.link_karma == undefined || datenow() - this.about.updated > cacheTime) {
			let url = 'https://www.reddit.com/user/' + this.name + '/about.json';
			$.getJSON(url, (json) => { this.saveAbout(json); })
				.fail(function () { this.about.updated = datenow(); });
		}
	};
	
	this.saveAbout = function (json) {
		this.about.link_karma 		= json.data.link_karma;
		this.about.comment_karma 	= json.data.comment_karma;
		this.about.created 			= json.data.created;
		this.about.updated 			= datenow();
	};
	
	
	
	
	this.getDb = function() {
		// console.log('\tdbGet():', this.name);
		
		let transaction = db.transaction([table]);
		
		// transaction errors
		transaction.onerror = function(e) {
			console.log('user.dbGet transaction error:');
			console.log(e);
		};
		
		let os = transaction.objectStore(table);
		let req = os.get(this.name);
		
		// request errors
		req.onerror = function(e) {
			console.log('user.dbGet error: ' + table + '!');
		};
		
		req.onsuccess = () => {
			if (req.result) {
				this.about = req.result.about;
				this.stats = req.result.stats;
				this.comments = req.result.comments;
			} else {
				this.about.updated 			= 0;
				this.stats.comments.updated	= 0;
			}
			// console.log('db finishsed:\t', this.name);
		};
	}
	

	this.saveDb = function() {
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
	}
	
	this.getDb();
	this.getAbout();
	this.getComments();
}



function round(num) {
	return Math.round(num * 100) / 100;
}

function datenow() {
	return Math.round(Date.now() / 1000);
}





































