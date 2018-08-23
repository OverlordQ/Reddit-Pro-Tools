







Domain = function (name) {
	this.name = name;
	
	this.addTag = function () {
		rptClass = 'rpt-' + this.name.split('.').join('');
		$('.rptDomain.' + rptClass).remove();
		
		// let domainTag = $('.domain:contains((' + this.name + '))');
		let domainTag = $('.domain:contains(' + this.name + '), .b5szba-0:contains(' + this.name + ')');
		domainTag.after('<span>propaganda</span>');
		domainTag.next().addClass('rptTag rptDomain ' + rptClass + ' propagandaColor');
	}
}

function getDomains() {
	let domains = [];
	
	// foreach domain link
	let links = $('.domain > a, .b5szba-0');
	$.each(links, function (i, linkurl) {
		let domain = linkurl.text;
		domain = domain.replace(/^https?:\/\//, '');
		domain = domain.replace(/^www\./, '');
		domain = domain.replace(/\/.*/, '');
		
		// if in our propaganda domains list
		if (settings.propDomains.indexOf(domain) >= 0) {
			// if not already in our list of offending domains
			if (domains.indexOf(domain) < 0) {
				domains.push(new Domain(domain));
			}
		}
	});
	
	return domains;
}