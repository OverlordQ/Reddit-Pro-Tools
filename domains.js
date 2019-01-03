







// Domain = function (name) {
	// this.name = name;
	
	// this.addTag = function () {
		// rptClass = 'rpt-' + this.name.split('.').join('');
		// $('.rptDomain.' + rptClass).remove();
		
		// let domainTag = $('.domain:contains((' + this.name + '))');
		// let domainTag = $('.domain:contains(' + this.name + '), .b5szba-0:contains(' + this.name + ')');
		// domainTag.after('<span>propaganda</span>');
		// domainTag.next().addClass('rptTag rptDomain ' + rptClass + ' propagandaColor');
	// }
// }

//add tags to domains
function addDomainTags(){
	// get a list of matching domains on page
	domains = getDomains();
	
	for (tag in domains) {
		for (i in domains[tag]) {
			addDomainTag(tag, domains[tag][i]);
		}
	}
}

function addDomainTag(tag, domain) {
	// console.log(tag, domain);
	
	rptClass = 'rpt-' + tag.split(/[^\w]/).join('') + '-' + domain.split(/[^\w]/).join('');
	
	$('.rptDomain.' + rptClass).remove();
	
	let domainTag = $('.domain:contains(' + domain + '), .b5szba-0:contains(' + domain + ')');
	tagSpan = $('<span/>').addClass('rptTag rptDomain ' + rptClass).text(tag);
	tagSpan.css({
		'background-color': '#' + settings.domains[tag].color, 
		'color': '#' + settings.domains[tag].tcolor
	});
	domainTag.after(tagSpan);
	
	// console.log(tag + ':', settings.domains[tag].tcolor);
}


function getDomains() {
	let domains = [];
	for (tag in settings.domains) {
		domains[tag] = [];
	}
	
	// foreach domain link
	let links = $('.domain > a, .b5szba-0');
	$.each(links, function (i, linkurl) {
		let domain = linkurl.text;
		domain = domain.replace(/^https?:\/\//, '');
		domain = domain.replace(/^www\./, '');
		domain = domain.replace(/\/.*/, '');
		
		for (tag in settings.domains) {
			if (settings.domains[tag].list.includes(domain) && !domains[tag].includes(domain)) {
				domains[tag].push(domain);
			}
		}
	});
	
	return domains;
}










