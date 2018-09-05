Zotero.OpenCitations = {};

Zotero.OpenCitations.init =  function() {
	alert("TODO code for init...");
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
					if (note.getNote().includes("OpenCitations")) {
						// overwrite this note
						newNote = note;
					}
				}
				let message = "<h2>Result from <a href='" + url + "'>OpenCitations</a> for " + doi + "</h2>";
				message += "<p>Found <b>" + response.length + "</b> citations: </p>";
				response.sort((a, b) => new Date(b.creation) - new Date(a.creation));
				if (response.length > 0) {
					let year = response[0].creation.substring(0,4);
					message += "<h3>" + year + "<h3><ul>";
					for (let row of response) {
						if (row.creation.substring(0,4) !== year) {
							year = row.creation.substring(0,4);
							message += "</ul><h3>" + year + "<h3><ul>";
						}
						message += "<li><a href='https://doi.org/" + row.citing + "'>https://doi.org/" + row.citing + "</a>";
						message += " (" + row.creation + ")</li>";
					}
					message += "</ul>";
				}
				//message += JSON.stringify(response, null, '\t');
				newNote.setNote(message);
				newNote.parentID = itemID;
				noteID = newNote.saveTx();
				
			} else {
				Zotero.debug(req);
				// alert(req.readyState + " " + req.statusText);
			}
		};
		
		req.send(null);
	}
};

Zotero.OpenCitations.checkWikicite =  function() {
	alert("TODO code for checking Wikicite...");
};

Zotero.OpenCitations.checkEPMC =  function() {
	alert("TODO code for checking EPMC...");
};