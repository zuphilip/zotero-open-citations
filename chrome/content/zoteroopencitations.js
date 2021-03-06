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
	// warn when more than 50 items are selected
	if (items.length > 50) {
		var sure = confirm("This may take quite some time, as you have selected more than 50 entries. There is no possibility to interupt the process once started. Continue?")
		if (!sure) {
			return false;
		}
	}
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
				
				let message = "<html><h2>Result from the <a href='" + url + "'>OpenCitations COCI Service</a> for " + doi + "</h2>";
				message += "<p>Found <b>" + response.length + "</b> citations: </p>";
				if (response.length > 0) {
					let year = response[0].creation.substring(0,4);
					message += "<h3>" + year + "<h3><ul>";
					for (let i=0; i<response.length; i++) {
						let row = response[i];
						if (row.creation.substring(0,4) !== year) {
							// create a new subsection for each new year
							year = row.creation.substring(0,4);
							message += "</ul><h3>" + year + "<h3><ul>";
						}
						message += "<li id='li-" + i + "'><a href='https://doi.org/" + row.citing + "'>https://doi.org/" + row.citing + "</a>";
						message += " (" + row.creation + ")</li>";
					}
					message += "</ul></html>";
					parser = new DOMParser();
					messageDocument = parser.parseFromString(message, "text/html");
					
					// use eiter existing subcollection with citations or create a new one
					var citationCollectionId;
					let subcollections = currentCollection.getChildCollections()
					for (let coll of subcollections) {
						if (coll.name.includes("Newest citations") && coll.name.includes(doi)) { // TODO or better startsWith and endsWith ??
							citationCollectionId = coll.id;
						}
					}
					if (!citationCollectionId) {
						let citationCollection = new Zotero.Collection();
						citationCollection.name = "Newest citations of '" + item.getField('title') + "', " + doi;
						citationCollection.parentID = currentCollection.id;
						// resolve the returned promise here with await
						citationCollectionId = await citationCollection.saveTx();
					}
					
					for (let i=0; i<response.length; i++) {
						let row = response[i];
						var search = new Zotero.Search();
						// search for an item with this DOI...
						search.addCondition('DOI', 'is', row.citing);
						var searchResults = await search.search(); // results only ids
						// ...preferably within the citation subcollection
						search.addCondition('collectionID', 'is', citationCollectionId);
						var searchResultsWithinSubcollection = await search.search();
						let result; // either already in library or newly created item
						if (searchResults.length > 0) {
							if (searchResultsWithinSubcollection.length > 0) {
								result = Zotero.Items.get(searchResultsWithinSubcollection[0]);
							} else {
								result = Zotero.Items.get(searchResults[0]);
							}
							if (!result.getCollections().includes(citationCollectionId)) {
								result.addToCollection(citationCollectionId);
								result.saveTx();
							}
						// Retrieve new items
						} else if (i<maxNumberOfItemsToRetrieve) {
							var translator = new Zotero.Translate.Search();
							translator.setIdentifier({
								"DOI": row.citing
							});
							result = await translator.translate({
								libraryID: item.libraryID,
								collections: [citationCollectionId]
							});
						}
						
						if (result) {
							if (Array.isArray(result)) {
								result = result[0];
							}
							// update note message
							let oldContent = messageDocument.getElementById("li-" + i).innerHTML;
							let creatorsNames = result.getCreators().map(creatorsObject => creatorsObject.lastName);
							let collectionsPaths = result.getCollections().map(
								id => Zotero.Collections.get(id).name + " [collection id: " + id + "]"
							);
							let selectLink = "zotero://select/items/" + result.libraryID + "_" + result.key;
							messageDocument.getElementById("li-" + i).innerHTML = oldContent
								+ ": <a href='" + selectLink + "'>" + result.getField('title') + "</a>"
								+ " / " + creatorsNames.join(", ")
								+ "<ul><li>" + collectionsPaths.join("</li><li>") + "</li><ul>";
							// create relation in both directions
							if (!result.relatedItems.includes(item.key)) {
								result.addRelatedItem(item);
								await result.saveTx();
								item.addRelatedItem(result);
								await item.saveTx();
							}
						}
					}
					message = messageDocument.documentElement.outerHTML;
				}
				newNote.setNote(message);
				newNote.parentID = itemID;
				noteID = await newNote.saveTx();
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
