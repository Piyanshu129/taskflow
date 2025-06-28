document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) window.location.href = "index.html";

  document.getElementById("username").textContent = user.name;
  document.getElementById("avatar").src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(user.name)}`;

  const stages = {
    todo: [],
    completed: [],
    archived: [],
  };

  document.getElementById("search").addEventListener("input", (e) => {
    renderTasks(e.target.value.toLowerCase());
  });
  
  const tasks = JSON.parse(localStorage.getItem("tasks"));
  if (tasks) Object.assign(stages, tasks);
  else await loadDummyTodos();

  renderTasks();

  document.getElementById("signout").onclick = () => {
    localStorage.clear();
    window.location.href = "index.html";
  };

  document.getElementById("add-task").onclick = () => {
    const input = document.getElementById("task-input-field");
    const text = input.value.trim();
    if (!text) return;

    const newTask = {
      id: Date.now(),
      title: text,
      timestamp: new Date().toLocaleString(),
    };

    stages.todo.push(newTask);
    input.value = "";
    saveTasks();
    renderTasks();
  };

  function renderTasks(searchQuery = "") {
    ["todo", "completed", "archived"].forEach((stage) => {
      const list = document.getElementById(`${stage}-list`);
      const count = document.getElementById(`${stage}-count`);
      list.innerHTML = "";
      stages[stage].filter(task => task.title.toLowerCase().includes(searchQuery)).forEach((task) => {
        const div = document.createElement("div");
        div.className = "task-card";
        div.setAttribute("data-priority", task.priority || "normal");
        div.innerHTML = `
          <p>${task.title}</p>
          <small>Last updated: ${task.timestamp}</small>
          <div class="actions">${getActionButtons(stage, task.id)}</div>
        `;
        list.appendChild(div);
      });
      count.textContent = stages[stage].filter(task => task.title.toLowerCase().includes(searchQuery)).length;
    });
  
    document.querySelectorAll(".task-card button").forEach((btn) => {
      btn.addEventListener("click", () => handleAction(btn.dataset.action, btn.dataset.id));
    });
  }
  

  function getActionButtons(stage, id) {
    id = parseInt(id);
    if (stage === "todo") {
      return `<button data-action="complete" data-id="${id}">✅</button>
              <button data-action="archive" data-id="${id}">📦</button>`;
    } else if (stage === "completed") {
      return `<button data-action="undo" data-id="${id}">↩️</button>
              <button data-action="archive" data-id="${id}">📦</button>`;
    } else {
      return `<button data-action="restore-todo" data-id="${id}">↩️ Todo</button>
              <button data-action="restore-completed" data-id="${id}">✅</button>`;
    }
  }

  function handleAction(action, id) {
    id = parseInt(id);
    let task;
    if (["complete", "archive", "undo"].includes(action)) {
      task = stages.todo.find(t => t.id === id) || stages.completed.find(t => t.id === id);
    } else {
      task = stages.archived.find(t => t.id === id);
    }

    if (!task) return;

    if (action === "complete") moveTask(id, "todo", "completed");
    else if (action === "archive") moveTask(id, getCurrentStage(id), "archived");
    else if (action === "undo") moveTask(id, "completed", "todo");
    else if (action === "restore-todo") moveTask(id, "archived", "todo");
    else if (action === "restore-completed") moveTask(id, "archived", "completed");
  }

  function getCurrentStage(id) {
    if (stages.todo.some(t => t.id === id)) return "todo";
    if (stages.completed.some(t => t.id === id)) return "completed";
    return "archived";
  }

  function moveTask(id, from, to) {
    const idx = stages[from].findIndex(t => t.id === id);
    const task = stages[from].splice(idx, 1)[0];
    task.timestamp = new Date().toLocaleString();
    stages[to].push(task);
    saveTasks();
    renderTasks();
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(stages));
  }

  async function loadDummyTodos() {
    const res = await fetch("https://dummyjson.com/todos");
    const data = await res.json();
    stages.todo = data.todos.slice(0, 5).map((t) => ({
      id: Date.now() + Math.random(),
      title: t.todo,
      timestamp: new Date().toLocaleString(),
    }));
    saveTasks();
  }
});
document.getElementById("export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(stages)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "taskflow-backup.json";
  a.click();
});

document.getElementById("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    Object.assign(stages, data);
    saveTasks();
    renderTasks();
  };
  reader.readAsText(file);
});
document.getElementById("add-task").onclick = () => {
  const input = document.getElementById("task-input-field");
  const priority = document.getElementById("task-priority").value;
  const text = input.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    title: text,
    priority: priority, // ✅ include this
    timestamp: new Date().toLocaleString(),
  };

  stages.todo.push(newTask);
  input.value = "";
  saveTasks();
  renderTasks();
};

