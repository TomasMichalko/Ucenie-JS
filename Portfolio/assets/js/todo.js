// To‑Do app: localStorage CRUD, filters (all/active/done), date range, sort by date/priority, undo
(function(){
  const KEY = 'todo_tasks_v1';
  /** @typedef {{id:string,title:string,note:string,priority:'low'|'medium'|'high',done:boolean,createdAt:number}} Task */
  /** @type {Task[]} */
  let tasks = [];
  let filter = 'all'; // all | active | done
  let lastDeleted = null; // {task: Task, index: number}
  let undoTimer = null;

  const els = {
    form: document.getElementById('taskForm'),
    title: document.getElementById('title'),
    note: document.getElementById('note'),
    list: document.getElementById('taskList'),
    empty: document.getElementById('emptyState'),
    snackbar: document.getElementById('snackbar'),
    undo: document.getElementById('undoBtn'),
    exportBtn: document.getElementById('exportBtn'),
    importFile: document.getElementById('importFile'),
    from: document.getElementById('fromDate'),
    to: document.getElementById('toDate'),
    sort: document.getElementById('sort'),
  };

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      tasks = Array.isArray(arr) ? arr.map(t => ({
        id: t.id,
        title: t.title,
        note: t.note || '',
        priority: (t.priority==='low'||t.priority==='high'||t.priority==='medium') ? t.priority : 'medium',
        done: !!t.done,
        createdAt: t.createdAt || Date.now()
      })) : [];
    }catch{ tasks = []; }
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(tasks)); }

  function formatCreated(ts){ try{ return new Date(ts).toLocaleString(); } catch { return String(ts); } }

  function applyFilterAndSort(list){
    let out = list.slice();
    out = out.filter(t => filter === 'done' ? t.done : (filter === 'active' ? !t.done : true));
    const fromVal = els.from && els.from.value ? new Date(els.from.value+'T00:00:00').getTime() : -Infinity;
    const toVal = els.to && els.to.value ? new Date(els.to.value+'T23:59:59.999').getTime() : Infinity;
    out = out.filter(t => t.createdAt >= fromVal && t.createdAt <= toVal);
    const sortBy = els.sort ? els.sort.value : 'created';
    if(sortBy === 'priority'){
      const rank = {high:0, medium:1, low:2};
      out.sort((a,b) => (rank[a.priority]-rank[b.priority]) || (a.createdAt - b.createdAt));
    }else{
      out.sort((a,b) => a.createdAt - b.createdAt);
    }
    return out;
  }

  function newestActiveId(){
    let id = null, ts = -Infinity;
    for(const t of tasks){ if(!t.done && t.createdAt > ts){ ts = t.createdAt; id = t.id; } }
    return id;
  }

  function statusBadge(t, newestId){
    if(t.done) return '<span class="badge done">Splnené</span>';
    if(newestId && t.id === newestId) return '<span class="badge today">Nové</span>';
    return '<span class="badge planned">Nesplnené</span>';
  }

  function render(){
    const data = applyFilterAndSort(tasks);
    const newestId = newestActiveId();
    els.empty.hidden = data.length !== 0;
    els.list.innerHTML = data.map(t => `
      <div class="task-card" role="listitem" data-id="${t.id}">
        <div class="priority-tag priority-${t.priority}">Priorita: ${t.priority==='high'?'Vysoká':(t.priority==='low'?'Nízka':'Stredná')}</div>
        <div>
          <div><strong>${escapeHTML(t.title)}</strong></div>
          <div class="task-meta">
            ${statusBadge(t, newestId)}
            <span title="Vytvorené">⏱️ ${escapeHTML(formatCreated(t.createdAt))}</span>
            ${t.note ? `<span title="Poznámka">📝 ${escapeHTML(t.note)}</span>`:''}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn small" data-action="toggle" aria-label="Označiť ako ${t.done?'nesplnené':'splnené'}">${t.done ? 'Označiť ako nesplnené' : 'Označiť ako splnené'}</button>
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
    if(!title){
      els.title.setCustomValidity('Názov je povinný');
      els.title.reportValidity();
      return;
    }else{ els.title.setCustomValidity(''); }
    const prio = (document.querySelector('input[name="priority"]:checked')?.value)||'medium';
    const t = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random()), title, note, priority: prio, done:false, createdAt: Date.now() };
    tasks.push(t);
    save();
    els.form.reset();
    render();
  }

  function onListClick(e){
    const card = e.target.closest('.task-card');
    if(!card) return;
    const id = card.getAttribute('data-id');
    if(e.target.matches('[data-action="toggle"]')){
      const t = tasks.find(x=>x.id===id); if(!t) return;
      t.done = !t.done;
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
    els.from?.addEventListener('change', () => render());
    els.to?.addEventListener('change', () => render());
    els.sort?.addEventListener('change', () => render());
    els.exportBtn.addEventListener('click', exportJSON);
    els.importFile.addEventListener('change', importJSON);
    els.undo.addEventListener('click', undo);
  });
})();

