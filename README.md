# Open Citations Plugin for Zotero

Add some functionalities for open citations like from OpenCitations, WikiCite, EPMC, Crossref to Zotero. Currently, a DOI lookup in OpenCitations is implemented and the result is added as a note:

![](https://i.imgur.com/lnfUSKR.gif)

*TODO more and better functionalities*


## Installation

To install the extension:

* Download the XPI file of the [latest release](https://github.com/zuphilip/zotero-open-citations/releases).
* In Zotero, go to Tools → Add-ons and drag the .xpi onto the Add-ons window.


## Build and release

Run `build.sh` script, which creates a new `.xpi` file.
Tagging a new version and releasing has to been done manually.


## Development

Create a text file containing the full path to this directory,
name the file `zotero-open-citations@bib.uni-mannheim.de`, and place it in the `extensions`
subdirectory of your [Zotero profile directory](https://www.zotero.org/support/kb/profile_directory).
Restart Zotero to try the latest code changes.


## License

The source code is released under [GNU Affero General Public License v3](LICENSE).
