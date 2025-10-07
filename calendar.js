const calendarEl = document.getElementById('calendar');
const todoPopup = document.getElementById('todo-popup');
const todoPopupContainer = document.getElementById('todo-popup-container');
const eventPopup = document.getElementById('event-popup');
const eventPopupContainer = document.getElementById('event-popup-container');
const editPopup = document.getElementById('edit-popup');
const editPopupContainer = document.getElementById('edit-popup-container');

let tasks = { dailyPlan: {}, calendarEvents: {} };
const todayKey = new Date().toISOString().slice(0, 10);
let isPopupOpen = false;
let calendar;

chrome.storage.local.get('tasks', (data) => {
    tasks = data.tasks || { dailyPlan: {}, calendarEvents: {} };
    if(!tasks.dailyPlan) tasks.dailyPlan = {};
    if(!tasks.calendarEvents) tasks.calendarEvents = {};
    if(!tasks.dailyPlan[todayKey]) tasks.dailyPlan[todayKey] = [];
    renderCalendar();
});

function saveTasks() {
    chrome.storage.local.set({ tasks });
}

// ========== Main calendar setup ==========
function renderCalendar() {
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        dayCellDidMount: handleDaycellDidMount,
        events: (info, successCallback) => {
            successCallback(loadCalendarEvents());
        },
        dateClick: handleDateClick,
        eventClick: handleEventClick,
    });

    calendar.render();
    scrollToToday();
}

function loadCalendarEvents() {
    const events = [];
    
    for (const date in tasks.calendarEvents) {
        tasks.calendarEvents[date].forEach((event, index) => {
            events.push({
                id: `${date}-${index}`,
                title: event.title,
                start: date,
                allDay: true,
            });
        });
    }

    return events;
}

function handleEventClick(info) {

    const lastDash = info.event.id.lastIndexOf('-');
    if (lastDash === -1) return;

    const date = info.event.id.slice(0, lastDash);
    const index = parseInt(info.event.id.slice(lastDash + 1), 10);

    if (!tasks.calendarEvents[date] || !tasks.calendarEvents[date][index]) {
        console.warn('No event found for date:', date, 'and index:', index);
        return;
    }

    if(info.jsEvent) {
        info.jsEvent.stopPropagation();
        info.jsEvent.preventDefault();
    }

    showEditPopup(date, index, info.el);
}

function handleDateClick(info) {
    if (isPopupOpen) {
        isPopupOpen = false;
        return;
    }

    if (info.jsEvent.target.classList.contains('today-btn')) return;

    const dateClick = info.dateStr;
    if (!tasks.dailyPlan[dateClick]) tasks.dailyPlan[dateClick] = [];

    showEventPopup(dateClick, info.dayEl);
}

function setupHomeButton() {
    const homeButton = document.getElementById('sidebar-home-button');
    
    const icon = document.createElement('i');

    const text = document.createElement('span');
    text.textContent = 'Home';

    homeButton.appendChild(icon);
    homeButton.appendChild(text);
}
setupHomeButton();

// ========== Today button creation ==========
function handleDaycellDidMount(arg) {
    const today = new Date();
    const isToday = today.toDateString() === arg.date.toDateString();
    if (!isToday) return;

    const btn = createTodayButton(arg);
    arg.el.style.position = 'relative';
    arg.el.appendChild(btn);
}

function createTodayButton(arg) {
    const btn = document.createElement('button');
    
    btn.innerHTML = '...';
    btn.classList.add('today-btn');
    btn.setAttribute('aria-label', 'Open tasks for today');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        showTodoPopup(arg.el);
        renderTodoList();
    });

    return btn;
}

function scrollToToday() {
    setTimeout(() => {
        const todayCell = document.querySelector('.fc-day-today');

        if (todayCell) {
            todayCell.scrollIntoView({ behavior: 'smooth', block: 'center' })};
    }, 400);
}

// ========== To-do list rendering ==========
function renderTodoList() {
    todoPopupContainer.innerHTML = '';

    const todayTasks = tasks.dailyPlan[todayKey] || [];
    todayTasks.forEach((task, index) => {
        createTaskItem(task, index);
    });

    addNewTaskBox();
}

function createTaskItem(task, index) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('todo-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done || false;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'New task';
    input.classList.add('todo-input');
    input.value = task.text || '';

    if (task.done) {
        input.style.textDecoration = 'line-through';
    }

    checkbox.addEventListener('change', () => {
        tasks.dailyPlan[todayKey][index].done = checkbox.checked;
        saveTasks();
        renderTodoList();
    });

    input.addEventListener('input', () => {
        tasks.dailyPlan[todayKey][index].text = input.value;
        saveTasks();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim() !== '') {
            e.preventDefault();

            tasks.dailyPlan[todayKey].push({ text: '', done: false });
            saveTasks();

            renderTodoList();

            const newInput = todoPopupContainer.querySelectorAll('.todo-input')[index + 1];
            if (newInput) newInput.focus();

        } else if (e.key === 'Backspace' && input.value === '') {
            e.preventDefault();

            tasks.dailyPlan[todayKey].splice(index, 1);
            saveTasks();

            renderTodoList();

            const prevInput = todoPopupContainer.querySelectorAll('.todo-input')[index - 1];
            if (prevInput) prevInput.focus();
        }
    });

    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(input);
    todoPopupContainer.appendChild(taskDiv);
}

