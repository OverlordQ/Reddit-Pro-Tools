





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
	settings = defaults;
	return;
	
	// chrome.storage.sync.get(['minAge', 'minKarma', 'maxKarma', 'propDomains', 'deplorables'], function (stored) {
		// settings = stored;
		
		// If any saved settings were null, use the default, save, and reload the page.
		// if (!stored.minAge || !stored.minKarma || !stored.maxKarma || !stored.propDomains || !stored.deplorables) {
			// settings = defaults;
			// saveSettings();
			// setTimeout(function () { location.reload(); }, 200);
		// }
	// });
}

function saveSettings() {
	console.log('saveSettings()');
	// chrome.storage.sync.set({
		// 'minAge': 		settings.minAge, 
		// 'minKarma': 	settings.minKarma,
		// 'maxKarma': 	settings.maxKarma,
		// 'propDomains': 	settings.propDomains,
		// 'deplorables': 	settings.deplorables
	// });
}














