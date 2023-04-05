const fileTree = document.getElementById("file-tree");

document.getElementById("open-directory").addEventListener("click", async () => {
    const dirHandle = await window.showDirectoryPicker();
    fileTree.innerHTML = "";
    await createTreeView(dirHandle, fileTree);
});

async function createTreeView(itemHandle, parent) {
    const listItem = document.createElement("li");
    listItem.dataset.type = itemHandle.kind;
    listItem.handle = itemHandle;
    listItem.parentHandle = parent.parentHandle || null;

    const itemText = document.createElement("span");
    itemText.textContent = itemHandle.name;
    listItem.appendChild(itemText);

    if (itemHandle.kind === "directory") {
        listItem.className = "folder";
        itemText.addEventListener("click", async (event) => {
            event.stopPropagation();
            if (!listItem.querySelector("ul")) {
                const ul = document.createElement("ul");
                ul.parentHandle = itemHandle;
                listItem.appendChild(ul);
                for await (const entry of itemHandle.values()) {
                    await createTreeView(entry, ul);
                }
            } else {
                listItem.querySelector("ul").remove();
            }
        });
    } else {
        listItem.className = "file";
    }

    parent.appendChild(listItem);
}

fileTree.addEventListener("click", async (event) => {
    const target = event.target.closest("li");
    if (target && target.dataset.type === "file") {
        event.stopPropagation();
        const file = await target.handle.getFile();
        const content = await file.text();
        console.log(content);
    }
});


const contextMenu = document.getElementById("context-menu");
fileTree.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const target = event.target.closest("li");
    if (target) {
        contextMenu.target = target;

        document.getElementById("rename").style.display = target.dataset.type === "directory" ? "none" : "block";
        document.getElementById("delete").style.display = target.dataset.type === "directory" ? "none" : "block";
        document.getElementById("new-file").style.display = target.dataset.type === "directory" ? "block" : "none";
        document.getElementById("new-folder").style.display = target.dataset.type === "directory" ? "block" : "none";

        contextMenu.style.left = event.pageX + "px";
        contextMenu.style.top = event.pageY + "px";
        contextMenu.style.display = "block";
    }
});


document.addEventListener("click", (event) => {
    if (!event.target.closest("#context-menu")) {
        hideContextMenu();
    }
});

function hideContextMenu() {
    contextMenu.style.display = "none";
}

async function getParentHandle(listItem) {
    return listItem.parentHandle;
}

document.getElementById("rename").addEventListener("click", async () => {
    const newName = prompt("Enter new name:");
    if (newName) {
        try {
            const target = contextMenu.target;
            const parentHandle = await getParentHandle(target);

            if (target.dataset.type === "file") {
                const file = await target.handle.getFile();
                const originalContent = await file.text();

                await target.handle.remove();

                const newFileHandle = await parentHandle.getFileHandle(newName, { create: true });
                const writableStream = await newFileHandle.createWritable();
                await writableStream.write(originalContent);
                await writableStream.close();

                target.handle = newFileHandle;
                target.textContent = newName;
            }

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
            const parentHandle = await getParentHandle(target);

            if (target.dataset.type === "directory") {
                await target.handle.removeRecursively(); // Use removeRecursively for directories
            } else {
                await target.handle.remove(); // Use remove for files
            }

            target.remove();
        } catch (error) {
            console.error("Error deleting:", error);
        }
    }
    hideContextMenu();
});

document.getElementById("new-file").addEventListener("click", async () => {
    const fileName = prompt("Enter file name:");
    if (fileName) {
        try {
            const target = contextMenu.target;
            const newFileHandle = await target.handle.getFileHandle(fileName, { create: true });
            await createTreeView(newFileHandle, target.querySelector("ul"));
        } catch (error) {
            console.error("Error creating new file:", error);
        }
    }
    hideContextMenu();
});

document.getElementById("new-folder").addEventListener("click", async () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
        try {
            const target = contextMenu.target;
            const newFolderHandle = await target.handle.getDirectoryHandle(folderName, { create: true });
            await createTreeView(newFolderHandle, target.querySelector("ul"));
        } catch (error) {
            console.error("Error creating new folder:", error);
        }
    }
    hideContextMenu();
});

