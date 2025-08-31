// To‑Do app: localStorage CRUD, filters, sort, basic undo
(function(){
  const KEY = 'todo_tasks_v1';
  /** @typedef {{id:string,title:string,note:string,dueAt:string|null,today:boolean,done:boolean,createdAt:number}} Task */
  /** @type {Task[]} */
  let tasks = [];
  let filter = 'all'; // all | planned | today | done
  let sortBy = 'created'; // created | due
  let lastDeleted = null; // {task: Task, index: number}
  let undoTimer = null;

  const els = {
    form: document.getElementById('taskForm'),
    title: document.getElementById('title'),
    note: document.getElementById('note'),
    due: document.getElementById('due'),
    today: document.getElementById('today'),
    list: document.getElementById('taskList'),
    empty: document.getElementById('emptyState'),
    snackbar: document.getElementById('snackbar'),
    undo: document.getElementById('undoBtn'),
    sort: document.getElementById('sort'),
    exportBtn: document.getElementById('exportBtn'),
    importFile: document.getElementById('importFile'),
  };

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      tasks = raw ? JSON.parse(raw) : [];
    }catch{ tasks = []; }
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(tasks)); }

  function isFuture(iso){
    if(!iso) return true;
    return new Date(iso).getTime() > Date.now();
  }
  function formatDT(iso){
    if(!iso) return '';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  }

  function applyFilterAndSort(list){
    let out = list.slice();
    out = out.filter(t => {
      switch(filter){
        case 'planned': return !t.done && (!t.today);
        case 'today': return !t.done && (t.today || sameDay(t.dueAt, new Date()));
        case 'done': return t.done;
        default: return true;
      }
    });
    out.sort((a,b) => {
      if(sortBy === 'due'){
        const da = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
        const db = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
        return da - db || a.createdAt - b.createdAt;
      }
      return a.createdAt - b.createdAt;
    });
    return out;
  }

  function sameDay(isoOrDate, d){
    if(!isoOrDate) return false;
    const dt = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    return dt.getFullYear()===d.getFullYear() && dt.getMonth()===d.getMonth() && dt.getDate()===d.getDate();
  }

  function statusBadge(t){
    if(t.done) return '<span class="badge done">Splnené</span>';
    if(t.today || sameDay(t.dueAt, new Date())) return '<span class="badge today">Na dnes</span>';
    return '<span class="badge planned">Plánované</span>';
  }

  function render(){
    const data = applyFilterAndSort(tasks);
    els.empty.hidden = data.length !== 0;
    els.list.innerHTML = data.map(t => `
      <div class="task-card" role="listitem" data-id="${t.id}">
        <input type="checkbox" ${t.done?'checked':''} aria-label="Označiť ako splnené" />
        <div>
          <div><strong>${escapeHTML(t.title)}</strong></div>
          <div class="task-meta">
            ${statusBadge(t)}
            ${t.dueAt ? `<span title="Termín">⏰ ${escapeHTML(formatDT(t.dueAt))}</span>`:''}
            ${t.note ? `<span title="Poznámka">📝 ${escapeHTML(t.note)}</span>`:''}
          </div>
        </div>
        <div>
          <button class="btn small" data-action="delete" aria-label="Zmazať">Zmazať</button>
        </div>
      </div>
    `).join('');
  }

  function escapeHTML(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

  function addTask(e){
    e.preventDefault();
    const title = els.title.value.trim();
    const note = els.note.value.trim();
    const dueAt = els.due.value ? new Date(els.due.value).toISOString() : null;
    const today = els.today.checked;

    // Validation
    let valid = true;
    if(!title){
      els.title.setCustomValidity('Názov je povinný');
      els.title.reportValidity();
      valid = false;
    }else{
      els.title.setCustomValidity('');
    }
    if(dueAt && !isFuture(dueAt)){
      els.due.setCustomValidity('Termín musí byť v budúcnosti');
      els.due.reportValidity();
      valid = false;
    }else{
      els.due.setCustomValidity('');
    }
    if(!valid) return;

    const t = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random()), title, note, dueAt, today, done:false, createdAt: Date.now() };
    tasks.push(t);
    save();
    els.form.reset();
    render();
  }

  function onListClick(e){
    const card = e.target.closest('.task-card');
    if(!card) return;
    const id = card.getAttribute('data-id');
    if(e.target.matches('input[type="checkbox"]')){
      const t = tasks.find(x=>x.id===id); if(!t) return;
      t.done = e.target.checked;
      save();
      render();
    } else if(e.target.matches('[data-action="delete"]')){
      const idx = tasks.findIndex(x=>x.id===id); if(idx<0) return;
      lastDeleted = { task: tasks[idx], index: idx };
      tasks.splice(idx,1);
      save();
      render();
      showUndo();
    }
  }

  function showUndo(){
    els.snackbar.classList.add('show');
    clearTimeout(undoTimer);
    undoTimer = setTimeout(() => els.snackbar.classList.remove('show'), 4000);
  }
  function undo(){
    if(!lastDeleted) return;
    tasks.splice(lastDeleted.index,0,lastDeleted.task);
    lastDeleted = null;
    save();
    render();
    els.snackbar.classList.remove('show');
  }

  function setFilter(next){
    filter = next;
    document.querySelectorAll('.segmented button').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.filter===filter)));
    render();
  }

  function onFilterClick(e){
    const btn = e.target.closest('button[data-filter]');
    if(!btn) return;
    setFilter(btn.dataset.filter);
  }

  function onSortChange(){ sortBy = els.sort.value; render(); }

  function exportJSON(){
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'todo-backup.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function importJSON(ev){
    const file = ev.target.files && ev.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const json = JSON.parse(String(reader.result||'[]'));
        if(Array.isArray(json)){
          tasks = json.filter(x=>x && x.id && x.title);
          save();
          render();
        }
      }catch(err){ console.error('Import JSON zlyhal', err); }
    };
    reader.readAsText(file);
  }

  document.addEventListener('DOMContentLoaded', () => {
    load();
    render();
    els.form.addEventListener('submit', addTask);
    els.list.addEventListener('click', onListClick);
    document.querySelector('.segmented')?.addEventListener('click', onFilterClick);
    els.sort.addEventListener('change', onSortChange);
    els.exportBtn.addEventListener('click', exportJSON);
    els.importFile.addEventListener('change', importJSON);
    els.undo.addEventListener('click', undo);
  });
})();

