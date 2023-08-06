function Gameboard() {
  const rows = 6;
  const columns = 7;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      const cell = Cell();
      cell.setCoords(i, j);
      board[i].push(cell);
    }
  }

  const getDimensions = () => { return { rows, columns } };

  const getBoard = () => board;

  const dropToken = (column, player) => {
    const availableCells = board.filter((row) => row[column].getValue() === 0).map(row => row[column]);

    if (!availableCells.length) return -1;

    const lowestRow = availableCells.length - 1;
    board[lowestRow][column].addToken(player);

  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
    console.log(boardWithCellValues);
  };

  return { getBoard, dropToken, printBoard, getDimensions };
}

function Cell() {
  let value = 0;
  const coords = { row: 0, col: 0 };

  const setCoords = (row, col) => {
    coords.row = row;
    coords.col = col;
  }
  const getCoords = () => coords;

  const addToken = (player) => {
    value = player;
  };

  const getValue = () => value;

  return {
    addToken,
    getValue,
    setCoords,
    getCoords
  };
}

function GameController(playerOneName = "Player One", playerTwoName = "Player Two") {

  const board = Gameboard();


  const players = [{ name: playerOneName, token: 1 }, { name: playerTwoName, token: 2 }];

  let activePlayer = players[0];

  const getActivePlayer = () => activePlayer;

  const getPlayers = () => players;

  const switchPlayerTurn = () => { activePlayer = activePlayer === players[0] ? players[1] : players[0]; };

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const { rows, columns } = board.getDimensions();
  const maxMoveNum = rows * columns;
  let currentMoveNum = 0;
  let isGameOver = false;

  const boardArr = board.getBoard();
  const rightBoundary = boardArr[0].length - 1;
  const bottomBoundary = boardArr.length - 1;

  const allEqual = arr => arr.every(val => val.getValue() === arr[0].getValue());
  const hasEmptyCell = arr => arr.some(val => val.getValue() === 0);
  const identifyPlayer = arr => players[0].token === arr[0].getValue() ? players[0].name : players[1].name;
  const isWinner = arr => !hasEmptyCell(arr) && allEqual(arr) && arr.length === 4;


  const checkEveryCell = (i, j) => {
    // check left 4 in a row 
    let left = boardArr[i].slice(j - 3, j + 1);
    if (isWinner(left)) {
      return left;
    }

    // check right 4 in a row
    let right = boardArr[i].slice(j, j + 4);
    if (isWinner(right)) {
      return right;
    }

    // check up 4 in a column 
    let up = boardArr.slice(i - 3, i + 1).map(row => row[j]);
    if (isWinner(up)) {
      return up;
    }

    // check down 4 in a column
    let down = boardArr.slice(i, i + 4).map(row => row[j]);
    if (isWinner(down)) {
      return down;
    }

    // diagonal 4 in a (row, col) top left  vector (-4, -4)
    let outOfBoundaries = i - 3 < 0 || j - 3 < 0;
    if (!outOfBoundaries) {
      const topLeft = [boardArr[i][j], boardArr[i - 1][j - 1], boardArr[i - 2][j - 2], boardArr[i - 3][j - 3]];
      if (isWinner(topLeft)) {
        return topLeft;
      }
    }

    // diagonal 4 in a (row,col) top right vector(-4, +4)
    outOfBoundaries = i - 3 < 0 || j + 3 > rightBoundary;
    if (!outOfBoundaries) {
      const topRight = [boardArr[i][j], boardArr[i - 1][j + 1], boardArr[i - 2][j + 2], boardArr[i - 3][j + 3]];
      if (isWinner(topRight)) {
        return topRight;
      }
    }

    // diagonal 4 in a (row, col) bottom left vector (+4, -4)
    outOfBoundaries = i + 3 > bottomBoundary || j - 3 < 0;
    if (!outOfBoundaries) {
      const bottomLeft = [boardArr[i][j], boardArr[i + 1][j - 1], boardArr[i + 2][j - 2], boardArr[i + 3][j - 3]];
      if (isWinner(bottomLeft)) {
        return bottomLeft;
      }
    }

    // diagonal 4 in a (row, col) bottom right vector (+4, +4)
    outOfBoundaries = i + 3 > bottomBoundary || j + 3 > rightBoundary;
    if (!outOfBoundaries) {
      const bottomRight = [boardArr[i][j], boardArr[i + 1][j + 1], boardArr[i + 2][j + 2], boardArr[i + 3][j + 3]];
      if (isWinner(bottomRight)) {
        return bottomRight;
      }
    }

    return 0;

  }

  const checkWinner = () => {

    for (let i = 0; i < boardArr.length; i++) {
      for (let j = 0; j < boardArr[i].length; j++) {
        // console.log(` (${i}, ${j}) Checking if there is a winner in all directions`);
        const result = checkEveryCell(i, j);
        if (result !== 0) {
          const coords = result.map(el => { return el.getCoords() });
          return { winner: identifyPlayer(result), coords: coords };
        }
      }
    }

    if (currentMoveNum === maxMoveNum) { // if its the last move and upper conditions didn't met, we have a tie
      return "tie"
    }

    return -1; // its just a regular move that doesn't make game end
  }


  const playRound = (column) => {
    if (column > board.getBoard()[0].length - 1) {
      console.log("Input something in range of (0,6)");
      return -2;
    }

    if (isGameOver) {
      console.log("The game is over. Start a new game!");
      return -3;
    }

    const returnCode = board.dropToken(column, getActivePlayer().token);
    if (returnCode === -1) {
      console.log(`There isn't enough space in column=${column}`);
      return -4;
    }

    console.log(
      `Dropping ${getActivePlayer().name}'s token into column ${column}...`
    );
    currentMoveNum++;

    const winner = checkWinner();
    if (winner === -1) {
      console.log("No winner this round. sad");
    } else if (winner === "tie") {
      console.log(`Thats a tie!`);
      isGameOver = true;
    } else {
      console.log(`Winner is ${winner.winner}`);
      isGameOver = true;
    }

    switchPlayerTurn();
    printNewRound();

    return winner;
  };

  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    getPlayers
  };
}

