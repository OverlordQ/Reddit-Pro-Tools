



// classes for usernames where tags are placed
var userElemClasses = {
	'old': {
		'everything':    		'author',
		'commentPostAuthor': 	'CommentTitle__postAuthor'
	},
	'new': {
		'linksComments':		'_2tbHP6ZydRpjI44J3syuqC',
		'moderators':			's1r23isz-1',
		'userOverview':			'ayrk3a-1',
		'userOverviewComments':	'Post__username',
		'userLinks':			'Post__authorLink',
		'userComments':			'Comment__author'
	}
}
// classes used by new reddit:
// links						_2tbHP6ZydRpjI44J3syuqC ayrk3a-1 bVZprW
// comments						_2tbHP6ZydRpjI44J3syuqC ayrk3a-0 bSnBFD
// moderators					s1r23isz-1 hygwvo
// user overview links (self)	Post__authorLink
// user overview links			_2tbHP6ZydRpjI44J3syuqC ayrk3a-1 bVZprW
// user overview comments		Post__username
// user overview comments2		ayrk3a-1 eDHrna
// user overview comments3		ayrk3a-1 kLcbeb
// user links					Post__authorLink 
// user comments				Comment__author

// var userElemClasses = {
	// 'old': {
		// 'everything':    		'author',
		// 'commentPostAuthor': 	'CommentTitle__postAuthor'
	// },
	// 'new': {
		// 'linksComments':	'k9omvt-0',
		// 'moderators':		's1mvqe4r-1',
		// 'commentsPage':		's1dzlsgl-0',
		// 'postsPage':		'k9omvt-1'
	// }
// }

// build eval for finding user elements
var userElemEval = '(';
var first = 1;
for (var oldNew in userElemClasses) {
	for (var key in userElemClasses[oldNew]) {
		if (!first) {
			userElemEval += ' or ';
		}
		userElemEval += 'contains(@class, "' + userElemClasses[oldNew][key] + '")';
		first = 0;
	}
}
userElemEval += ')';

var supporters = {
	'currentPatrons': {
		'label': 'Patreon Supporters',
		'list': [
			'Julia Amine',
			'Ken Minardo',
			'Phil Stevenson',
			'Matthew George',
			'Melissa Walker',
			'Avis-Mergulus',
			'glumchurch'
		]
	},
	'formerPatrons': {
		'label': 'Former Patreon Supporters',
		'list': [
			'Joseph Wilson',
			'Alexprice',
			'Anna Larch',
			'Serpentine Logic',
			'JF'
		]
	},
	'betaTesters': {
		'label': 'Beta Tester',
		'list': [
			'thestickystickman',
		]
	},
	'bugFinders': {
		'label': 'Bug Finder',
		'list': [
			'anowlcalledjosh'
		]
	}
};

var menu = {
	supportrpt: {
		label:	'Support RPT',
		desc:	'Support Reddit Pro Tools'
	},
	tags: {
		label:	'Tags',
		list:	{
			domains: {
				label:	'Domains',
				desc: 	'Tags based on link domains'
			},
			subreddits: {
				label:	'Subreddits',
				desc: 	'Tags based on comment karma in specific subreddits'
			},
			karma: {
				label:	'Karma',
				desc:	'Tags based on comment karma for the entire account'
			},
			subkarma: {
				label:	'Sub Karma',
				desc:	'Tags based on comment karma in the current subreddit'
			},
			accountage: {
				label:	'Account Age',
				desc:	'Tags based on account age'
			}
		}
	},
	settings: {
		label: 'Settings',
		desc: 'General Settings'
	}
};

