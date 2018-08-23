





/*
Gendercritical
KotakuInAction
CringeAnarchy
MetaCanada (not sure if it's fully deplorable)
conspiracyundone
TheNewRight
And I'm sure others I can't think of off the top of my head.

Propaganda domains?

Zerohedge.com
stormfront.org
rt.com
shareblue.com (? keeping it even)
activistpost.com
*/



// This file controls loading and saving the settings.
let defaults = {
	minAge: 5,
	minKarma: 100,
	maxKarma: 400,
	propDomains: [
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
	],
	deplorables: [
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
};

function getSettings() {
	chrome.storage.sync.get(['minAge', 'minKarma', 'maxKarma', 'propDomains', 'deplorables'], function (stored) {
		settings = stored;
		
		// If any saved settings were null, use the default, save, and reload the page.
		if (!stored.minAge || !stored.minKarma || !stored.maxKarma || !stored.propDomains || !stored.deplorables) {
			settings = defaults;
			saveSettings();
			setTimeout(function () { location.reload(); }, 200);
		}
	});
}

function saveSettings() {
	chrome.storage.sync.set({
		'minAge': 		settings.minAge, 
		'minKarma': 	settings.minKarma,
		'maxKarma': 	settings.maxKarma,
		'propDomains': 	settings.propDomains,
		'deplorables': 	settings.deplorables
	});
}














