# Open Citations Plugin for Zotero

This Zotero plugin adds information about open citations data for one or several items in Zotero.
Currently, a DOI lookup in the [OpenCitations COCI service](https://w3id.org/oc/index/coci) is implemented, the result is added as a note, and the latest references are saved in a special collection in Zotero:

![Screencast](https://user-images.githubusercontent.com/5199995/45599334-11fbca80-b9ea-11e8-9e9d-9e63f86f4b05.gif)

*TODO more and better functionalities*


## Installation

To install the extension:

* Download the XPI file of the [latest release](https://github.com/zuphilip/zotero-open-citations/releases).
* In Zotero, go to Tools → Add-ons and drag the .xpi onto the Add-ons window.


## Build and release

Run `build.sh` script, which creates a new `.xpi` file.

For a new release, run the script `release.sh`, push the code changes, publish a [new release on GitHub](https://github.com/zuphilip/zotero-open-citations/releases/new) and attach the `.xpi` file there.


## Development

Create a text file containing the full path to this directory,
name the file `zotero-open-citations@bib.uni-mannheim.de`, and place it in the `extensions`
subdirectory of your [Zotero profile directory](https://www.zotero.org/support/kb/profile_directory).
Restart Zotero to try the latest code changes.


## License

The source code is released under [GNU Affero General Public License v3](LICENSE).
