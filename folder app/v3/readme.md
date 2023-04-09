Please create a custom element with vanilla JavaScript, HTML, and CSS.
Don't use any external packages such as jQuery or any CDNs.
When considering browser compatibility, please only consider Chrome.
Please write the code with extensive comments and documentation
Please also provide an example where this custom element is used.

This app should resemble the "explorer" pannel in vscode or vscode.dev

- There is a button called 'Open Directory.'
    - The handler of this button will open a directory locally by "file API."
- All contents of that opened directory are shown as a tree
- folders are collapsed by default
- left click on the name of a folder to toggle collapse and expand
- left click on the name of a file item will show the content of that file in console.log()
- right click should show the context menu, where
    - if right click on the name of a folder item show the followig options
        - new file
            - create a local file by a given name in that folder right-clicked on
        - new folder
            - create a local folder by a given name in that folder right-clicked on
    - if right click on the name of a file item show the followig options
        - rename
            - do the following work around
                - copy the content of the current file
                - delete the current file
                - create a new local file with the new name given and the content copied from the original file
            - there should be a popup to confirm renaming
        - delete
            - which will delete the local file
            - there should be a popup to confirm the deletion
- the context menu click handler should be working on items and sub-items alike
- rename, delete, new file, and new folder operation should be reflected on the tree view and local directory simultaneously.

The core is to access local files by "File API".
browser app can access local directories by file API, such as
```js
const dirHandle = await window.showDirectoryPicker();
const items = await readDirectory(dirHandle);
```
If you want documentation of "file API" you can check https://developer.mozilla.org/en-US/docs/Web/API/File_API
