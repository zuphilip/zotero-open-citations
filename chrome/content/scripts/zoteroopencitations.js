Zotero.OpenCitations = {};

Zotero.OpenCitations.init =  function() {
	alert("TODO code for init...")
};

Zotero.OpenCitations.checkOC =  function() {
	var items = ZoteroPane.getSelectedItems();
	for (let item of items) {
		if (!item.isRegularItem() || item.isCollection()) continue;
		let doi = item.getField('DOI');
		let extra = item.getField('extra');
		let itemID = item.id;
		// extract DOIs from extra field for item types which
		// have not yet a DOI field in Zotero
		if (!doi && extra) {
			let extraLines = extra.split(/[\r\n]+/);
			for (let line of extraLines) {
				if (line.startsWith('DOI:')) {
					doi = line.substring(4).trim();
				}
			}
		}
		if (!doi) continue;
		
		let req = new XMLHttpRequest();
		let url = 'http://opencitations.net/index/coci/api/v1/citations/' + doi;
		req.open('GET', url, true);
		
		req.onreadystatechange = function() {
			if (req.readyState == 4 && req.status == 200) {
				let response = JSON.parse(req.responseText);
				
				let newNote = new Zotero.Item('note');
				// check whether open citations note already exists
				let notes = item.getNotes();
				for (let noteID of notes) {
					let note = Zotero.Items.get(noteID);
					if (note.getNote().includes("Open Citations for")) {
						// overwrite this note
						newNote = note;
					}
				}
				let message = "<h2>Open Citations for " + doi + "</h2><p>"
					+ "Found <b>" + response.length + "</b> citations: </p><p>"
					+ JSON.stringify(response, null, '\t')
					+ "</p><p>Source: <a href='" + url + "'>" + url + "</a></p>"
				newNote.setNote(message);
				newNote.parentID = itemID;
				noteID = newNote.saveTx();
				
			} else {
				Zotero.debug(req);
				// alert(req.readyState + " " + req.statusText);
			}
		}
		
		req.send(null);
	}
};

Zotero.OpenCitations.checkWikicite =  function() {
	alert("TODO code for checking Wikicite...");
};

Zotero.OpenCitations.checkEPMC =  function() {
	alert("TODO code for checking EPMC...");
};