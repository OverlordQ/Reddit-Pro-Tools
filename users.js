 
 
 
 
 
 

 
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
	//this.comments_updated 	= (empty) ? 0 			: user.comments_updated;
	this.comments 			= (empty) ? null 			: user.comments;
	this.stats				= (empty) ? emptyStats		: user.stats;
	
	
	
	
	
	
	
	
	
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
		
		req.onsuccess = () => {
			saved.push(this.name);
		};
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
		
		let labels = user.labels();
		if (labels.length > 0) {
			// delete previous tags for this user
			$('.rptUser.rpt-' + user.name).remove();
			
			// add new tags
			labels.forEach((label) => {
				user.addTag(label);
			});
		}
		//console.log(user);
	}
	
	this.addTag = function (label) {
		let user = $('.author:contains(' + this.name + '), .s1b41naq-1:contains(' + this.name + '), ._2tbHP6ZydRpjI44J3syuqC:contains(' + this.name + '), .s1461iz-1:contains(' + this.name + ')');
		
		user.after('<span>' + label + '</span>');
		user.next().addClass('rptTag rptUser rpt-' + this.name + ' ' + label.split(' ').join('') + 'Color');
		if (label == 'troll' || label == 'sub troll' || label == 'deplorable') { addHoverEvent(this.name); }
	}
	
	this.labels = function() {
		let labels = [];
		
		// frank
		let age = Math.round((datenow() - this.about.created) / day);
		if (this.about.comment_karma < settings.minKarma && age < settings.minAge) {
			labels.push('frank');
		}
		
		// troll
		if (this.about.comment_karma <= -100) {
			labels.push('troll');
			
		} else {
			// sub troll
			let url = window.location.href.split('/');
			let subs = (url[3] == 'r') ? url[4].split('+') : [];
			let subTroll = false;
			subs.forEach((sub) => {
				if (sub && this.stats.subreddits[sub] && this.stats.subreddits[sub].comment.total <= -100) {
					//console.log(sub + ': ' + this.stats.subreddits[sub].comment.total);
					subTroll = true;
				}
			});
			if (subTroll) { labels.push('sub troll'); }
		}
		
		// deplorable
		let deplorable = false;
		settings.deplorables.forEach((sub) => {
			if (this.stats.subreddits[sub] && this.stats.subreddits[sub].comment.total > settings.maxKarma) {
				deplorable = true;
			}
		});
		if (deplorable) { labels.push('deplorable') }
		
		return labels.reverse();
	}
	
	
	
	
	
	
	
	
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
			//console.log('get all comments: ' + user.name);
			let url = 'https://www.reddit.com/user/' + user.name + '/comments.json?limit=100';
			//console.log(url);
			$.getJSON(url, function(json) { user.commentsSave(json); })
				.fail(function () { user.stats.comment.updated = datenow(); });
			
		// saved comments but needs update
		} else if (!user.stats.comment.updated || (datenow() - user.stats.comment.updated) > cacheTime) {
			if (user.stats.comment.updated && (datenow() - user.stats.comment.updated) > cacheTime) {
				let since = round((datenow() - user.stats.comment.updated) / cacheTime);
				// console.log('update comments: ' + user.name + ' - days since last seen: - ' + since);
			}
			
			//console.log('update comments', user.name);
			user.purgeRecent();
			let before = (user.comments[0]) ? user.comments[0].name : '';
			let url = 'https://www.reddit.com/user/' + user.name + '/comments.json?limit=100&before=' + before;
			//console.log(url);
			$.getJSON(url, function(json) { user.commentsUpdate(json); })
				.fail(function () { user.stats.comment.updated = datenow(); });
			
		// comments are up to date, no need to hit the api
		} else {
			//console.log('use saved comments:', user.name);
			saved.push(user.name);
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






























