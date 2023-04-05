Please create a web app with vanilla JavaScript, HTML, and CSS.
Don't use any external packages such as jQuery or any CDNs.
When considering browser compatibility, please only consider Chrome.

This app should resemble the "explorer" pannel in vscode or vscode.dev

- There is a button called 'Open Directory.'
    - The handler of this button will open a directory locally by "file API."
- All contents of that opened directory are shown as a tree
- folders are collapsed by default
- left click on a folder to toggle collapse and expand
- right click should show the context menu, including
    - rename
        - which will rename the local file or the local folder
        - there should be a popup to confirm renaming
    - delete
        - which will delete the local file or the whole local folder
        - there should be a popup to confirm the deletion
    - new file (if right-click on folder)
        - create a local file by a given name in that folder right-clicked on
    - new folder (if right-click on folder)
        - create a local folder by a given name in that folder right-clicked on
- the context menu click handler should be working on items and sub-items alike
- rename, delete, new file, and new folder operation should be reflected on the tree view and local directory simultaneously.

The core is to access local files by "File API".
browser app can access local directories by file API, such as
```js
const dirHandle = await window.showDirectoryPicker();
const items = await readDirectory(dirHandle);
```
If you want documentation of "file API" you can check https://developer.mozilla.org/en-US/docs/Web/API/File_API

PS: Please write the code with extensive comments and documentation