let defaultSettings = {
	"settings": {
		"patreonLink": true
	},
	"tags": {
		"accountage": {
			"Frank": {
				"age": "5",
				"color": "ffcccc",
				"enabled": true,
				"gtlt": "less",
				"tcolor": "000000"
			},
			"Old School": {
				"age": "3650",
				"color": "99b3ff",
				"enabled": true,
				"gtlt": "greater",
				"karma": 100,
				"tcolor": "ffffff"
			}
		},
		"domains": {
			"Bias: Extreme Left": {
				"color": "002699",
				"enabled": true,
				"list": [
					"bipartisanreport.com",
					"currentaffairs.org",
					"democracynow.org",
					"freespeech.org",
					"huffingtonpost.com",
					"jacobinmag.com",
					"motherjones.com",
					"newrepublic.com",
					"occupydemocrats.com",
					"palmerreport.com",
					"shareblue.com",
					"slate.com",
					"thedailybeast.com",
					"theintercept.com",
					"truthout.org",
					"tyt.com",
					"washingtonmonthly.com",
					"wonkette.com"
				],
				"tcolor": "ffffff"
			},
			"Bias: Extreme Right": {
				"color": "990000",
				"enabled": true,
				"list": [
					"activistpost.com",
					"breitbart.com",
					"dailycaller.com",
					"dailysignal.com",
					"foxnews.com",
					"freebeacon.com",
					"gop.com",
					"insider.foxnews.com",
					"nationalreview.com",
					"newsmax.com",
					"pjmedia.com",
					"reason.com",
					"redstate.com",
					"stormfront.org",
					"theamericanconservative.com",
					"theblaze.com",
					"thefederalist.com",
					"townhall.com",
					"washingtonexaminer.com",
					"washingtontimes.com",
					"weeklystandard.com",
					"zerohedge.com"
				],
				"tcolor": "ffffff"
			},
			"Bias: Left": {
				"color": "3366ff",
				"enabled": false,
				"list": [
					"axios.com",
					"buzzfeednews.com",
					"cnn.com",
					"news.vice.com",
					"newsandguts.com",
					"newyorker.com",
					"politico.com",
					"talkingpointsmemo.com",
					"theatlantic.com",
					"thenation.com",
					"theweek.com",
					"thinkprogress.org",
					"vanityfair.com",
					"vox.com",
					"washingtonpost.com"
				],
				"tcolor": "ffffff"
			},
			"Bias: Neutral": {
				"color": "009926",
				"enabled": false,
				"list": [
					"abcnews.go.com",
					"ap.org",
					"bbc.com",
					"bloomberg.com",
					"businessinsider.com",
					"c-span.org",
					"cbsnews.com",
					"csmonitor.com",
					"economist.com",
					"forbes.com",
					"fortune.com",
					"ft.com",
					"ijr.com",
					"latimes.com",
					"marketwatch.com",
					"nbcnews.com",
					"npr.org",
					"nytimes.com",
					"ozy.com",
					"pbs.org",
					"propublica.org",
					"reuters.com",
					"theguardian.com",
					"thehill.com",
					"theskimm.com",
					"time.com",
					"usatoday.com"
				],
				"tcolor": "ffffff"
			},
			"Bias: Right": {
				"color": "ff3333",
				"enabled": true,
				"list": [
					"drudgereport.com",
					"foreignpolicy.com",
					"marketwatch.com",
					"thefiscaltimes.com",
					"wsj.com"
				],
				"tcolor": "ffffff"
			},
			"Government": {
				"color": "990073",
				"enabled": true,
				"list": [
					"defense.gov",
					"gop.com",
					"justice.gov",
					"state.gov",
					"whitehouse.gov"
				],
				"tcolor": "ffffff"
			},
			"Propaganda": {
				"color": "990073",
				"enabled": true,
				"list": [
					"rt.com",
					"sputniknews.com"
				],
				"tcolor": "ffffff"
			}
		},
		"karma": {
			"Karma Whore": {
				"avgtotal": "total",
				"color": "67a559",
				"enabled": true,
				"gtlt": "greater",
				"karma": "400000",
				"tcolor": "ffffff"
			},
			"Low Quality": {
				"avgtotal": "average",
				"color": "d85417",
				"enabled": false,
				"gtlt": "less",
				"karma": "0",
				"tcolor": "ffffff"
			},
			"Troll": {
				"avgtotal": "total",
				"color": "ff0000",
				"enabled": true,
				"gtlt": "less",
				"karma": "-100",
				"tcolor": "ffffff"
			}
		},
		"rptStats": {
			"RPT+": {
				"avgtotal": "total",
				"color": "99ffb3",
				"gtlt": "greater",
				"tcolor": "000000"
			},
			"RPT-": {
				"avgtotal": "total",
				"color": "ff9999",
				"gtlt": "less",
				"tcolor": "000000"
			}
		},
		"subkarma": {
			"Low Quality Local": {
				"avgtotal": "average",
				"color": "ff9999",
				"enabled": false,
				"gtlt": "less",
				"karma": "0",
				"tcolor": "000000"
			},
			"Sub Troll": {
				"avgtotal": "total",
				"color": "990000",
				"enabled": true,
				"gtlt": "less",
				"karma": "-400",
				"tcolor": "ffffff"
			}
		},
		"subreddits": {
			"Deplorable": {
				"avgtotal": "total",
				"color": "ff6666",
				"enabled": true,
				"gtlt": "greater",
				"karma": "400",
				"list": [
					"Braincels",
					"Conservative",
					"CringeAnarchy",
					"GenderCritical",
					"Republican",
					"Tendies",
					"TheNewRight",
					"The_Congress",
					"The_Donald",
					"conspiracy_commons",
					"conspiracyundone",
					"hottiesfortrump",
					"metacanada",
					"uncensorship"
				],
				"tcolor": "ffffff"
			},
			"Oink": {
				"avgtotal": "total",
				"color": "0033cc",
				"enabled": true,
				"gtlt": "greater",
				"karma": 400,
				"list": [
					"police",
					"ProtectAndServe"
				],
				"tcolor": "ffffff"
			},
			"Pol Troll": {
				"avgtotal": "total",
				"color": "000000",
				"enabled": true,
				"gtlt": "less",
				"karma": "-400",
				"list": [
					"news",
					"politics",
					"worldnews",
					"worldpolitics"
				],
				"tcolor": "ffffff"
			},
			"Politics OG": {
				"avgtotal": "total",
				"color": "4d9900",
				"enabled": true,
				"gtlt": "greater",
				"karma": "50000",
				"list": [
					"news",
					"politics",
					"worldnews",
					"worldpolitics"
				],
				"tcolor": "ffffff"
			}
		}
	}
}

