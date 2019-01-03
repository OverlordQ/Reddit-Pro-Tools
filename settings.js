


var menu = {
	'supportrpt': {
		label:	'Support RPT',
		desc:	'Support Reddit Pro Tools'
	},
	'domains': {
		label:	'Domains',
		desc: 	'Tags based on link domains'
	},
	'subreddits': {
		label:	'Subreddits',
		desc: 	'Tags based on comment karma in specific subreddits'
	},
	'karma': {
		label:	'Karma',
		desc:	'Tags based on comment karma for the entire account'
	},
	'subkarma': {
		label:	'Sub Karma',
		desc:	'Tags based on comment karma in the current subreddit'
	},
	'accountage': {
		label:	'Account Age',
		desc:	'Tags based on account age'
	}
};


let defaultSettings = {
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
				"occupydemocrats.com",
				"palmerreport.com",
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
				"foxnews.com",
				"gop.com",
				"insider.foxnews.com",
				"nationalreview.com",
				"redstate.com",
				"stormfront.org",
				"theblaze.com",
				"thefederalist.com",
				"townhall.com",
				"washingtonexaminer.com",
				"zerohedge.com"
			],
			"tcolor": "ffffff"
		},
		"Bias: Neutral": {
			"color": "009926",
			"enabled": true,
			"list": [],
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
			"karma": "1000000",
			"tcolor": "ffffff"
		},
		"Low Quality": {
			"avgtotal": "average",
			"color": "d85417",
			"enabled": true,
			"gtlt": "less",
			"karma": "5",
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
			"karma": "-100",
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
				"conspiracy_commons",
				"conspiracyundone",
				"CringeAnarchy",
				"GenderCritical",
				"hottiesfortrump",
				"KotakuInAction",
				"metacanada",
				"Qult_Headquarters",
				"Republican",
				"Tendies",
				"The_Congress",
				"The_Donald",
				"TheNewRight",
				"uncensorship"
			],
			"tcolor": "ffffff"
		},
		"Pol Troll": {
			"avgtotal": "total",
			"color": "000000",
			"enabled": true,
			"gtlt": "less",
			"karma": "-100",
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
		},
		"Resister": {
			"avgtotal": "total",
			"color": "668cff",
			"enabled": true,
			"gtlt": "greater",
			"karma": 400,
			"list": [
				"PoliticalHumor",
				"The_Mueller",
				"TopMindsOfReddit",
				"VoteBlue"
			],
			"tcolor": "ffffff"
		}
	}
}

function getSettings() {
	
	chrome.storage.sync.get(['settings'], function (stored) {
		if (stored.minAge || stored.minKarma || stored.maxKarma || stored.propDomains || stored.deplorables) {
			// convert old settings to new
		}
		
		if (!stored.settings) {
			settings = defaultSettings;
			saveSettings();
		}
		
		settings = stored.settings;
		// console.log('getSettings:');
		// console.log(settings);
		startSettings = $.extend(true, {}, settings);
	});
}

function saveSettings() {
	// console.log('saveSettings()');
	chrome.storage.sync.set({'settings': settings});
}


// check if settings have changed.
function settingsEqual(other) {
	if (settingsCompare(settings, other) && settingsCompare(other, settings)) {
		return true;
	}
	return false;
}

function settingsCompare(settings, other) {
	for (var type in settings) {
		for (var tag in settings[type]) {
			if (!(tag in other[type])) {
				return false;
			}
			
			for (var key in settings[type][tag]) {
				if (typeof(settings[type][tag][key]) == 'object') {
					settings[type][tag][key].sort();
					other[type][tag][key].sort();
					
					for (var i in settings[type][tag][key]) {
						if (settings[type][tag][key][i] != other[type][tag][key][i]) {
							return false;
						}
					}
				} else {
					if (settings[type][tag][key] != other[type][tag][key]) {
						return false;
					}
				}
			}
		}
	}
	
	return true;
}












