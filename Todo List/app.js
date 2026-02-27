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
    const dropList = document.getElementById('drop-list');
    const taskCount = document.getElementById('task-count');
    const categoryItems = document.getElementById('category-items'); 
    const descriptionInput = document.getElementById('description-input'); 
    const editDescription = document.getElementById('edit-description');
    const noTasksMessage = document.getElementById('no-tasks-message');
    const completedList = document.getElementById('completed-list');
    const completedCount = document.getElementById('completed-count');
    const modalOverlay = document.getElementById('modal-overlay');
    const editModal = document.getElementById('edit-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const editForm = document.getElementById('edit-form');
    const editTitle = document.getElementById('edit-title');
    const editCategory = document.getElementById('edit-category');
    const editPriority = document.getElementById('edit-priority');
    const editStart = document.getElementById('edit-start');
    const editEnd = document.getElementById('edit-end');
    const editCancel = document.getElementById('edit-cancel');
    const editSave = document.getElementById('edit-save');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    const toastEl = document.getElementById('toast');

    
    function updateTaskCount() {
        const total = taskList.children.length;
        taskCount.textContent = `Toplam Görev: ${total}`;
        if (noTasksMessage) noTasksMessage.style.display = total === 0 ? '' : 'none';
        
        if (completedCount) completedCount.textContent = `Tamamlanan: ${completedList ? completedList.children.length : 0}`;
    }

    const addStart = document.getElementById('due-date-input');
    const addEnd = document.getElementById('due-date-input-end');
    if (addStart && addEnd) {
        addStart.addEventListener('change', () => {
            addEnd.min = addStart.value || '';
        });
        addEnd.addEventListener('change', () => {
            addStart.max = addEnd.value || '';
        });
    }

    function updateCategoriesCount() {
        const total = categorySelect ? categorySelect.options.length : 0;
        if (noTasksMessage && taskList.children.length === 0) {
            noTasksMessage.style.display = '';
        }
        
    }

    function saveTasksToLocalStorage() {
        const active = Array.from(taskList.children).map(li => ({
            id: li.dataset.id,
            text: li.querySelector('.task-title').textContent,
            dateCreated: li.dataset.dateCreated,
            category: li.dataset.category || '',
            description: li.dataset.description || '',
            priority: li.dataset.priority || '',
            start: li.dataset.start || '',
            end: li.dataset.end || '',
            completed: li.classList.contains('completed')
        }));
        const completed = completedList ? Array.from(completedList.children).map(li => ({
            id: li.dataset.id,
            text: li.querySelector('.task-title').textContent,
            dateCreated: li.dataset.dateCreated,
            category: li.dataset.category || '',
            description: li.dataset.description || '',
            priority: li.dataset.priority || '',
            start: li.dataset.start || '',
            end: li.dataset.end || '',
            completed: true
        })) : [];
        localStorage.setItem('tasks', JSON.stringify(active.concat(completed)));
    }

    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(t => {
            const el = createTaskElement(t, false);
            if (t.completed && completedList) {
                
                taskList.removeChild(el);
                completedList.appendChild(el);
            }
        });
        updateTaskCount();
    }

    function showToast(message, timeout = 2500) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.style.display = '';
        clearTimeout(toastEl._hideTimeout);
        toastEl._hideTimeout = setTimeout(() => { toastEl.style.display = 'none'; }, timeout);
    }

    function showConfirm(message) {
        return new Promise(resolve => {
            if (!modalOverlay || !confirmModal) {
                resolve(window.confirm(message));
                return;
            }
            confirmMessage.textContent = message;
            modalOverlay.style.display = '';
            confirmModal.style.display = '';
            function cleanup() {
                confirmYes.removeEventListener('click', onYes);
                confirmNo.removeEventListener('click', onNo);
                modalOverlay.style.display = 'none';
                confirmModal.style.display = 'none';
            }
            function onYes() { cleanup(); resolve(true); }
            function onNo() { cleanup(); resolve(false); }
            confirmYes.addEventListener('click', onYes);
            confirmNo.addEventListener('click', onNo);
        });
    }

    let editingElement = null;
    function openEditModal(li) {
        if (!modalOverlay || !editModal) return;
        editingElement = li;
        editTitle.value = li.querySelector('.task-title').textContent;
        editCategory.value = li.dataset.category || '';
        editPriority.value = li.dataset.priority || '';
        editStart.value = li.dataset.start || '';
        editEnd.value = li.dataset.end || '';
        
        if (editStart && editEnd) {
            editStart.max = editEnd.value || '';
            editEnd.min = editStart.value || '';
        }
        modalOverlay.style.display = '';
        editModal.style.display = '';
        editTitle.focus();
    }

    function closeEditModal() {
        if (!modalOverlay || !editModal) return;
        modalOverlay.style.display = 'none';
        editModal.style.display = 'none';
        editingElement = null;
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
        const renderLi = (ul) => {
            if (!ul) return;
            const existsLi = Array.from(ul.children).some(ch => ch.dataset && ch.dataset.value === value);
            if (existsLi) return;
            const li = document.createElement('li');
            li.dataset.value = value;
            li.className = 'category-item';
            li.innerHTML = `<span class="cat-label">${escapeHtml(value)}</span> <button class="cat-delete" title="Kategoriyi Sil">×</button>`;
            ul.appendChild(li);
        };
        renderLi(categoryItems);
        renderLi(dropList);
        syncCategoriesToFilter();
    }
    function createTaskElement(data, save = true) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = data.id || Date.now().toString();
        li.dataset.dateCreated = data.dateCreated || new Date().toISOString();
        if (data.category) li.dataset.category = data.category;
        if (data.description) li.dataset.description = data.description;
        if (data.priority) li.dataset.priority = data.priority;
        if (data.start) li.dataset.start = data.start;
        if (data.end) li.dataset.end = data.end;

        if (data.completed) li.classList.add('completed');

    

      
    const priorityClass = data.priority ? `priority-${data.priority}` : '';
    const priorityMap = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
    const priorityText = data.priority ? (priorityMap[data.priority] || data.priority) : '';
    const timeText = (data.start || data.end) ? `${data.start || ''}${data.start && data.end ? ' → ' : ''}${data.end || ''}` : '';
    const actionsHtml = data.completed
        ? `<div class="task-actions"><button class="delete-btn" title="Sil">Sil</button></div>`
        : `<div class="task-actions"><button class="edit-btn" title="Düzenle">Düzenle</button><button class="delete-btn" title="Sil">Sil</button></div>`;
    li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" ${data.completed ? 'checked' : ''}>
            </div>
            <div class="task-main">
                <div class="task-head">
                    <span class="task-title">${escapeHtml(data.text || '')}</span>
                    <span class="priority-badge ${priorityClass}">${escapeHtml(priorityText)}</span>
                </div>
                ${data.description ? `<p class="task-desc">${escapeHtml(data.description)}</p>` : ''}
                <div class="task-meta">
                    <small class="task-category">${escapeHtml(data.category || '')}</small>
                    ${timeText ? `<small class="task-time">${escapeHtml(timeText)}</small>` : ''}
                </div>
            </div>
            ${actionsHtml}
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

        
        const exists = categorySelect && Array.from(categorySelect.options).some(o => o.value === value);
        if (categorySelect && !exists) {
            categorySelect.appendChild(new Option(value, value));
        }
        
        addCategoryValue(value);
        if (save) saveCategoriesToLocalStorage();   
        
        if (categoryItems) return Array.from(categoryItems.children).find(li => li.dataset.value === value);
        return null;
    }


    if (editStart && editEnd) {
        editStart.addEventListener('change', () => { editEnd.min = editStart.value || ''; });
        editEnd.addEventListener('change', () => { editStart.max = editEnd.value || ''; });
    }
    if (editCancel) editCancel.addEventListener('click', (e) => { e.preventDefault(); closeEditModal(); });
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!editingElement) return closeEditModal();
            const newTitle = (editTitle.value || '').trim();
            const newDescription = (editDescription?.value || '').trim();
            const newCategory = (editCategory.value || '').trim();
            const newPriority = editPriority.value || '';
            const newStart = editStart.value || '';
            const newEnd = editEnd.value || '';
            if (!newTitle) { showToast('Başlık boş olamaz.'); return; }
            if (newStart && newEnd && newEnd < newStart) { showToast('Bitiş tarihi, başlangıç tarihinden önce olamaz.'); return; }
            
            if (newDescription) editingElement.dataset.description = newDescription; else delete editingElement.dataset.description;
            editingElement.dataset.category = newCategory;
            editingElement.dataset.priority = newPriority;
            if (newStart) editingElement.dataset.start = newStart; else delete editingElement.dataset.start;
            if (newEnd) editingElement.dataset.end = newEnd; else delete editingElement.dataset.end;
        
            const titleEl = editingElement.querySelector('.task-title');
            if (titleEl) titleEl.textContent = newTitle;
            
            const descEl = editingElement.querySelector('.task-desc');
            if (descEl) {
                if (newDescription) descEl.textContent = newDescription; else descEl.remove();
            } else if (newDescription) {
                const head = editingElement.querySelector('.task-head');
                if (head) head.insertAdjacentHTML('afterend', `<p class="task-desc">${escapeHtml(newDescription)}</p>`);
            }
            
            const catEl = editingElement.querySelector('.task-category');
            if (catEl) catEl.textContent = newCategory;
        
            const timeEl = editingElement.querySelector('.task-time');
            const timeText = (newStart || newEnd) ? `${newStart || ''}${newStart && newEnd ? ' → ' : ''}${newEnd || ''}` : '';
            if (timeEl) {
                if (timeText) timeEl.textContent = timeText; else timeEl.remove();
            } else if (timeText) {
                const meta = editingElement.querySelector('.task-meta');
                if (meta) meta.insertAdjacentHTML('beforeend', `<small class="task-time">${escapeHtml(timeText)}</small>`);
            }
            
            const badge = editingElement.querySelector('.priority-badge');
            const priorityMap = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
            if (badge) {
                
                badge.className = 'priority-badge';
                if (newPriority) badge.classList.add(`priority-${newPriority}`);
                badge.textContent = priorityMap[newPriority] || newPriority || '';
            }
            
            if (newCategory) addCategoryValue(newCategory);
            saveTasksToLocalStorage();
            closeEditModal();
            showToast('Görev güncellendi.');
        });
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
                saveCategoriesToLocalStorage();
                updateCategoriesCount();
            }
        });
    }

    const selectedCategoryBadge = document.getElementById('selected-category-badge');
    function updateSelectedCategoryBadge() {
        if (!selectedCategoryBadge) return;
        const val = (categorySelect && categorySelect.value) || (categoryInput && categoryInput.value) || '';
        selectedCategoryBadge.textContent = val ? val : '';
        selectedCategoryBadge.title = val ? `Seçili kategori: ${val}` : 'Kategori seçili değil';
        selectedCategoryBadge.style.display = selectedCategoryBadge.textContent ? 'inline-flex' : 'none';
    }
    updateSelectedCategoryBadge();
    if (categorySelect) categorySelect.addEventListener('change', updateSelectedCategoryBadge);
    if (categoryInput) categoryInput.addEventListener('input', updateSelectedCategoryBadge);



    

    if (addTaskForm) {
        addTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = (taskInput?.value || '').trim();
            const selectedCategory = (categorySelect?.value) || (categoryInput?.value || '').trim() || '';
            const description = (descriptionInput?.value || '').trim();
            const priority = document.getElementById('priority-select')?.value || '';
            const start = document.getElementById('due-date-input')?.value || '';
            const end = document.getElementById('due-date-input-end')?.value || '';
            if (!text) return;
            
            if (start && end && end < start) {
                showToast('Bitiş tarihi, başlangıç tarihinden önce olamaz.');
                return;
            }
            addCategoryValue(selectedCategory);
            createTaskElement({ text, category: selectedCategory, description, priority, start, end });
            if (taskInput) taskInput.value = '';
            if (descriptionInput) descriptionInput.value = '';
            updateSelectedCategoryBadge();
        });
    }

    
    taskList.addEventListener('click', async (e) => {
        const li = e.target.closest('li');
        if (!li) return;
            if (e.target.classList.contains('task-checkbox')) {
                if (e.target.checked) {
                    li.classList.add('completed');
                    if (completedList) completedList.appendChild(li);
                    const editBtn = li.querySelector('.edit-btn');
                    if (editBtn) editBtn.remove();
                } else {
                    li.classList.remove('completed');
                    taskList.appendChild(li);
                    const actions = li.querySelector('.task-actions');
                    if (actions) {
                        if (!actions.querySelector('.edit-btn')) {
                            const edit = document.createElement('button');
                            edit.className = 'edit-btn';
                            edit.title = 'Düzenle';
                            edit.textContent = 'Düzenle';
                            actions.insertBefore(edit, actions.firstChild);
                        }
                    }
                }
            saveTasksToLocalStorage();
            updateTaskCount();
            return;
        }
        if (e.target.classList.contains('edit-btn')) {
            openEditModal(li);
            return;
        }
        if (e.target.classList.contains('delete-btn')) {
            const ok = await showConfirm('Bu görevi silmek istediğinize emin misiniz?');
            if (ok) {
                li.remove();
                saveTasksToLocalStorage();
                updateTaskCount();
                showToast('Görev silindi.');
            }
            return;
        }
    });

    taskList.addEventListener('dblclick', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
    
        openEditModal(li);
    });

    if (completedList) {
        completedList.addEventListener('click', async (e) => {
            const li = e.target.closest('li');
            if (!li) return;
            if (e.target.classList.contains('task-checkbox')) {
                if (!e.target.checked) {
                    li.classList.remove('completed');
                    if (taskList) taskList.appendChild(li);
                    const actions = li.querySelector('.task-actions');
                    if (actions) {
                        if (!actions.querySelector('.edit-btn')) {
                            const edit = document.createElement('button');
                            edit.className = 'edit-btn';
                            edit.title = 'Düzenle';
                            edit.textContent = 'Düzenle';
                            actions.insertBefore(edit, actions.firstChild);
                        }
                    }
                    saveTasksToLocalStorage();
                    updateTaskCount();
                }
                return;
            }
            if (e.target.classList.contains('edit-btn')) {
                showToast('Tamamlanmış görevler düzenlenemez.');
                return;
            }
            if (e.target.classList.contains('delete-btn')) {
                const ok = await showConfirm('Bu görevi silmek istediğinize emin misiniz?');
                if (ok) {
                    li.remove();
                    saveTasksToLocalStorage();
                    updateTaskCount();
                    showToast('Görev silindi.');
                }
                return;
            }
        });

        completedList.addEventListener('dblclick', (e) => {
            const li = e.target.closest('li');
            if (!li) return;
            showToast('Tamamlanmış görevler düzenlenemez.');
        });

        completedList.addEventListener('contextmenu', async (e) => {
            const li = e.target.closest('li');
            if (!li) return;
            e.preventDefault();
            const ok = await showConfirm('Bu görevi silmek istediğinize emin misiniz?');
            if (ok) {
                li.remove();
                saveTasksToLocalStorage();
                updateTaskCount();
                showToast('Görev silindi.');
            }
        });
    }

    taskList.addEventListener('contextmenu', async (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        e.preventDefault();
        const ok = await showConfirm('Bu görevi silmek istediğinize emin misiniz?');
        if (ok) {
            li.remove();
            saveTasksToLocalStorage();
            updateTaskCount();
            showToast('Görev silindi.');
        }
    });

    if (clearButton) {
        clearButton.addEventListener('click', async () => {
            const ok = await showConfirm('Tüm görevleri temizlemek istediğinize emin misiniz?');
            if (ok) {
                taskList.innerHTML = '';
                if (completedList) completedList.innerHTML = '';
                saveTasksToLocalStorage();
                updateTaskCount();
                showToast('Tüm görevler temizlendi.');
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
            const lists = [taskList, completedList].filter(Boolean);
            lists.forEach(list => Array.from(list.children).forEach(li => {
                const matchCat = !val || val === 'all' || (li.dataset.category === val);
                li.style.display = matchCat ? '' : 'none';
            }));
        });
    }

   
    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            const val = filterStatus.value;
            const lists = [taskList, completedList].filter(Boolean);
            lists.forEach(list => Array.from(list.children).forEach(li => {
                const isCompleted = li.classList.contains('completed');
                if (val === 'all') li.style.display = '';
                else if (val === 'active') li.style.display = isCompleted ? 'none' : '';
                else if (val === 'completed') li.style.display = isCompleted ? '' : 'none';
            }));
        });
    }

    const filterDate = document.getElementById('filter-date');
    function getCompareDate(li) {
        return li.dataset.end || li.dataset.start || '';
    }
    function compareToToday(dateStr) {
        if (!dateStr) return null;
        const today = new Date();
        const d = new Date(dateStr + 'T00:00:00');
        const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (d < t0) return -1;
        if (d > t0) return 1;
        return 0;
    }
    if (filterDate) {
        filterDate.addEventListener('change', () => {
            const val = filterDate.value;
            const lists = [taskList, completedList].filter(Boolean);
            lists.forEach(list => Array.from(list.children).forEach(li => {
                const cmp = compareToToday(getCompareDate(li));
                let show = true;
                if (val === 'overdue') show = cmp === -1;
                else if (val === 'today') show = cmp === 0;
                else if (val === 'upcoming') show = cmp === 1;
                li.style.display = show ? '' : 'none';
            }));
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
                const val = e.target.dataset.value || e.target.textContent;
                if (filterCategory) {
                    filterCategory.value = val;
                    filterCategory.dispatchEvent(new Event('change'));
                }
                if (categoryInput) categoryInput.value = val;
                if (categorySelect) {
                    const opt = Array.from(categorySelect.options).find(o => o.value === val);
                    if (opt) categorySelect.value = val;
                }
                if (categoryItems) Array.from(categoryItems.children).forEach(li => li.classList.toggle('selected-category', li.dataset.value === val));
                if (typeof updateSelectedCategoryBadge === 'function') updateSelectedCategoryBadge();
            }
        });
    }

    
    if (categoryItems) {
        categoryItems.addEventListener('click', async (e) => {
            const li = e.target.closest('li');
            if (!li) return;

            if (e.target.classList.contains('cat-label')) {
                const val = li.dataset.value || '';
                if (categoryInput) categoryInput.value = val;
                if (categorySelect) {
                    const opt = Array.from(categorySelect.options).find(o => o.value === val);
                    if (opt) categorySelect.value = val;
                }
                Array.from(categoryItems.children).forEach(ch => ch.classList.toggle('selected-category', ch === li));
                if (filterCategory) {
                    filterCategory.value = val;
                    filterCategory.dispatchEvent(new Event('change'));
                }
                if (typeof updateSelectedCategoryBadge === 'function') updateSelectedCategoryBadge();
            } 
            
            if (e.target.classList.contains('cat-delete')) {
                const value = li.dataset.value;
                const ok = await showConfirm(`"${value}" kategorisini silmek istediğinize emin misiniz?`);
                if (!ok) return;
                
                li.remove();
                if (dropList) Array.from(dropList.children).filter(x => x.dataset && x.dataset.value === value).forEach(x => x.remove());
                
                if (categorySelect) Array.from(categorySelect.options).forEach(opt => { if (opt.value === value) opt.remove(); });
                if (filterCategory) Array.from(filterCategory.options).forEach(opt => { if (opt.value === value) opt.remove(); });
                
                [taskList, completedList].filter(Boolean).forEach(list => Array.from(list.children).forEach(taskLi => {
                    if (taskLi.dataset.category === value) {
                        delete taskLi.dataset.category;
                        const catEl = taskLi.querySelector('.task-category'); if (catEl) catEl.textContent = '';
                    }
                }));
                saveCategoriesToLocalStorage();
                saveTasksToLocalStorage();
                showToast('Kategori silindi.');
            } else {
                const val = li.dataset.value || '';
                if (categoryInput) categoryInput.value = val;
                if (categorySelect) {
                    const opt = Array.from(categorySelect.options).find(o => o.value === val);
                    if (opt) categorySelect.value = val;
                }
                Array.from(categoryItems.children).forEach(ch => ch.classList.toggle('selected-category', ch === li));
                if (filterCategory) {
                    filterCategory.value = val;
                    filterCategory.dispatchEvent(new Event('change'));
                }
                if (typeof updateSelectedCategoryBadge === 'function') updateSelectedCategoryBadge();
            }
        });
    }    
    updateTaskCount();
    loadCategoriesFromLocalStorage();
    syncCategoriesToFilter();
    loadTasksFromLocalStorage();
    updateCategoriesCount();
});








