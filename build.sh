#!/bin/sh
echo Enter version number:
read version
rm -f zotero-open-citations-${version}.xpi
zip -r zotero-open-citations-${version}.xpi chrome/* chrome.manifest install.rdf
