const footerYear = document.getElementById("year").innerHTML = new Date().getFullYear();
const showTasks = document.getElementById("tasks");
const showCompletes = document.getElementById("done");
const showDeletes = document.getElementById("bin");
const themeToggle = document.getElementById("theme-toggle");

const taskDiv = document.querySelector(".pending");
const completeDiv = document.querySelector(".completed");
const binDiv = document.querySelector(".deleted");
const addButton = document.getElementById("add");
const taskLists = document.getElementsByClassName("task_list");
const body = document.body;

const showDiv = (show) => {
    taskDiv.style.display = "none";
    completeDiv.style.display = "none";
    binDiv.style.display = "none";

    show.style.display = "block";
    addButton.style.display = show === taskDiv ? "block" : "none";
};

const createTaskElement = () => {
    const task = document.createElement("li");
    const taskItem = document.createElement("div");
    taskItem.classList.add("task_item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "check";

    const span = document.createElement("span");
    span.classList.add("task");

    const taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.name = "task";
    taskInput.classList.add("task-input");  // Check if this class name is of value and does anything

    const binButton = document.createElement("button");
    binButton.type = "button";  //Is it necessary to add the button type, why not just leave it as is
    binButton.classList.add("bin");
    binButton.innerHTML = '<img src="media/close.png" alt="Delete">';

    span.appendChild(taskInput);
    taskItem.appendChild(checkbox);
    taskItem.appendChild(span);
    taskItem.appendChild(binButton);
    task.appendChild(taskItem);

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            taskLists[1].appendChild(task);
        } else {
            taskLists[0].appendChild(task);
        }
        saveTasks();
    });

    binButton.addEventListener("click", () => {
        if (task.parentElement === taskLists[2]) {
            checkbox.checked = false;
            binButton.innerHTML = '<img src="media/close.png" alt="Delete">';
            taskLists[0].appendChild(task);
        } else {
            taskLists[2].appendChild(task);
            binButton.innerHTML = '<img src="media/restore.png" alt="restore">';
        }
        saveTasks();
    });

    taskInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            taskInput.blur();
        }
        saveTasks();
    });

    taskInput.addEventListener("blur", () => {
        if (!taskInput.value.trim()) {
            task.remove();
        }
    });

    return task;
};
const addTask = () => {
    const task = createTaskElement();
    taskLists[0].appendChild(task);
    task.querySelector(".task-input").focus();
    saveTasks();
};
const toggleTheme = () => {
    const isDark = body.dataset.theme === "dark";
    if (isDark) {
        body.removeAttribute("data-theme");
        themeToggle.textContent = "🌙";
    } else {
        body.dataset.theme = "dark";
        themeToggle.textContent = "☀️";
    }
};
const saveTasks = () => {
    const tasksData = Array.from(taskLists).map(list =>
        Array.from(list.children).map(task => {
            return {
                text: task.querySelector(".task-input").value,
                checked: task.querySelector("input[type='checkbox']").checked,
                listIndex: Array.from(taskLists).indexOf(list)
            };
        })
    );
    localStorage.setItem("tasks", JSON.stringify(tasksData));
};
const loadTasks = () => {
    const tasksData = JSON.parse(localStorage.getItem("tasks")) || [];
    tasksData.forEach((list, listIndex) => {
        list.forEach(taskObj => {
            const task = createTaskElement();
            task.querySelector(".task-input").value = taskObj.text;
            task.querySelector("input[type='checkbox']").checked = taskObj.checked;
            taskLists[listIndex].appendChild(task);
        });
    });
};


addButton.addEventListener("click", addTask);
themeToggle.addEventListener("click", toggleTheme);

showTasks.addEventListener("click", () => showDiv(taskDiv));
showCompletes.addEventListener("click", () => showDiv(completeDiv));
showDeletes.addEventListener("click", () => showDiv(binDiv));

showDiv(taskDiv);
loadTasks();
// For the theme toggle attribute, is it default to use the data-theme attribute to switch meaning the media query is not needed or its the automatic side and the attribute is the manual