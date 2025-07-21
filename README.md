# VSCode - WordCount README
 
This is a simple extension that illustrates a number of concepts when it comes to writing extensions for VS Code.  

* Activation on a file type open
* Contributing to the status bar
* Subscribing to update events
* Adding a test to your extension
* Marking up the `package.json` so the gallery looks good

## Developing Environment

```bash
nvm install 20.12.2
nvm use 20.12.2
npm install
npm run compile
```

## Local Install

```bash
npm install -g vsce
vsce package
```

Install the extension by clicking "Install from VSIX...".

## Functionality

It's pretty simple open up a `Markdown` file and the status bar will have an auto-updating wordcount in it...

![Word Count in status bar](images/wordcount.gif)