function ScreenController() {
  let game; // gets initialized in handleSubmit function
  const playerTurnDiv = document.querySelector('.turn');
  const boardDiv = document.querySelector('.board');
  const form = document.querySelector('.form-inner');
  const error = document.querySelector(".error");
  const introOuter = document.querySelector(".intro-outer");
  const gameoverDiv = document.querySelector(".gameover-screen");
  const msg = document.querySelector(".gameover-screen .msg");
  const playAgainBtn = document.querySelector(".gameover-screen .play-again");
  const startAgainBtn = document.querySelector(".gameover-screen .start-again");

  const updateScreen = (status) => {
    // clear the board
    boardDiv.textContent = "";

    // get the newest version of the board and player turn
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    if (status === -1) {
      // Display player's turn
      playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;
    } else if (status === -2) {
      playerTurnDiv.textContent = `${activePlayer.name}, please input something in range of (0,6)`;
    } else if (status === -4) {
      playerTurnDiv.textContent = `${activePlayer.name}, there isn't enough space in this column`;
    } else {
      if (status === "tie") {
        msg.textContent = "Game Over. Tie!";
      } else {
        msg.textContent = `Game Over. Congratulations ${status.winner}, You WIN!`;
      }
      gameoverDiv.classList.add("active");

    }
    // Render board squares
    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.classList.add(cell.getValue() === 1 ? `red` : (cell.getValue() === 2 ? `yellow` : `gray`));
        cellButton.dataset.row = i;
        cellButton.dataset.column = j;
        cellButton.textContent = cell.getValue();
        boardDiv.appendChild(cellButton);
      })
    })

    if (!status.coords) return;

    // render highlighted cells
    status.coords.forEach(coord => {
      let btn = document.querySelector(`[data-row="${coord.row}"][data-column="${coord.col}"]`);
      btn.classList.add("highlight");
    });
  }

  // Add event listener for the board
  function clickHandlerBoard(e) {
    const selectedColumn = e.target.dataset.column;
    // Make sure I've clicked a column and not the gaps in between
    if (!selectedColumn) return;

    const status = game.playRound(selectedColumn);
    if (status !== -3) updateScreen(status);  // if -3, then its game over so don't update the screen
  }
  boardDiv.addEventListener("click", clickHandlerBoard);

  // Add event listener for game start
  function handleSubmit(e) {
    e.preventDefault();
    const player1 = e.target.player1.value;
    const player2 = e.target.player2.value;

    if (!player1 || !player2) {
      error.classList.add("active");
      error.textContent = "Please input yo names in the input fields";
      return;
    }

    error.classList.remove("active");
    introOuter.classList.add("hide");
    game = GameController(player1, player2);
    updateScreen(-1);
  }
  form.addEventListener("submit", handleSubmit);

  // Add event listener for the play again btn
  function handlePlayAgain(e) {
    gameoverDiv.classList.remove("active");

    game = GameController(game.getPlayers()[0].name, game.getPlayers()[1].name);
    updateScreen(-1);
  }
  playAgainBtn.addEventListener("click", handlePlayAgain);

  // Add event listener for the start again btn
  function handleStartAgain(e) {
    introOuter.classList.remove("hide");
    gameoverDiv.classList.remove("active");
  }
  startAgainBtn.addEventListener("click", handleStartAgain);
}

ScreenController();
