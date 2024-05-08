const boardContainer = document.getElementById("boardContainer");
const boardName = document.getElementById("boardName");
const todoContainer = document.querySelector(".todoContainer");
const doingContainer = document.querySelector(".doingContainer");
const doneContainer = document.querySelector(".doneContainer");
const createboardBtn = document.querySelector("#createBoardBtn");
const createboard = document.querySelector("#createboard");
const closeBoard = document.querySelector("#closeBoard");
const boardNameInput = document.querySelector("#boardNameInput");
const createBoardInputBtn = document.querySelector("#createBoardInputBtn");

let currentBoardId = null;
let selectedBoardElement = null;

createboardBtn.addEventListener("click", () => {
  createboard.classList.toggle("hid");
});

closeBoard.addEventListener("click", () => {
  createboard.classList.toggle("hid");
});

const addBoard = async () => {
  try {
    const board = {
      name: boardNameInput.value,
    };
    const token = localStorage.getItem("token");
    let url = "http://localhost:3000/board";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(board),
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
};
createBoardInputBtn.addEventListener("click", () => {
  addBoard();
  createboard.classList.toggle("hid");
  getBoards();
});

async function getBoards(boardId = null) {
  try {
    const token = localStorage.getItem("token");
    let url = "http://localhost:3000/board";
    if (boardId) {
      url += `/${boardId}`;
    }
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data);
    if (!boardId) {
      boardContainer.innerHTML = "";
      let count = 0;
      data.boards.forEach((board) => {
        const div = document.createElement("div");
        div.innerText = board.name;
        const i = document.createElement("span");
        i.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        div.append(i);
        div.className = "board";
        div.addEventListener("click", () => selectBoard(board._id, div));
        boardContainer.appendChild(div);
        if (count === 0) {
          selectBoard(board._id, div);
          count++;
        }
      });
    } else {
      todoContainer.innerHTML = "";
      doingContainer.innerHTML = "";
      doneContainer.innerHTML = "";
      appendData(data.tasks);
      if (currentBoardId !== boardId) {
        currentBoardId = boardId;
        boardName.innerText = data.name;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

getBoards();

function selectBoard(boardId, boardElement) {
  if (selectedBoardElement) {
    selectedBoardElement.classList.remove("selected");
  }
  currentBoardId = boardId;
  selectedBoardElement = boardElement;
  selectedBoardElement.classList.add("selected");
  getBoardDetails(boardId);
}

function appendData(tasks) {
  tasks.forEach((task) => {
    const taskDiv = document.createElement("div");

    const titleHeading = document.createElement("h3");
    titleHeading.innerText = task.title;
    taskDiv.appendChild(titleHeading);

    const subtaskCount = document.createElement("div");
    subtaskCount.innerText = ` ${task.subtasks.length} sub-tasks`;
    taskDiv.appendChild(subtaskCount);

    if (task.status === "Todo") {
      taskDiv.classList.add("todoItem");
      todoContainer.appendChild(taskDiv);
    } else if (task.status === "Doing") {
      taskDiv.classList.add("doItem");
      doingContainer.appendChild(taskDiv);
    } else if (task.status === "Done") {
      taskDiv.classList.add("doneItem");
      doneContainer.appendChild(taskDiv);
    }
  });
}

async function getBoardDetails(boardId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3000/board/${boardId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data.tasks);

    todoContainer.innerHTML = "";
    doingContainer.innerHTML = "";
    doneContainer.innerHTML = "";

    appendData(data.tasks);

    boardName.innerText = data.name;
  } catch (error) {
    console.error(error);
  }
}

