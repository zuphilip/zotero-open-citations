#!/bin/sh

version="$1"
if [ -z "$version" ]; then
	read -p "Enter new version number: " version
fi


rm -f zotero-open-citations-${version}.xpi
zip -r zotero-open-citations-${version}.xpi chrome/* chrome.manifest install.rdf
