

"use strict";

//settings
getSettings();

var domainText 		= 'add domain here';
var deplorableText 	= 'add subreddit here';



$(document).ready(function() {
	
	// Fill out settings for based on saved settings.
	$('#minAge').val(settings.minAge);
	$('#minKarma').val(settings.minKarma);
	$('#maxKarma').val(settings.maxKarma);
	listDomains();
	listDeplorables();
	
	
	
	
	// Events
	// Add Domain input field ui effects
	$('#addDomain').focus(function() {
		if ($('#addDomain').val() == domainText) {
			$('#addDomain').val('');
		}
		$('#addDomain').attr('class', 'focus');
	});
	$('#addDomain').focusout(function() {
		if ($('#addDomain').val() == '') {
			$('#addDomain').val(domainText);
		}
		$('#addDomain').attr('class', 'unfocus');
	});
	
	// Add Domain input field events
	$('#addDomain').keyup(function(e) { 
		var code = e.which;
		if (code==13) { e.preventDefault(); }
		if (code==32 || code==13 || code==188 || code==186) {
			settings.propDomains.push($('#addDomain').val().toLowerCase());
			saveSettings();
			listDomains();
			$('#addDomain').val('');
		}
	});
	
	
	
	
	// Add Deplorable input field ui effects
	$('#addDeplorable').focus(function() {
		console.log('focus');
		if ($('#addDeplorable').val() == deplorableText) {
			$('#addDeplorable').val('');
			console.log('default text');
		}
		$('#addDeplorable').attr('class', 'focus');
	});
	$('#addDeplorable').focusout(function() {
		if ($('#addDeplorable').val() == '') {
			$('#addDeplorable').val(deplorableText);
		}
		$('#addDeplorable').attr('class', 'unfocus');
	});
	
	// Add Deplorable input field events
	$('#addDeplorable').keyup(function(e) { 
		var code = e.which;
		if (code==13) { e.preventDefault(); }
		if (code==32 || code==13 || code==188 || code==186) {
			settings.deplorables.push($('#addDeplorable').val());
			saveSettings();
			listDeplorables();
			$('#addDeplorable').val('');
		}
	});
	
	
	
	
	// minKarma input field
	$('#minKarma').keyup(function() {
		settings.minKarma = $('#minKarma').val();
		saveSettings();
	});
	
	// minAge input field
	$('#minAge').keyup(function() {
		settings.minAge = $('#minAge').val();
		saveSettings();
	});
	
	// minAge input field
	$('#maxKarma').keyup(function() {
		settings.maxKarma = $('#maxKarma').val();
		saveSettings();
	});
	
	// setDefaults link
	$('.setDefaults').click(function() {
		settings = defaults;
		saveSettings();
		$('#minAge').val(settings.minAge);
		$('#minKarma').val(settings.minKarma);
		$('#maxKarma').val(settings.maxKarma);
		listDomains();
		listDeplorables();
	});
});


function listDomains() {
	$('.domains').empty();
	let domains = settings.propDomains.sort();
	
	for (var i = 0; i < domains.length; i++) {
		let div = '<div class="domain"><img class="deleteIcon deleteDomain" id="' + domains[i] + '" src="delete.icon.png">' + domains[i] + '</div>';
		$('.domains').append(div);
	}
	
	$('.deleteDomain').click(function() {
		let domain = $(this).attr('id');
		let index = settings.propDomains.indexOf(domain);
		
		settings.propDomains.splice(index, 1);
		saveSettings();
		listDomains();
	});
}


function listDeplorables() {
	$('.deplorables').empty();
	let deplorables = settings.deplorables.sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
	
	for (var i = 0; i < deplorables.length; i++) {
	
		let div = '<div class="deplorable"><img class="deleteIcon deleteDeplorable" id="' + deplorables[i] + '" src="delete.icon.png">' + deplorables[i] + '</div>';
		$('.deplorables').append(div);
	}
	
	$('.deleteDeplorable').click(function() {
		let deplorable = $(this).attr('id');
		let index = settings.deplorables.indexOf(deplorable);
		
		console.log(deplorable + ': ' + index);
		
		settings.deplorables.splice(index, 1);
		saveSettings();
		listDeplorables();
	});
}








