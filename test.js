


var urls = [
	'https://www.reddit.com/r/politics/comments/86sw65/stormy_daniels_lawyer_says_he_has_dvd_containing/',
	'https://www.reddit.com/r/worldnews/comments/86r24m/french_police_hero_dies_of_wounds/',
	'https://www.reddit.com/r/politics/comments/86sfy8/new_data_show_the_nra_increased_online_ad/',
	'https://www.reddit.com/r/politics/comments/86nlte/millennials_really_hate_the_republicans/',
	'https://www.reddit.com/r/news/comments/86sorm/father_gets_60_years_for_trying_to_sell_4yearold/'
];




function runTest () {
	console.log('runTest');
	test = [];
	
	urls.forEach(function (url) {
		test.push(new TestPage(url));
		
		page = test[test.length-1];
		
		//console.log(page.url);
	});
	
	//.about.updated
	//.stats.comment.updated
	
	
}

function testMain() {
	if (!db) {
		console.log('db loading... ');
		setTimeout(function () { testMain(); }, 100);
		return;
	}
	
	let authors = getAuthors();
	//authors = ['feeling_impossible'];
	authors.forEach(function(user) {
		
		if (!working[user]) {
			if (!users[user]) { users[user] = new User(user); }
			working[user] = true;
			
			users[user].about.updated = 0;
			users[user].dbGet();
			users[user].aboutGet();
			users[user].commentsGet();
		};
	});
}








function addTestLink() {
	
	
	let testLink = $('<a></a>')
		.attr('href', '#')
		.css({color: '#ffffff'})
		.html('run tests!');
		
	let testDiv = $('<div></div>')
		.addClass('rptTag propagandaColor')
		.attr('id', 'testDiv')
		.css({
			position: 	'fixed',
			bottom: 	'20px',
			left:		'0px'
		})
		.html(testLink);
		
	$(document.body).append(testDiv);

	// add click event
	$('#testDiv').click(function() {
		console.log('runTest');
		runTest();
	});
}


function TestPage (reddit) {
	this.url = reddit;
	this.title = null;
	this.authors = null;
	this.comments = null;
	this.size = null;
}