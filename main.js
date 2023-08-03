function Gameboard() {
  const rows = 6;
  const columns = 7;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const dropToken = (column, player) => {
    const availableCells = board.filter((row) => row[column].getValue() === 0).map(row => row[column]);

    if (!availableCells.length) return;

    const lowestRow = availableCells.length - 1;
    board[lowestRow][column].addToken(player);

  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
    console.log(boardWithCellValues);
  };

  return { getBoard, dropToken, printBoard };
}

function Cell() {
  let value = 0;

  const addToken = (player) => {
    value = player;
  };

  const getValue = () => value;

  return {
    addToken,
    getValue
  };
}

function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const board = Gameboard();

  const players = [
    {
      name: playerOneName,
      token: 1
    },
    {
      name: playerTwoName,
      token: 2
    }
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const checkWinner = () => {
    /*  win conditions (directions)
        (row, col) left (0, -4), right (0, +4), up (-4, 0), down (+4, 0)
        (row, col) top left (-4, -4), top right (-4, +4), bottom left (+4, -4), bottom right (+4, +4)
        check on every Cell();    */

    const boardArr = board.getBoard();
    const rightBoundary = boardArr[0].length - 1;
    const bottomBoundary = boardArr.length - 1;

    const allEqual = arr => arr.every(val => val.getValue() === arr[0].getValue());
    const hasEmptyCell = arr => arr.some(val => val.getValue() === 0);
    const identifyPlayer = arr => players[0].token === arr[0].getValue() ? players[0].name : players[1].name;
    const isWinner = arr => !hasEmptyCell(arr) && allEqual(arr) && arr.length === 4;

    for (let i = 0; i < boardArr.length; i++) {
      for (let j = 0; j < boardArr[i].length; j++) {
        console.log(` (${i}, ${j}) Checking if there is a winner in all directions`);

        // check left 4 in a row 
        let left = boardArr[i].slice(j - 3, j + 1);
        if (isWinner(left)) {
          return identifyPlayer(left);
        }

        // check right 4 in a row
        let right = boardArr[i].slice(j, j + 4);
        if (isWinner(right)) {
          return identifyPlayer(right);
        }

        // check up 4 in a column 
        let up = boardArr.slice(i - 3, i + 1).map(row => row[j]);
        if (isWinner(up)) {
          return identifyPlayer(up);
        }

        // check down 4 in a column
        let down = boardArr.slice(i, i + 4).map(row => row[j]);
        if (isWinner(down)) {
          return identifyPlayer(down);
        }

        // diagonal 4 in a (row, col) top left  vector (-4, -4)
        let outOfBoundaries = i - 3 < 0 || j - 3 < 0;
        if (!outOfBoundaries) {
          const topLeft = [boardArr[i][j], boardArr[i - 1][j - 1], boardArr[i - 2][j - 2], boardArr[i - 3][j - 3]];
          if (isWinner(topLeft)) {
            return identifyPlayer(topLeft);
          }
        }

        // diagonal 4 in a (row,col) top right vector(-4, +4)
        outOfBoundaries = i - 3 < 0 || j + 3 > rightBoundary;
        if (!outOfBoundaries) {
          const topRight = [boardArr[i][j], boardArr[i - 1][j + 1], boardArr[i - 2][j + 2], boardArr[i - 3][j + 3]];
          if (isWinner(topRight)) {
            return identifyPlayer(topRight);
          }
        }

        // diagonal 4 in a (row, col) bottom left vector (+4, -4)
        outOfBoundaries = i + 3 > bottomBoundary || j - 3 < 0;
        if (!outOfBoundaries) {
          const bottomLeft = [boardArr[i][j], boardArr[i + 1][j - 1], boardArr[i + 2][j - 2], boardArr[i + 3][j - 3]];
          if (isWinner(bottomLeft)) {
            return identifyPlayer(bottomLeft);
          }
        }

        // diagonal 4 in a (row, col) bottom right vector (+4, +4)
        outOfBoundaries = i + 3 > bottomBoundary || j + 3 > rightBoundary;
        if (!outOfBoundaries) {
          const bottomRight = [boardArr[i][j], boardArr[i + 1][j + 1], boardArr[i + 2][j + 2], boardArr[i + 3][j + 3]];
          if (isWinner(bottomRight)) {
            return identifyPlayer(bottomRight);
          }
        }

      }
    }

    return "nothing";

  }


  const playRound = (column) => {
    console.log(
      `Dropping ${getActivePlayer().name}'s token into column ${column}...`
    );

    board.dropToken(column, getActivePlayer().token);
    const winner = checkWinner();
    if (winner === "nothing") {
      console.log("No winner this round. sad")
    } else {
      console.log(`Winner is ${winner}`);
    }


    switchPlayerTurn();
    printNewRound();
  };

  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard
  };
}

const game = GameController();

function ScreenController() {
  const game = GameController();
  const playerTurnDiv = document.querySelector('.turn');
  const boardDiv = document.querySelector('.board');

  const updateScreen = () => {
    // clear the board
    boardDiv.textContent = "";

    // get the newest version of the board and player turn
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    // Display player's turn
    playerTurnDiv.textContent = `${activePlayer.name}'s turn...`

    // Render board squares
    board.forEach(row => {
      row.forEach((cell, index) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.column = index;
        cellButton.textContent = cell.getValue();
        boardDiv.appendChild(cellButton);
      })
    })
  }

  // Add event listener for the board
  function clickHandlerBoard(e) {
    const selectedColumn = e.target.dataset.column;
    // Make sure I've clicked a column and not the gaps in between
    if (!selectedColumn) return;

    game.playRound(selectedColumn);
    updateScreen();
  }
  boardDiv.addEventListener("click", clickHandlerBoard);

  // Initial render
  updateScreen();

  // We don't need to return anything from this module because everything is encapsulated inside this screen controller.
}

// ScreenController();