function getSettings() {
	
	chrome.storage.sync.get(['settings'], function (stored) {
		// convert pre-1.0 settings to new style
		if (stored.minAge || stored.minKarma || stored.maxKarma || stored.propDomains || stored.deplorables) {
			stored.settings = defaultSettings;
			saveSettings();
		}
		
		// convert 1.0 settings to 1.4
		if (stored.settings && !('tags' in stored.settings)) {
			let tempSettings = defaultSettings;
			tempSettings.tags = stored.settings;
			stored.settings = tempSettings;
		}
		
		if (stored.settings) {
			settings = stored.settings;
		} else {
			settings = defaultSettings;
			saveSettings();
		}
		
		startSettings = $.extend(true, {}, settings);
	});
}

function saveSettings() {
	// console.log('saveSettings()');
	chrome.storage.sync.set({'settings': settings});
}


// check if settings have changed.
function settingsEqual(other) {
	// console.log('settings:');
	// console.log(settings);
	// console.log('other:');
	// console.log(other);
	if (settingsCompare(settings, other) && settingsCompare(other, settings)) {
		return true;
	}
	return false;
}

function settingsCompare(settings, other) {
	for (var section in settings) {
		// check tags
		if (section == 'tags') {
			for (var type in settings[section]) {
				for (var tag in settings[section][type]) {
					if (!other[section][type] || !(tag in other[section][type])) {
						return false;
					}
					
					for (var key in settings[section][type][tag]) {
						if (typeof(settings[section][type][tag][key]) == 'object') {
							settings[section][type][tag][key].sort();
							other[section][type][tag][key].sort();
							
							for (var i in settings[section][type][tag][key]) {
								if (settings[section][type][tag][key][i] != other[section][type][tag][key][i]) {
									return false;
								}
							}
						} else {
							if (settings[section][type][tag][key] != other[section][type][tag][key]) {
								return false;
							}
						}
					}
				}
			}
			
		//check other settings
		} else {
			for (var key in settings[section]) {
				if (!other[section] || !(key in other[section])) {
					return false;
				}
				if (settings[section][key] != other[section][key]) {
					return false;
				}
			}
		}
	}
	
	return true;
}












