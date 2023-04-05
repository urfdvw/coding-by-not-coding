const fileTree = document.getElementById("file-tree");

document.getElementById("open-directory").addEventListener("click", async () => {
    const dirHandle = await window.showDirectoryPicker();
    const fileTree = document.getElementById("file-tree");
    fileTree.innerHTML = "";
    await createTreeView(dirHandle, fileTree);
});

async function createTreeView(itemHandle, parent) {
    const listItem = document.createElement("li");
    listItem.dataset.type = itemHandle.kind;
    listItem.handle = itemHandle; // Store the handle on the list item

    if (itemHandle.kind === "file") {
        listItem.classList.add("file");
        listItem.textContent = itemHandle.name;
        parent.appendChild(listItem);
    } else {
        listItem.classList.add("folder");
        listItem.textContent = itemHandle.name;
        parent.appendChild(listItem);

        const childList = document.createElement("ul");
        childList.style.display = "none";
        listItem.appendChild(childList);

        for await (const entry of itemHandle.values()) {
            await createTreeView(entry, childList);
        }
    }
}

const contextMenu = document.getElementById("context-menu");

fileTree.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("folder")) {
        const childList = target.querySelector("ul");
        if (childList) {
            childList.style.display = childList.style.display === "none" ? "block" : "none";
        }
    }
});

function showContextMenu(event) {
    event.preventDefault();
    contextMenu.style.display = "block";
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.top = `${event.clientY}px`;

    contextMenu.target = event.target;
}

function hideContextMenu() {
    contextMenu.style.display = "none";
}

fileTree.addEventListener("contextmenu", showContextMenu);

document.addEventListener("click", (event) => {
    if (event.target.closest("#context-menu") === null) {
        hideContextMenu();
    }
});

// Utility function to copy a directory recursively
async function copyDirectory(srcHandle, destHandle) {
    for await (const entry of srcHandle.values()) {
        if (entry.kind === 'directory') {
            const newDestHandle = await destHandle.getDirectoryHandle(entry.name, { create: true });
            await copyDirectory(entry, newDestHandle);
        } else {
            const file = await entry.getFile();
            const writableStream = await destHandle.getFileHandle(entry.name, { create: true }).then(fh => fh.createWritable());
            await file.stream().pipeTo(writableStream);
        }
    }
}

// Utility function to remove a directory recursively
async function removeDirectory(dirHandle) {
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'directory') {
            await removeDirectory(entry);
        }
        await dirHandle.removeEntry(entry.name);
    }
}

// Utility function to get the parent directory handle of a given entry
async function getParentHandle(entryHandle) {
    const parentPath = entryHandle.fullPath.split('/').slice(0, -1).join('/');
    const rootHandle = await navigator.storage.getDirectory();
    return rootHandle.getDirectoryHandle(parentPath);
}

document.getElementById("rename").addEventListener("click", async () => {
    const newName = prompt("Enter new name:");
    if (newName) {
        try {
            const target = contextMenu.target;
            const parentHandle = await getParentHandle(target.handle);

            if (target.dataset.type === 'directory') {
                const newDirHandle = await parentHandle.getDirectoryHandle(newName, { create: true });
                await copyDirectory(target.handle, newDirHandle);
                await removeDirectory(target.handle);
            } else {                const file = await target.handle.getFile();
                const writableStream = await parentHandle.getFileHandle(newName, { create: true }).then(fh => fh.createWritable());
                await file.stream().pipeTo(writableStream);
                await parentHandle.removeEntry(target.handle.name);
            }

            target.textContent = newName;
        } catch (error) {
            console.error("Error renaming:", error);
        }
    }
    hideContextMenu();
});

document.getElementById("delete").addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete?")) {
        try {
            const target = contextMenu.target;
            const parentHandle = await getParentHandle(target.handle);

            if (target.dataset.type === 'directory') {
                await removeDirectory(target.handle);
            } else {
                await parentHandle.removeEntry(target.handle.name);
            }

            target.remove();
        } catch (error) {
            console.error("Error deleting:", error);
        }
    }
    hideContextMenu();
});

document.getElementById("new-file").addEventListener("click", async () => {
    const fileName = prompt("Enter new file name:");
    if (fileName) {
        try {
            const target = contextMenu.target;
            const parentHandle = target.dataset.type === 'directory' ? target.handle : await getParentHandle(target.handle);
            const newFileHandle = await parentHandle.getFileHandle(fileName, { create: true });

            const listItem = document.createElement("li");
            listItem.dataset.type = "file";
            listItem.handle = newFileHandle;
            listItem.classList.add("file");
            listItem.textContent = fileName;

            if (target.dataset.type === 'directory') {
                target.querySelector("ul").appendChild(listItem);
            } else {
                target.insertAdjacentElement("afterend", listItem);
            }
        } catch (error) {
            console.error("Error creating new file:", error);
        }
    }
    hideContextMenu();
});

document.getElementById("new-folder").addEventListener("click", async () => {
    const folderName = prompt("Enter new folder name:");
    if (folderName) {
        try {
            const target = contextMenu.target;
            const parentHandle = target.dataset.type === 'directory' ? target.handle : await getParentHandle(target.handle);
            const newFolderHandle = await parentHandle.getDirectoryHandle(folderName, { create: true });

            const listItem = document.createElement("li");
            listItem.dataset.type = "directory";
            listItem.handle = newFolderHandle;
            listItem.classList.add("folder");
            listItem.textContent = folderName;

            const childList = document.createElement("ul");
            childList.style.display = "none";
            listItem.appendChild(childList);

            if (target.dataset.type === 'directory') {
                target.querySelector("ul").appendChild(listItem);
            } else {
                target.insertAdjacentElement("afterend", listItem);
            }
        } catch (error) {
            console.error("Error creating new folder:", error);
        }
    }
    hideContextMenu();
});