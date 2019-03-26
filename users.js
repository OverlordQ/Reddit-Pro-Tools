





















"use strict";

// get a list of users on the page
function getAuthors() {
	let authors = [];
	
	let userElems = document.evaluate(
		'//a[(contains(@class, "author") or contains(@class, "s1b41naq-1") or contains(@class, "_2tbHP6ZydRpjI44J3syuqC") or contains(@class, "s1461iz-1"))]', 
		document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	
	let i = 0;
	while (userElems.snapshotItem(i)) {
		let author = userElems.snapshotItem(i).textContent.replace(/^u\//, '');
		
		// if not already in our list of authors
		if (author && 
			author != '' && 
			authors.indexOf(author) < 0 &&
			author != '[deleted]' &&
			author != 'AutoModerator' &&
			author != 'PoliticsModeratorBot' &&
			author != 'LegalAdviceModerator' &&
			author != 'court-reporter' &&
			author != 'Invite to chat') {
				
			authors.push(author);
		}
		i++;
	}
	
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
		
		let userElems = this.getUserElemements();
		
		userElems.forEach((userElem) => {
			let wrapper = this.tagWrapper();
			for (let type in this.tags) {
				for (let tag in this.tags[type]) {
					let tagSpan = this.tagSpan(type, tag);
					
					wrapper.appendChild(tagSpan);
				}
			}
			setTimeout(function() { userElem.before(wrapper); }, Math.random() * 500);
		});
		
		
		this.working = false;
	}
	
	this.getUserElemements = function() {
		let userLinks = [];
		
		let userElems = document.evaluate(
			'//a[(contains(@class, "author") or contains(@class, "s1b41naq-1") or contains(@class, "_2tbHP6ZydRpjI44J3syuqC") or contains(@class, "s1461iz-1")) and text()="' + this.name + '"]', 
			document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		
		let i = 0;
		while (userElems.snapshotItem(i)) {
			let userElem = userElems.snapshotItem(i);
			
			// if it doesn't already have a tag...
			if (!userElem.previousSibling || !userElem.previousSibling.tagName || userElem.previousSibling.tagName == 'A') {
				userLinks.push(userElem);
			}
			i++;
		}
		
		return userLinks.reverse();
	}
	
	this.tagWrapper = function() {
		let span = document.createElement('span');
		span.className = 'rptTagWrapper rptUser-' + this.name;
		return span;
	}
	
	this.tagSpan = function(type, tag) {
		let span = document.createElement('span');
		span.textContent = tag;
		// span.className = 'rptTag rptUser-' + this.name;
		span.className = 'rptTag';
		span.style.backgroundColor = '#' + settings[type][tag].color;
		span.style.color = '#' + settings[type][tag].tcolor;
		
		let displayTag = span.cloneNode(true);
		
		span.addEventListener('mouseenter', (e) => {
			let hoverDiv = document.createElement('div');
			hoverDiv.className = 'rptTagInfo';
			
			let zIndex = 1000000;
			if (span.parentElement.className.split(' ').includes('fieldPair-text')) {
				zIndex = span.parentElement.parentElement.parentElement.parentElement.parentElement.style.zIndex + 10;
			}
			hoverDiv.style.zIndex = zIndex;
			
			hoverDiv.addEventListener('mouseleave', (e) => {
				hoverDiv.parentNode.removeChild(hoverDiv);
			});
			
			let header = document.createElement('div');
			header.className = 'rptTagInfoHeader textCenter';
			
			let rpt = document.createElement('div');
			rpt.style.color = '#ff0000';
			rpt.style.fontSize = '130%';
			rpt.style.marginBottom = '5px';
			rpt.textContent = 'Reddit Pro Tools';
			rpt.className = 'textCenter bold';
			
			// let userLink
			
			// header.append([$('<a/>').attr('src', '/u/' + this.name).text(' /u/' + this.name), ':', displayTag]);
			
			let userLink = document.createElement('a');
			userLink.href = '/u/' + this.name;
			userLink.textContent = '/u/' + this.name;
			
			let colon = document.createElement('span');
			colon.textContent = ': ';
			
			header.appendChild(userLink);
			header.appendChild(colon);
			header.appendChild(displayTag);
			
				
			// let body = $('<div/>').css({
				// 'margin-top': '7px'});
				
			let tagDesc = document.createElement('div');
			tagDesc.className = 'rptTagInfoDesc textCenter bold';
				
			let body = document.createElement('div');
			body.className = 'rptTagInfoBody textCenter';
			
			if (type == 'accountage') {
				let year = 365.25;
				let age = Math.round((datenow() - this.about.created) / day);
				let years = Math.floor(age / year);
				let months = Math.floor(age % year / year * 12);
				let days = Math.floor(age - years * year - months * year / 12);
				
				let ageText = (years) ? years + ' years,' : '';
				ageText += (months) ? ' ' + months + ' months,' : ''
				ageText += (days) ? ' ' + days + ' days' : '< 1 day';
				
				tagDesc.textContent = 'Account age ' + settings[type][tag].gtlt + ' than ' + numPretty(settings[type][tag].age) + ' days';
				body.textContent = 'Account age: ' + ageText;
				
			} else if (type == 'subreddits') {
				// console.log(this.name, type, tag, this.tags[type][tag]);
				
				let subLimit = 4;
				let subsText = '';
				for (let i in settings[type][tag].list) {
					if (i > subLimit - 1) { continue; }
					if (i != 0) {
						subsText += ', ';
					}
					subsText += settings[type][tag].list[i];
				}
				if (settings[type][tag].list.length > subLimit) { 
					subsText += ', ...';
				}
				
				tagDesc.innerHTML = 'Comment karma ' + settings[type][tag].gtlt + ' than ' + numPretty(settings[type][tag].karma) + ' in:';
				
				let subsDiv = document.createElement('div');
				subsDiv.style.fontWeight = 'normal';
				subsDiv.textContent = '(' + subsText + ')';
				tagDesc.append(subsDiv);
				
				body.append(this.statsTable(this.tags[type][tag]));
				
			} else if (type == 'subkarma') {
				tagDesc.textConent = 'Comment karma ' + settings[type][tag].gtlt + ' than ' + numPretty(settings[type][tag].karma) + ' in current subreddit';
				body.append(this.statsTable(this.tags[type][tag]));
				
			} else if (type == 'karma') {
				tagDesc.textContent = 'Total comment karma ' + settings[type][tag].gtlt + ' than ' + numPretty(settings[type][tag].karma);
				body.append(this.statsTable(this.tags[type][tag]));
				
			} else if (type == 'rptStats') {
				if (tag == 'RPT+') {
					tagDesc.textContent = 'Subreddits by positive comment karma';
					
					let subs = this.subSort(type, tag, Object.keys(this.stats.subreddits));
					subs.splice(10);
					
					body.append(this.statsTable(subs));
				} else if (tag == 'RPT-') {
					tagDesc.textContent = 'Subreddits by negative comment karma';
					
					let subs = this.subSort(type, tag, Object.keys(this.stats.subreddits));
					subs.splice(10);
					
					body.append(this.statsTable(subs));
				}
			}
			
			hoverDiv.appendChild(rpt);
			hoverDiv.appendChild(header);
			hoverDiv.appendChild(tagDesc);
			hoverDiv.appendChild(body);
		
			document.body.appendChild(hoverDiv);
			this.positionRptTagInfo(hoverDiv, e.pageX, e.pageY);
		});
		
		return span;
	}
	
	this.positionRptTagInfo = function(div, pageX, pageY) {
		div.style.left = (pageX - 50) + 'px';
		div.style.top  = (pageY - 20) + 'px';
		
		let pos = $(div)[0].getBoundingClientRect();
		
		if (0 > pos.left) {
			div.css('left', '0px');
		}
		if (0 > pos.top) {
			div.style.top = document.documentElement.scrollTop + 'px';
		}
		if (pos.right > window.innerWidth) {
			div.style.left = (document.documentElement.scrollLeft + window.innerWidth - pos.width - 20) + 'px';
		}
		if (pos.bottom > window.innerHeight) {
			div.style.top = (document.documentElement.scrollTop + window.innerHeight - pos.height) + 'px';
		}
	}
	
	this.statsTable = function(subs) {
		let table = document.createElement('table');
		table.style.width = '100%';
		
		let tr = document.createElement('tr');
		let td = document.createElement('td');
		td.style.paddingLeft = '5px';
		td.style.paddingRight = '5px';
		
		let thSubreddit = td.cloneNode();
		thSubreddit.className = 'border';
		thSubreddit.style.borderWidth = '0px 1px 1px 0px';
		thSubreddit.textContent = 'Subreddit';
		
		let thTotal = td.cloneNode();
		thTotal.className = 'border';
		thTotal.style.borderWidth = '0px 1px 1px 0px';
		thTotal.textContent = 'Total Karma';
		
		let thAverage = td.cloneNode();
		thAverage.className = 'border';
		thAverage.style.borderWidth = '0px 1px 1px 0px';
		thAverage.textContent = 'Average Karma';
		
		let thComments = td.cloneNode();
		thComments.className = 'border';
		thComments.style.borderWidth = '0px 0px 1px 0px';
		thComments.textContent = 'Comments';
		
		let th = tr.cloneNode();
		th.appendChild(thSubreddit);
		th.appendChild(thTotal);
		th.appendChild(thAverage);
		th.appendChild(thComments);
		table.appendChild(th);
		
		
		subs.forEach((sub) => {
			let trStats = tr.cloneNode();
			
			let tdSubreddit = td.cloneNode();
			tdSubreddit.textContent = sub;
			
			let tdTotal = td.cloneNode();
			tdTotal.textContent = numPretty(this.stats.subreddits[sub].comment.total);
			
			let tdAverage = td.cloneNode();
			tdAverage.textContent = numPretty(this.stats.subreddits[sub].comment.average);
			
			let tdComments = td.cloneNode();
			tdComments.textContent = numPretty(this.stats.subreddits[sub].comment.length);
			
			trStats.appendChild(tdSubreddit);
			trStats.appendChild(tdTotal);
			trStats.appendChild(tdAverage);
			trStats.appendChild(tdComments);
			table.appendChild(trStats);
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
				.fail(() => {
					console.log('getJSON Error:', this);
					this.about.updated = datenow(); 
				});
		}
	};
	
	this.saveAbout = function (json) {
		this.about.link_karma 		= json.data.link_karma;
		this.about.comment_karma 	= json.data.comment_karma;
		this.about.created 			= json.data.created;
		this.about.updated 			= datenow();
	};
	
	
	
	
	this.getDb = function() {
		// console.log('\tgetDb():', this.name);
		
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
		};
	}
	

	this.saveDb = function() {
		// console.log('\tsaveDb():', this.name);
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





































