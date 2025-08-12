const input = document.getElementById('input');
const submitBtn = document.getElementById('submitBtn');
const tasksContainer = document.getElementById('tasksContainer');
const errorMsg = document.getElementById('errorMsg');
const counter = document.getElementById('counter');
let tasks = [];

const options = document.querySelectorAll('.filter-option');
const filterAll = document.querySelectorAll('[data-filter="all"]');
const filterActive = document.querySelectorAll('[data-filter="active"]');
const filterCompleted = document.querySelectorAll('[data-filter="completed"]');
let currentFilter = 'all';

submitBtn.addEventListener('click', () => {

    input.focus();

    const inputValue = input.value.trim();

    if (!validateInput(inputValue)) {
        return;
    }

    checkInputButton();

    tasks.unshift({
        id: newId(),
        content: inputValue,
        isCompleted: false
    });

    clearInput();
    updateCounter();
    saveTask();

    // Detect which filter is active and render accordingly
    if (document.querySelector('[data-filter="active"].active')) {
        renderTasks(tasks.filter(task => !task.isCompleted));
    }
    else if (document.querySelector('[data-filter="completed"].active')) {
        renderTasks(tasks.filter(task => task.isCompleted));
    }
    else {
        renderTasks();
    }
});

const newId = () => crypto.randomUUID();

function validateInput(input) {
    if (input === '') {
        errorMsg.classList.remove('hidden');
        return false;
    }

    errorMsg.classList.add('hidden');
    return true;
}

function checkInputButton() {
    submitBtn.classList.add('checked');

    setTimeout(() => {
        submitBtn.classList.remove('checked');
    }, 1000);
}

const clearInput = () => input.value = '';

function updateCounter() {
    const notCompletedTasks = tasks.filter(task => !task.isCompleted);

    counter.innerText = notCompletedTasks.length;
}

function saveTask() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasksLocalStorage = localStorage.getItem('tasks');

    return tasksLocalStorage ? JSON.parse(tasksLocalStorage) : [];
}

function renderTasks(list = tasks) {
    if (list.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <p class="task-text">No todos yet</p>
            </div>
            <div class="line"></div>
        `;
        return;
    }

    tasksContainer.innerHTML = list.map(task => `
        <div class="todo-task" draggable="true" data-id="${task.id}">
            <div class="flex-spacing">
                <button class="check-box ${task.isCompleted ? 'checked' : ''}"></button>
                <p class="task-text ${task.isCompleted ? 'checked' : ''}">${task.content}</p>
            </div>
            <button class="delete-todo"><img src="images/icon-cross.svg" alt=""></button>
        </div>
        <div class="line"></div>
    `).join('');

    renderDragging();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);

    saveTask();
    renderTasks();
    updateCounter();
}

tasksContainer.addEventListener('click', e => {
    const target = e.target;

    const currentTaskId = target.closest('.todo-task').dataset.id;

    if (target.matches('.check-box')) {
        try {
            const task = tasks.find(t => t.id === currentTaskId);

            task.isCompleted = !task.isCompleted;

            target.classList.toggle('checked', task.isCompleted);

            target.parentElement.querySelector('.task-text')
                .classList.toggle('checked', task.isCompleted);

            updateCounter();
            saveTask();
        } catch (error) {
            console.error(`Error when checking task: ${error}`);
        }
    }

    if (target.closest('.delete-todo')) {
        deleteTask(currentTaskId);
    }
});

function renderDragging() {
    const tasksItems = tasksContainer.querySelectorAll('.todo-task');

    tasksItems.forEach(item => {
        item.addEventListener('dragstart', () => {
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            updateTasksOrder();
        });
    });

    tasksContainer.addEventListener('dragover', e => {
        e.preventDefault();

        const currentDraggedElement = tasksContainer.querySelector('.dragging');
        const elementAfter = getElementAfterDrag(e.clientY);

        if (elementAfter == null) {
            tasksContainer.append(currentDraggedElement);
        }
        else {
            tasksContainer.insertBefore(currentDraggedElement, elementAfter);
        }

        insertLine();
    });
}

function getElementAfterDrag(y) {
    const currentElements = [...tasksContainer.querySelectorAll('.todo-task:not(.dragging)')];

    return currentElements.reduce((closest, el) => {

        const box = el.getBoundingClientRect();

        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: el };
        }
        else {
            return closest;
        }

    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateTasksOrder() {
    const displayedOrder = [];

    tasksContainer.querySelectorAll('.todo-task').forEach(taskEl => {
        const id = taskEl.dataset.id;
        const task = tasks.find(t => t.id === id);
        if (task) {
            displayedOrder.push(task);
        }
    });

    if (currentFilter === 'all') {
        tasks = displayedOrder;
    } else {
        const newOrder = [];
        let visibleIndex = 0;
        tasks.forEach(task => {
            if (
                (currentFilter === 'active' && !task.isCompleted) ||
                (currentFilter === 'completed' && task.isCompleted)
            ) {
                newOrder.push(displayedOrder[visibleIndex++]);
            }
            else {
                newOrder.push(task);
            }
        });
        tasks = newOrder;
    }

    saveTask();
}

function insertLine() {
    const taskElements = tasksContainer.querySelectorAll('.todo-task');

    tasksContainer.querySelectorAll('.line').forEach(line => line.remove());

    taskElements.forEach(task => {
        const line = document.createElement('div');
        line.classList.add('line');
        task.insertAdjacentElement('afterend', line);
    });
}


// the idea is that both filter buttons on mobile and desktop get
// the same functionality so it doesn't matter which you press
function setActiveFilter(elements) {
    options.forEach(filter => filter.classList.remove('active'));

    elements.forEach(element => element.classList.add('active'));
}

filterAll.forEach(button => {
    button.addEventListener('click', () => {
        setActiveFilter(filterAll);

        currentFilter = 'all';

        tasks = loadTasks();

        renderTasks();
    });
});

filterActive.forEach(button => {
    button.addEventListener('click', () => {
        setActiveFilter(filterActive);

        currentFilter = 'active';

        tasks = loadTasks();

        renderTasks(tasks.filter(task => !task.isCompleted));
    });
});

filterCompleted.forEach(button => {
    button.addEventListener('click', () => {
        setActiveFilter(filterCompleted);

        currentFilter = 'completed';

        tasks = loadTasks();

        renderTasks(tasks.filter(task => task.isCompleted));
    });
});


const clearCompleted = document.getElementById('clearCompleted');
clearCompleted.addEventListener('click', () => {
    tasks = loadTasks();

    tasks = tasks.filter(task => !task.isCompleted);

    setActiveFilter(filterAll);
    saveTask();
    renderTasks();
});


const themeSwitch = document.getElementById('themeSwitch');
const themeIcon = themeSwitch.querySelector('img');
const body = document.body;

const setTheme = () => {
    const saved = localStorage.getItem('theme');

    let theme;
    if (saved !== null) {
        theme = saved;
    }
    else {
        // using system preference theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = 'dark';
        } else {
            theme = 'light';
        }
    }

    body.dataset.theme = theme;
    themeIcon.src = theme === 'dark' ? 'images/icon-sun.svg' : 'images/icon-moon.svg';
};

themeSwitch.addEventListener('click', () => {
    const theme = body.dataset.theme === 'dark' ? 'light' : 'dark';

    body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    themeIcon.src = theme === 'dark' ? 'images/icon-sun.svg' : 'images/icon-moon.svg';
});


document.addEventListener('DOMContentLoaded', () => {

    setTheme();

    tasks = loadTasks();

    setActiveFilter(filterAll);

    renderTasks();

    updateCounter();

});
