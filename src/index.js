import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import './index.css';

function Board(props) {
  let rows = Array(3);

  for (let r = 0; r < 3; r++) {
    let row = Array(3);

    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c;
      row[c] = (
        <button
          key={c}
          className={"square " + props.squares[i].className}
          onClick={() => props.onClick(i)}>
        {props.squares[i].value}
      </button>);
    }

    rows[r] = React.createElement(
      'div', {
        key:  r,
        className: "board-row",
      },
      row
    );
  }

  return React.createElement('div', null, rows);
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        move: {location: -1},
      }],
      stepNumber: 0,
    }
  }
  handleClick(i) {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    const xIsNext = this.state.stepNumber%2 === 0;
    const player = xIsNext ? 'X' : 'O';
    squares[i] = player;
    this.setState({
      history: history.concat([{
        squares: squares,
        move: {player: player, location: i},
      }]),
      stepNumber: this.state.stepNumber + 1,
    });
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      history: this.state.history.slice(0, step + 1),
    });
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const xIsNext = this.state.stepNumber%2 === 0;

    let status;
    if (winner) {
      status = 'Winner: ' + winner.player;
    } else {
      status = `Next player: ${xIsNext ? 'X' : 'O'}`;
    }
    
    const currentMove = current.move ? current.move.location : -1;

    const moves = history.map((step, move) => {
      let desc;
      if(move) {
        const location = step.move.location;
        const x = (location % 3) + 1;
        const y = Math.floor(location / 3) + 1;
        desc = `Move #${move}: ${step.move.player} at (${x},${y})`
      } else {
        desc = 'Game Start';
      }
      
      let element = (
        <li key={move}>
          <a href="#" onClick={() => this.jumpTo(move)}>
            {desc}
          </a>
        </li>
      );
      
      if(currentMove === step.move.location) {
        element = React.createElement('strong', {key: 'move'}, [element]);
      }
      
      return element;
    });
    
    const boardSquares = current.squares.map((value, move) => {
      let square = {value: value, className: ''};
  
      if(winner) {
        if(winner.line.indexOf(move) !== -1) {
          square.className = 'square-winning-move';
        }
      } else if(currentMove === move) {
        square.className = 'square-current-move';
      }
      
      return square;
    });

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={boardSquares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('container')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let player = null;
  let line = [];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      player = squares[a];
      line = line.concat(lines[i]);
    }
  }

  if(player === null) {
    return null;
  }

  return {
    line: _.uniq(line),
    player: player,
  }
}