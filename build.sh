#!/bin/sh
echo Enter version number:
read version
rm zotero-open-citations-${version}.xpi
zip -r zotero-open-citations-${version}.xpi chrome/* chrome.manifest install.rdf
