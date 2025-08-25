// nájdeme input pole
const input = document.getElementById("taskInput");
// tlačidlo Pridať
const addBtn = document.getElementById("addBtn");
// UL zoznam úloh
const list = document.getElementById("taskList");
// tlačidlo Vymazať označené
const deleteBtn = document.getElementById("deleteBtn");
// tlačidlo Označiť ako hotové
const completeBtn = document.getElementById("completeBtn");

// funkcia na pridanie novej úlohy
function addTask() {
  const text = input.value.trim();
  if (text === "") return;

  const li = document.createElement("li");
  li.textContent = text;

  // kliknutím na úlohu sa pridá/odoberie trieda .active
  li.addEventListener("click", () => {
    li.classList.toggle("active");
  });

  list.appendChild(li);
  input.value = "";
  input.focus();
}

// po kliknutí na tlačidlo Pridať
addBtn.addEventListener("click", addTask);

// aj kláves Enter pridá úlohu
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

// Vymazať označené = odstráni úlohy, ktoré majú class .active
deleteBtn.addEventListener("click", () => {
  const items = list.querySelectorAll("li.active");
  items.forEach(item => item.remove());
});

// Označiť ako hotové = pridá class .done úlohám s class .active
completeBtn.addEventListener("click", () => {
  const items = list.querySelectorAll("li.active");
  items.forEach(item => {
    item.classList.add("done");
    item.classList.remove("active"); // už nie je len označená, ale hotová
  });
});