function addNewTaskBox() {
    const btn = document.createElement('button');
    btn.textContent = '+ Add new task';
    btn.classList.add('add-task-btn');

    btn.addEventListener('click', () => {
        btn.remove();

        const newTask = { text: '', done: false };
        tasks.dailyPlan[todayKey].push(newTask);
        saveTasks();

        renderTodoList();

        // auto focus the new input
        const inputs = todoPopupContainer.querySelectorAll('.todo-input');
        const newInput = inputs[inputs.length - 1];
        if (newInput) newInput.focus();
    })

    todoPopupContainer.appendChild(btn);
}

// ========== Popup positioning and behavior ==========
function positionPopup(popup, cellEl) {
    const rect = cellEl.getBoundingClientRect();
    let top = rect.top + window.scrollY;;
    let left = rect.right + 8 + window.scrollX;

    if (left + popup.offsetWidth >= window.innerWidth - 20) {
        left = rect.left + window.scrollX - popup.offsetWidth - 8;
    }

    if (top + popup.offsetHeight >= window.innerHeight + window.scrollY - 20) {
        top = rect.top + window.scrollY - popup.offsetHeight;
    }

    popup.style.top = top + "px";
    popup.style.left = left + "px";
}

function showTodoPopup(cellEl) {
    todoPopup.classList.remove('hidden');
    eventPopup.classList.add('hidden');

    positionPopup(todoPopup, cellEl); 
    
    document.addEventListener('click', handleClickOutside);
    todoPopup.addEventListener('click', stopClosingPopup);
}

function showEventPopup(dateClick, dayEl) {
    eventPopup.classList.remove('hidden');
    todoPopup.classList.add('hidden');
    eventPopupContainer.innerHTML = ``;

    positionPopup(eventPopup, dayEl);

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Event title';

    const descBox = document.createElement('textarea');
    descBox.placeholder = 'Description...';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Event';

    saveBtn.addEventListener('click', () => {
        const newEvent = { title: titleInput.value, description: descBox.value };

        if (newEvent.title.trim() !== '') {
            if (!tasks.calendarEvents[dateClick]) tasks.calendarEvents[dateClick] = [];
            tasks.calendarEvents[dateClick].push(newEvent);
            saveTasks();
        }

        calendar.refetchEvents();
        eventPopup.classList.add('hidden');
    });

    eventPopupContainer.appendChild(titleInput);
    eventPopupContainer.appendChild(descBox);
    eventPopupContainer.appendChild(saveBtn);

    document.addEventListener('click', handleClickOutside);
    eventPopup.addEventListener('click', stopClosingPopup);
}

function showEditPopup(date, index, eventEl) {
    editPopup.classList.remove('hidden');
    todoPopup.classList.add('hidden');
    eventPopup.classList.add('hidden');
    editPopupContainer.innerHTML = ``;

    positionPopup(editPopup, eventEl);

    const event = tasks.calendarEvents[date][index];

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = event.title || '';

    const descBox = document.createElement('textarea');
    descBox.value = event.description || '';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete Event';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Changes';

    saveBtn.addEventListener('click', () => {
        event.title = titleInput.value;
        event.description = descBox.value;

        saveTasks();

        calendar.refetchEvents();
        editPopup.classList.add('hidden');
    });

    deleteBtn.addEventListener('click', () => {
        tasks.calendarEvents[date].splice(index, 1);
        if (tasks.calendarEvents[date].length === 0) {
            delete tasks.calendarEvents[date];
        }

        saveTasks();
        calendar.refetchEvents();
        editPopup.classList.add('hidden');
    });

    editPopupContainer.appendChild(titleInput);
    editPopupContainer.appendChild(descBox);
    editPopupContainer.appendChild(deleteBtn);
    editPopupContainer.appendChild(saveBtn);

    document.addEventListener('click', handleClickOutside);
    editPopup.addEventListener('click', stopClosingPopup);
}

function handleClickOutside() {
    todoPopup.classList.add('hidden');
    eventPopup.classList.add('hidden');
    editPopup.classList.add('hidden');
    document.removeEventListener('click', handleClickOutside);

    isPopupOpen = true;
}

function stopClosingPopup(e) {
    e.stopPropagation();
}

