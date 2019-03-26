






//add tags to domains
function addDomainTags(){
	if (domainsWorking) {
		setTimeout(function() { addDomainTags(); }, 100);
		return;
	}
	domainsWorking = true;
	
	let domainElems = getDomainElements();
	
	for (let tag in domainElems) {
		for (let domain in domainElems[tag]) {
			domainElems[tag][domain].forEach(function (domSpan) {
				setTimeout(function() { addDomainTag(domSpan, tag); }, Math.random() * 1000);
			});
		}
	}
	
	setTimeout(function() { domainsWorking = false; }, 1000);
}

// get list of domains which need tags
function getDomainElements() {
	let domains = {};
	
	let domainElems = document.evaluate(
		'//span[(contains(@class, "domain") or contains(@class, "b5szba-0"))]', 
		document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	
	let i = 0;
	while (domainElems.snapshotItem(i)) {
		let domSpan = domainElems.snapshotItem(i);
		let domain = domSpan.textContent.replace(/[\(\)]/g, '');
		
		for (let tag in settings.domains) {
			if (settings.domains[tag].list.includes(domain)) {
				// if tag not enabled, skip it
				if (!settings.domains[tag].enabled) { continue; }
				
				// if already tagged, skip this element
				if (domSpan.parentNode.children[0].nodeName == 'SPAN') { continue; }
				if (!(tag in domains)) {
					domains[tag] = {}; 
				}
				if (!(domain in domains[tag])) {
					domains[tag][domain] = []; 
				}
				domains[tag][domain].push(domSpan);
			}
		}
		
		i++;
	}
	
	return domains;
}

// create and insert tag
function addDomainTag(elem, tag) {
	// console.log(tag, elem);
	let span = document.createElement('span');
	span.textContent = tag;
	span.className = 'rptTag rptDomain';
	span.style.backgroundColor = '#' + settings.domains[tag].color;
	span.style.color = '#' + settings.domains[tag].tcolor;
	
	elem.parentNode.prepend(span);
}









