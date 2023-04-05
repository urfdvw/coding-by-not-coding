document.addEventListener('DOMContentLoaded', () => {
    let windowCounter = 2;

    const addNewWindowBtn = document.createElement('button');
    addNewWindowBtn.textContent = '+';
    addNewWindowBtn.classList.add('taskbar-item', 'add-new-window');
    document.querySelector('.taskbar').appendChild(addNewWindowBtn);

    addNewWindowBtn.addEventListener('click', createNewWindow);

    initializeWindow(document.querySelector('#window-1'));
    initializeWindow(document.querySelector('#window-2'));

    function createNewWindow() {
        windowCounter++;

        const windowTemplate = `
            <div class="window-titlebar">
                <span class="window-title">Window ${windowCounter}</span>
                <div class="window-controls">
                    <button class="minimize">-</button>
                    <button class="maximize">+</button>
                    <button class="close">×</button>
                </div>
            </div>
            <div class="window-content">
                <p>Window ${windowCounter} content...</p>
            </div>
        `;

        const newWindow = document.createElement('div');
        newWindow.id = `window-${windowCounter}`;
        newWindow.className = 'window';
        newWindow.innerHTML = windowTemplate;
        document.body.appendChild(newWindow);

        const newTaskbarItem = document.createElement('button');
        newTaskbarItem.className = 'taskbar-item';
        newTaskbarItem.textContent = `Window ${windowCounter}`;
        newTaskbarItem.dataset.windowId = windowCounter;
        document.querySelector('.taskbar').insertBefore(newTaskbarItem, addNewWindowBtn);

        newTaskbarItem.addEventListener('click', toggleWindow);
        initializeWindow(newWindow);
    }

    function initializeWindow(windowElement) {
        const titlebar = windowElement.querySelector('.window-titlebar');
        const minimize = windowElement.querySelector('.minimize');
        const maximize = windowElement.querySelector('.maximize');
        const close = windowElement.querySelector('.close');

        titlebar.addEventListener('mousedown', e => startDrag(windowElement, e));
        titlebar.addEventListener('mouseup', () => stopDrag(windowElement));

        minimize.addEventListener('click', () => {
            const taskbarItem = getTaskbarItemForWindow(windowElement);
            taskbarItem.click();
        });

        maximize.addEventListener('click', () => {
            windowElement.classList.toggle('maximized');
            if (windowElement.classList.contains('maximized')) {
                windowElement.style.zIndex = 1000;
            } else {
                windowElement.style.zIndex = '';
            }
        });

        close.addEventListener('click', () => {
            const taskbarItem = getTaskbarItemForWindow(windowElement);
            taskbarItem.remove();
            windowElement.remove();
        });

        // windowElement.addEventListener('mousemove', e => resizeWindow(windowElement, e));
        windowElement.addEventListener('mousedown', e => startResize(windowElement, e));
        windowElement.addEventListener('mouseup', stopResize);
    }

    function toggleWindow() {
        const windowId = this.dataset.windowId;
        const windowElement = document.getElementById(`window-${windowId}`);
        windowElement.classList.toggle('minimized');
    }
    function getTaskbarItemForWindow(windowElement) {
        const windowId = windowElement.id.split('-')[1];
        return document.querySelector(`.taskbar-item[data-window-id="${windowId}"]`);
    }

    function resizeWindow(windowElement, e) {
        const resizeAreaSize = 10;
        const rect = windowElement.getBoundingClientRect();
        const isOnRightEdge = Math.abs(e.clientX - rect.right) <= resizeAreaSize;
        const isOnBottomEdge = Math.abs(e.clientY - rect.bottom) <= resizeAreaSize;

        if (!windowElement.classList.contains('maximized')) {
            windowElement.style.cursor = isOnRightEdge || isOnBottomEdge ? 'nwse-resize' : 'default';

            if (isOnRightEdge) {
                windowElement.style.width = `${e.clientX - rect.left}px`;
            }
            if (isOnBottomEdge) {
                windowElement.style.height = `${e.clientY - rect.top}px`;
            }
        }
    }
});

function startResize(element, e) {
    const resizeAreaSize = 10;
    const rect = element.getBoundingClientRect();
    const isOnRightEdge = Math.abs(e.clientX - rect.right) <= resizeAreaSize;
    const isOnBottomEdge = Math.abs(e.clientY - rect.bottom) <= resizeAreaSize;

    if (isOnRightEdge || isOnBottomEdge) {
        dragData.element = element;
        dragData.initialX = e.clientX;
        dragData.initialY = e.clientY;
        dragData.offsetX = element.clientWidth;
        dragData.offsetY = element.clientHeight;

        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
    }
}

function resize(e) {
    if (!dragData.element) return;

    const minWidth = 100;
    const dx = e.clientX - dragData.initialX;
    const dy = e.clientY - dragData.initialY;

    const newWidth = dragData.offsetX + dx;
    const newHeight = dragData.offsetY + dy;

    if (newWidth > minWidth) {
        dragData.element.style.width = `${newWidth}px`;
    }

    dragData.element.style.height = `${newHeight}px`;

    // Edge snapping
    const snapThreshold = 20;
    const windowRect = dragData.element.getBoundingClientRect();

    if (windowRect.left <= snapThreshold) {
        dragData.element.style.left = '0px';
    }
    if (windowRect.right >= window.innerWidth - snapThreshold) {
        dragData.element.style.left = `${window.innerWidth - windowRect.width}px`;
    }
}

function stopResize() {
    dragData.element = null;
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', stopResize);
}


let dragData = {
    element: null,
    initialX: 0,
    initialY: 0,
    offsetX: 0,
    offsetY: 0
};

function startDrag(element, e) {
    dragData.element = element;
    dragData.initialX = e.clientX;
    dragData.initialY = e.clientY;
    dragData.offsetX = element.offsetLeft;
    dragData.offsetY = element.offsetTop;

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stopDrag);
}

function move(e) {
    if (!dragData.element) return;

    const dx = e.clientX - dragData.initialX;
    const dy = e.clientY - dragData.initialY;

    dragData.element.style.left = `${dragData.offsetX + dx}px`;
    dragData.element.style.top = `${dragData.offsetY + dy}px`;

    // Edge snapping
    const snapThreshold = 20;
    const windowRect = dragData.element.getBoundingClientRect();

    if (windowRect.left <= snapThreshold) {
        dragData.element.style.left = '0px';
    }
    if (windowRect.right >= window.innerWidth - snapThreshold) {
        dragData.element.style.left = `${window.innerWidth - windowRect.width}px`;
    }
}

function stopDrag() {
    dragData.element = null;
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', stopDrag);
}
