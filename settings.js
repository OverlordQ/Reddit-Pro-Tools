





// This file controls loading and saving the settings.
let defaults = {
	accountage: {
		'tag': {
			enabled: 	false,
			gtlt: 		'greater',
			age:		5,
			tcolor:		'ffffff',
			color: 		'd85417',
		},
		Frank: {
			enabled: 	true,
			gtlt: 		'less',
			age:		5,
			tcolor:		'ffffff',
			color: 		'd85417',
		}
	},
	subkarma: {
		'Low Quality Local': {
			enabled: 	true,
			avgtotal:	'average',
			gtlt: 		'less',
			karma: 		5,
			tcolor:		'ffffff',
			color: 		'd85417',
		},
		'Sub Troll': {
			enabled: 	true,
			avgtotal:	'total',
			gtlt: 		'less',
			karma: 		-1000,
			tcolor:		'ffffff',
			color: 		'd85417',
		}
	},
	karma: {
		'Low Quality': {
			enabled: 	true,
			avgtotal:	'average',
			gtlt: 		'less',
			karma: 		5,
			tcolor:		'ffffff',
			color: 		'd85417',
		},
		Troll: {
			enabled: 	true,
			avgtotal:	'total',
			gtlt: 		'less',
			karma: 		-100,
			tcolor:		'ffffff',
			color: 		'd85417',
		},
		'Karma Whore': {
			enabled: 	true,
			avgtotal:	'total',
			gtlt: 		'greater',
			karma: 		1000000,
			tcolor:		'ffffff',
			color: 		'67a559',
		}
	},
	subreddits: {
		'Politics OG': {
			enabled: 	true,
			avgtotal:	'total',
			gtlt: 		'greater',
			karma:		10000,
			tcolor:		'ffffff',
			color: 		'd85417',
			list: 		[
				'politics'
			]
		},
		Deplorable: {
			enabled: 	true,
			avgtotal:	'total',
			gtlt: 		'greater',
			karma:		400,
			tcolor:		'ffffff',
			color: 		'd85417',
			list: 		[
				'The_Donald',
				'sjwhate',
				'milliondollarextreme',
				'greatawakening',
				'Republican',
				'Conservative',
				'conspiracy_commons',
				'uncensorship',
				'Braincels',
				'GenderCritical',
				'KotakuInAction',
				'CringeAnarchy',
				'metacanada',
				'conspiracyundone',
				'TheNewRight',
				'billionshekelsupreme',
				'hottiesfortrump',
				'The_Congress',
				'Tendies',
				'AFTERTHESTQRM',
				'RoadMAPtoFREEDOM'
			]
		}
	},
	domains: {
		Progressive: {
			enabled: 	true,
			tcolor:	'ffffff',
			color: 	'c534db',
			list:	[
				'cnn.com'
			]
		},
		Propaganda: {
			enabled: 	true,
			tcolor:	'ffffff',
			color: 	'c534db',
			list:	[
				'breitbart.com',
				'dailycaller.com',
				'foxnews.com',
				'gop.com',
				'insider.foxnews.com',
				'redstate.com',
				'theblaze.com',
				'thefederalist.com',
				'whitehouse.gov',
				'zerohedge.com',
				'stormfront.org',
				'rt.com',
				'activistpost.com',
				'defense.gov',
				'state.gov',
				'townhall.com',
				'washingtonexaminer.com',
				'nationalreview.com',
				'justice.gov'
			]
		},
	}
};

function getSettings() {
	
	chrome.storage.sync.get(['settings'], function (stored) {
		if (stored.minAge || stored.minKarma || stored.maxKarma || stored.propDomains || stored.deplorables) {
			// convert old settings to new
		}
		
		if (!stored.settings) {
			settings = defaults;
			saveSettings();
		}
		
		settings = stored.settings;
		startSettings = $.extend(true, {}, settings);
		
		console.log('getSettings()');
		console.log(settings);
		console.log('');
	});
}

function saveSettings() {
	// console.log('');
	// console.log('saving settings...');
	// console.log('');
	
	chrome.storage.sync.set({'settings': settings});
}














