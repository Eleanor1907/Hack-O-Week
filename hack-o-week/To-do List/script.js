document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const body = document.body;
    const themeToggleBtn = document.getElementById("theme-toggle");
    const taskInput = document.getElementById("new-task-input");
    const addTaskBtn = document.getElementById("add-task-btn");
    const categoryInput = document.getElementById("task-category");
    const dateInput = document.getElementById("task-due-date");
    const priorityInput = document.getElementById("task-priority");
    const taskList = document.getElementById("task-list");
    const emptyState = document.getElementById("empty-state");
    const progressText = document.getElementById("progress-text");
    const progressBar = document.getElementById("progress-bar");
    
    const searchInput = document.getElementById("search-input");
    const filterStatus = document.getElementById("filter-status");
    const filterCategory = document.getElementById("filter-category");

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let dragStartIndex = null;

    // Initialize Theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    // Toggle Theme
    themeToggleBtn.addEventListener("click", () => {
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });

    // Save to LocalStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateProgress();
    }

    // Update Progress Bar
    function updateProgress() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        
        progressText.innerText = `${completed}/${total} tasks completed`;
        
        let percentage = total === 0 ? 0 : (completed / total) * 100;
        progressBar.style.width = `${percentage}%`;

        // Confetti if all tasks complete
        if (total > 0 && completed === total) {
            triggerConfetti();
        }
    }

    // Trigger Confetti
    function triggerConfetti() {
        if (window.confetti) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4361ee', '#ff4d4f', '#52c41a', '#faad14']
            });
        }
    }

    // Format Date string
    function formatDate(dateStr) {
        if (!dateStr) return "";
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }

    // Render Tasks
    function renderTasks() {
        taskList.innerHTML = "";
        
        const searchTerm = searchInput.value.toLowerCase();
        const fStatus = filterStatus.value;
        const fCategory = filterCategory.value;

        // Apply filters
        let filteredTasks = tasks.filter(task => {
            const matchesSearch = task.text.toLowerCase().includes(searchTerm);
            const matchesStatus = fStatus === 'All' ? true : 
                                 (fStatus === 'Completed' ? task.completed : !task.completed);
            const matchesCategory = fCategory === 'All' ? true : task.category === fCategory;
            return matchesSearch && matchesStatus && matchesCategory;
        });

        // Sort: Pinned first
        filteredTasks.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return 0;
        });

        if (filteredTasks.length === 0) {
            emptyState.style.display = "flex";
        } else {
            emptyState.style.display = "none";
        }

        filteredTasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.className = `task-item ${task.completed ? 'completed' : ''} ${task.pinned ? 'pinned' : ''}`;
            li.setAttribute("data-id", task.id);
            li.setAttribute("data-priority", task.priority);
            li.setAttribute("draggable", true);

            li.innerHTML = `
                <div class="task-content">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                        <div class="custom-checkbox"><i class="fa-solid fa-check"></i></div>
                    </div>
                    <div class="task-details">
                        <span class="task-text">${task.text}</span>
                        <div class="task-meta">
                            <span class="category-tag">${task.category}</span>
                            ${task.dueDate ? `<span class="date-tag"><i class="fa-regular fa-calendar"></i> ${formatDate(task.dueDate)}</span>` : ''}
                            <span class="priority-indicator" title="${task.priority} Priority"></span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn pin-btn ${task.pinned ? 'pinned-icon' : ''}" data-id="${task.id}" title="Pin Task">
                        <i class="fa-solid fa-thumbtack"></i>
                    </button>
                    <button class="action-btn edit-btn" data-id="${task.id}" title="Edit Task">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${task.id}" title="Delete Task">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            setupDragAndDrop(li, index, filteredTasks);

            taskList.appendChild(li);
        });

        attachEventListeners();
        updateProgress();
    }

    // Add Task
    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text,
            category: categoryInput.value,
            dueDate: dateInput.value,
            priority: priorityInput.value,
            completed: false,
            pinned: false
        };

        tasks.unshift(newTask); // Add to top
        saveTasks();
        renderTasks();

        // Reset Inputs
        taskInput.value = "";
        dateInput.value = "";
    }

    // Delete Task
    function deleteTask(id, listItemElement) {
        listItemElement.classList.add("removing");
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }, 300); // Wait for fadeOut animation
    }

    // Toggle Complete
    function toggleComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    // Toggle Pin
    function togglePin(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.pinned = !task.pinned;
            saveTasks();
            renderTasks();
        }
    }

    // Edit Task
    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt("Edit Task:", task.text);
            if (newText !== null && newText.trim() !== "") {
                task.text = newText.trim();
                saveTasks();
                renderTasks();
            }
        }
    }

    // Attach Dynamic Event Listeners
    function attachEventListeners() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const li = btn.closest('.task-item');
                deleteTask(id, li);
            });
        });

        document.querySelectorAll('.task-checkbox').forEach(box => {
            box.addEventListener('change', (e) => {
                toggleComplete(box.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.pin-btn').forEach(btn => {
            btn.addEventListener('click', () => togglePin(btn.getAttribute('data-id')));
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editTask(btn.getAttribute('data-id')));
        });
    }

    // Drag and Drop Logic
    function setupDragAndDrop(item, index, currentList) {
        item.addEventListener('dragstart', (e) => {
            // Find global index in main tasks array based on id
            const taskId = item.getAttribute('data-id');
            dragStartIndex = tasks.findIndex(t => t.id === taskId);
            
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', taskId);
            setTimeout(() => item.style.opacity = '0.5', 0);
        });

        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
            document.querySelectorAll('.task-item').forEach(el => el.classList.remove('drag-over'));
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            
            const dropTaskId = item.getAttribute('data-id');
            const dropTargetIndex = tasks.findIndex(t => t.id === dropTaskId);
            
            const draggedTaskId = e.dataTransfer.getData('text/plain');
            
            if (dragStartIndex !== null && dragStartIndex !== dropTargetIndex) {
                // Reorder tasks array
                const [draggedItem] = tasks.splice(dragStartIndex, 1);
                tasks.splice(dropTargetIndex, 0, draggedItem);
                
                saveTasks();
                renderTasks();
            }
        });
    }

    // Events
    addTaskBtn.addEventListener("click", addTask);

    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });

    searchInput.addEventListener("input", renderTasks);
    filterStatus.addEventListener("change", renderTasks);
    filterCategory.addEventListener("change", renderTasks);

    // Initial Render
    renderTasks();
});
