class ExplorerPanel extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                @import "styles.css";
            </style>
            <div class="explorer-panel">
                <button class="open-directory">Open Directory</button>
                <ul class="directory-tree"></ul>
            </div>
        `;

        this.openDirectoryButton = this.shadowRoot.querySelector('.open-directory');
        this.directoryTree = this.shadowRoot.querySelector('.directory-tree');

        this.openDirectoryButton.addEventListener('click', () => this.openDirectory());
    }

    async openDirectory() {
        // Open the directory and read its contents
        const dirHandle = await window.showDirectoryPicker();
        const items = await this.readDirectory(dirHandle);

        // Clear the current directory tree and render the new one
        this.directoryTree.innerHTML = '';
        this.renderDirectoryTree(items, this.directoryTree);
    }

async readDirectory(dirHandle) {
    const items = [];

    // Iterate through the directory entries
    for await (const entry of dirHandle.values()) {
        const item = {
            name: entry.name,
            handle: entry,
            isFolder: entry.kind === 'directory',
            children: entry.kind === 'directory' ? await this.readDirectory(entry) : null,
        };
        items.push(item);
    }

    return items;
}

renderDirectoryTree(items, parentElement) {
    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item.name;

        if (item.isFolder) {
            listItem.classList.add('folder');
            listItem.addEventListener('click', event => {
                event.stopPropagation();
                listItem.classList.toggle('open');
            });

            const subList = document.createElement('ul');
            listItem.append(subList);
            listItem.addEventListener('contextmenu', event => {
                event.preventDefault();
                this.showContextMenu(event.pageX, event.pageY, [
                    { label: 'New File', action: () => this.createNewFile(item.handle) },
                    { label: 'New Folder', action: () => this.createNewFolder(item.handle) },
                ]);
            });

            this.renderDirectoryTree(item.children, subList);
        } else {
            listItem.classList.add('file');
            listItem.addEventListener('click', async event => {
                event.stopPropagation();
                const file = await item.handle.getFile();
                const content = await file.text();
                console.log(content);
            });

            listItem.addEventListener('contextmenu', event => {
                event.preventDefault();
                this.showContextMenu(event.pageX, event.pageY, [
                    { label: 'Rename', action: () => this.renameFile(item.handle) },
                    { label: 'Delete', action: () => this.deleteFile(item.handle, listItem) },
                ]);
            });
        }

        parentElement.appendChild(listItem);
    });
}

showContextMenu(x, y, actions) {
    const contextMenu = this.shadowRoot.querySelector('.context-menu');

    if (!contextMenu) {
        const menu = document.createElement('div');
        menu.classList.add('context-menu');

        actions.forEach(action => {
            const button = document.createElement('button');
            button.textContent = action.label;
            button.addEventListener('click', () => {
                action.action();
                menu.style.display = 'none';
            });

            menu.appendChild(button);
        });

        this.shadowRoot.appendChild(menu);
        this.showContextMenu(x, y, actions);
    } else {
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';
    }
}

async createNewFile(parentHandle) {
    // To be implemented
    console.log('createNewFile');
}

async createNewFolder(parentHandle) {
    // To be implemented
    console.log('createNewFolder');
}

async renameFile(fileHandle) {
    // To be implemented
    console.log('renameFile');
}

async deleteFile(fileHandle, listItem) {
    // To be implemented
    console.log('deleteFile');
}
}

customElements.define('explorer-panel', ExplorerPanel);
