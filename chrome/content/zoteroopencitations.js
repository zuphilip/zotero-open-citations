Zotero.OpenCitations = {};

Zotero.OpenCitations.init = function() {
	alert("TODO code for init...");
};

Zotero.OpenCitations.checkOC = function() {
	var maxNumberOfItemsToRetrieve = Zotero.Prefs.get("opencitations.maxNumberOfItemsToRetrieve") || 3;
	if (!ZoteroPane) {
		var ZoteroPane = Components.classes["@mozilla.org/appshell/window-mediator;1"] .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser").ZoteroPane;
	}
	var items = ZoteroPane.getSelectedItems();
	var currentCollection = ZoteroPane.getSelectedCollection();
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
		
		req.onreadystatechange = async function() { // async (!) because we want to use await in this function
			if (req.readyState == 4 && req.status == 200) {
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
				
				let response = JSON.parse(req.responseText);
				response.sort((a, b) => new Date(b.creation) - new Date(a.creation));
				
				let message = "<h2>Result from <a href='" + url + "'>OpenCitations</a> for " + doi + "</h2>";
				message += "<p>Found <b>" + response.length + "</b> citations: </p>";
				if (response.length > 0) {
					let year = response[0].creation.substring(0,4);
					message += "<h3>" + year + "<h3><ul>";
					for (let row of response) {
						if (row.creation.substring(0,4) !== year) {
							// create a new subsection for each new year
							year = row.creation.substring(0,4);
							message += "</ul><h3>" + year + "<h3><ul>";
						}
						message += "<li><a href='https://doi.org/" + row.citing + "'>https://doi.org/" + row.citing + "</a>";
						message += " (" + row.creation + ")</li>";
					}
					message += "</ul>";
					
					let citationCollection = new Zotero.Collection();
					citationCollection.name = "Newest citations of " + doi;
					citationCollection.parentID = currentCollection.id;
					// resolve the returned promise here with await
					var citationCollectionId = await citationCollection.saveTx();
					
					for (let row of response.slice(0, maxNumberOfItemsToRetrieve)) {
						var translate = new Zotero.Translate.Search();
						translate.setIdentifier({
							"DOI": row.citing
						});
						translate.setTranslator("11645bd1-0420-45c1-badb-53fb41eeb753"); // CrossRef.js
						let newItems = translate.translate({
							libraryID: item.libraryID,
							collections: [citationCollectionId]
						});
					}
				}
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

Zotero.OpenCitations.checkWikicite = function() {
	alert("TODO code for checking Wikicite...");
};

Zotero.OpenCitations.checkEPMC = function() {
	alert("TODO code for checking EPMC...");
};
