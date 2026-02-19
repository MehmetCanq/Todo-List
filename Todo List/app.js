document.addEventListener('DOMContentLoaded', () => {
    
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const addTaskForm = document.getElementById('add-task-form');
    const taskList = document.getElementById('task-list');
    const sortSelect = document.getElementById('sort-by');
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
    const searchInput = document.getElementById('search-input');
    const clearButton = document.getElementById('clear-button');
    const categorySelect = document.getElementById('category-list'); 
    const categoryInput = document.getElementById('category-input');
    const addCategoryButton = document.getElementById('add-category-button');
    const quickAddButton = document.getElementById('quick-add');
    const dropList = document.getElementById('drop-list');
    const taskCount = document.getElementById('task-count');
    const noTasksMessage = document.getElementById('no-tasks-message');

    
    function updateTaskCount() {
        const total = taskList.children.length;
        taskCount.textContent = `Toplam Görev: ${total}`;
        if (noTasksMessage) noTasksMessage.style.display = total === 0 ? '' : 'none';
    }

    function updateCategoriesCount() {
        const total = categorySelect ? categorySelect.options.length : 0;
        if (noTasksMessage && taskList.children.length === 0) {
            noTasksMessage.style.display = '';
        }
        
    }

    function saveTasksToLocalStorage() {
        const tasks = Array.from(taskList.children).map(li => ({
            id: li.dataset.id,
            text: li.querySelector('.task-title').textContent,
            dateCreated: li.dataset.dateCreated,
            category: li.dataset.category || '',
            priority: li.dataset.priority || '',
            start: li.dataset.start || '',
            end: li.dataset.end || '',
            completed: li.classList.contains('completed')
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(t => createTaskElement(t, false));
        updateTaskCount();
    }

    function loadCategoriesFromLocalStorage() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        categories.forEach(cat => createCategoryElement(cat , false));
        updateCategoriesCount();   
    }


    function syncCategoriesToFilter() {
        if (!filterCategory || !categorySelect) return;
        const existing = Array.from(filterCategory.options).map(o => o.value);
        Array.from(categorySelect.options).forEach(opt => {
            if (!existing.includes(opt.value)) {
                const newOpt = document.createElement('option');
                newOpt.value = opt.value;
                newOpt.textContent = opt.textContent;
                filterCategory.appendChild(newOpt);
            }
        });
    }

    function addCategoryValue(value) {
        value = (value || '').trim();
        if (!value) return;
        const exists = categorySelect && Array.from(categorySelect.options).some(o => o.value === value);
        if (categorySelect && !exists) {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = value;
            categorySelect.appendChild(opt);
        }
        
        if (dropList) {
            const li = document.createElement('li');
            li.textContent = value;
            dropList.appendChild(li);
        }
        syncCategoriesToFilter();
    }

    function createTaskElement(data, save = true) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = data.id || Date.now().toString();
        li.dataset.dateCreated = data.dateCreated || new Date().toISOString();
        if (data.category) li.dataset.category = data.category;
        if (data.priority) li.dataset.priority = data.priority;
        if (data.start) li.dataset.start = data.start;
        if (data.end) li.dataset.end = data.end;

        if (data.completed) li.classList.add('completed');

    

      
    const priorityClass = data.priority ? `priority-${data.priority}` : '';
    const priorityMap = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
    const priorityText = data.priority ? (priorityMap[data.priority] || data.priority) : '';
    const timeText = (data.start || data.end) ? `${data.start || ''}${data.start && data.end ? ' → ' : ''}${data.end || ''}` : '';
    li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" ${data.completed ? 'checked' : ''}>
            </div>
            <div class="task-main">
                <div class="task-head">
                    <span class="task-title">${escapeHtml(data.text || '')}</span>
                    <span class="priority-badge ${priorityClass}">${escapeHtml(priorityText)}</span>
                </div>
                <div class="task-meta">
                    <small class="task-category">${escapeHtml(data.category || '')}</small>
                    ${timeText ? `<small class="task-time">${escapeHtml(timeText)}</small>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" title="Düzenle">Düzenle</button>
                <button class="delete-btn" title="Sil">Sil</button>
            </div>
        `;

        taskList.appendChild(li);
        updateTaskCount();
        if (save) saveTasksToLocalStorage();
        return li;
    }


     function saveCategoriesToLocalStorage() {
                localStorage.setItem('categories', JSON.stringify(Array.from(categorySelect.options).map(o => o.value)));
           }

    function createCategoryElement(value, save = true) {
        value = (value || '').trim();
        if (!value) return;

        const li = document.createElement('li');
        li.textContent = value;
        dropList.appendChild(li);

        const exists = categorySelect && Array.from(categorySelect.options).some(o => o.value === value);
        if (categorySelect && !exists) {
            
            categorySelect.appendChild(new Option(value, value)); 
        }
        
        if (save) saveCategoriesToLocalStorage();   
        return li;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

  
    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', () => {
            const val = categoryInput.value.trim();
            if (val) {
                addCategoryValue(val);
                categoryInput.value = '';
                saveTasksToLocalStorage();
                saveCategoriesToLocalStorage();
                updateCategoriesCount();
                
                
            }
        });
    }

    if (quickAddButton) {
        quickAddButton.addEventListener('click', (e) => {
            e.preventDefault();
            const text = prompt('Hızlı Görev Ekle:');
            if (text && text.trim()) createTaskElement({ text: text.trim() });
        });
    }

    if (addTaskForm) {
        addTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = (taskInput?.value || '').trim();
            const selectedCategory = (categorySelect?.value) || (categoryInput?.value || '').trim() || '';
            const priority = document.getElementById('priority-select')?.value || '';
            const start = document.getElementById('due-date-input')?.value || '';
            const end = document.getElementById('due-date-input-end')?.value || '';
            if (!text) return;
            addCategoryValue(selectedCategory);
            createTaskElement({ text, category: selectedCategory, priority, start, end });
            if (taskInput) taskInput.value = '';
        });
    }

    
    taskList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        if (e.target.classList.contains('task-checkbox')) {
            if (e.target.checked) li.classList.add('completed'); else li.classList.remove('completed');
            saveTasksToLocalStorage();
            updateTaskCount();
            return;
        }
        if (e.target.classList.contains('edit-btn')) {
            const current = li.querySelector('.task-title').textContent;
            const newText = prompt('Görev metnini düzenleyin:', current);
            if (newText !== null) {
                li.querySelector('.task-title').textContent = newText.trim();
                saveTasksToLocalStorage();
            }
            return;
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
                li.remove();
                saveTasksToLocalStorage();
                updateTaskCount();
            }
            return;
        }
    });

    taskList.addEventListener('dblclick', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        const titleEl = li.querySelector('.task-title');
        if (!titleEl) return;
        const newText = prompt('Görev metnini düzenleyin:', titleEl.textContent);
        if (newText !== null) {
            titleEl.textContent = newText.trim();
            saveTasksToLocalStorage();
        }
    });

    taskList.addEventListener('contextmenu', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        e.preventDefault();
        if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
            li.remove();
            saveTasksToLocalStorage();
            updateTaskCount();
        }
    });

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm('Tüm görevleri temizlemek istediğinize emin misiniz?')) {
                taskList.innerHTML = '';
                saveTasksToLocalStorage();
                updateTaskCount();
            }
        });
    }

    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.trim().toLowerCase();
            Array.from(taskList.children).forEach(li => {
                const txt = (li.querySelector('.task-title')?.textContent || '').toLowerCase();
                li.style.display = txt.includes(term) ? '' : 'none';
            });
        });
    }

    
    if (filterCategory) {
        filterCategory.addEventListener('change', () => {
            const val = filterCategory.value;
            Array.from(taskList.children).forEach(li => {
                const matchCat = !val || val === 'all' || (li.dataset.category === val);
                li.style.display = matchCat ? '' : 'none';
            });
        });
    }

   
    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            const val = filterStatus.value;
            Array.from(taskList.children).forEach(li => {
                const isCompleted = li.classList.contains('completed');
                if (val === 'all') li.style.display = '';
                else if (val === 'active') li.style.display = isCompleted ? 'none' : '';
                else if (val === 'completed') li.style.display = isCompleted ? '' : 'none';
            });
        });
    }

   
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const val = sortSelect.value;
            const items = Array.from(taskList.children);
            items.sort((a, b) => {
                if (val === 'name-asc') return a.querySelector('.task-title').textContent.localeCompare(b.querySelector('.task-title').textContent);
                if (val === 'name-desc') return b.querySelector('.task-title').textContent.localeCompare(a.querySelector('.task-title').textContent);
                if (val === 'date-asc') return new Date(a.dataset.dateCreated) - new Date(b.dataset.dateCreated);
                if (val === 'date-desc') return new Date(b.dataset.dateCreated) - new Date(a.dataset.dateCreated);
                return 0;
            });
            taskList.innerHTML = '';
            items.forEach(i => taskList.appendChild(i));
        });
    }

   
    if (dropList) {
        dropList.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                filterCategory.value = e.target.textContent;
                filterCategory.dispatchEvent(new Event('change'));
            }
        });
    }

    
    
   
    updateTaskCount();
    loadCategoriesFromLocalStorage();
    syncCategoriesToFilter();
    loadTasksFromLocalStorage();
    updateCategoriesCount();
});








