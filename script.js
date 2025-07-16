let board = null;
let game = new Chess();
let gameMode = 'human';
let pgnOutput = document.getElementById('pgnOutput');

function startGame() {
  game = new Chess();
  gameMode = document.getElementById('gameMode').value;
  board.position(game.fen());
  updatePGN();
  if (gameMode === 'ai-ai') runAIGame();
}

function makeAIMove() {
  if (game.game_over()) return;
  const moves = game.moves();
  const move = moves[Math.floor(Math.random() * moves.length)];
  game.move(move);
  board.position(game.fen());
  updatePGN();
  if (gameMode === 'ai-ai') setTimeout(makeAIMove, 500);
  if (gameMode === 'ai' && game.turn() === 'b') setTimeout(makeAIMove, 500);
}

function onDragStart(source, piece) {
  if (gameMode === 'ai-ai') return false;
  if (gameMode === 'ai' && game.turn() === 'b') return false;
  if (game.game_over()) return false;
  if (gameMode !== 'human' && ((game.turn() === 'b' && piece.startsWith('w')) || (game.turn() === 'w' && piece.startsWith('b')))) {
    return false;
  }
}

function onDrop(source, target) {
  const move = game.move({ from: source, to: target, promotion: 'q' });
  if (move === null) return 'snapback';
  updatePGN();
  if (gameMode === 'ai' && game.turn() === 'b') {
    setTimeout(makeAIMove, 500);
  }
}

function updatePGN() {
  pgnOutput.value = game.pgn();
}

function undoMove() {
  game.undo();
  if (gameMode === 'ai') game.undo(); // undo two for AI vs Human
  board.position(game.fen());
  updatePGN();
}

function exportPGN() {
  const blob = new Blob([game.pgn()], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'game.pgn';
  a.click();
}

function importPGN(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const pgnText = e.target.result;
    game.load_pgn(pgnText);
    board.position(game.fen());
    updatePGN();
  };
  reader.readAsText(file);
}

function runAIGame() {
  makeAIMove();
}

board = Chessboard('board', {
  draggable: true,
  position: 'start',
  onDragStart,
  onDrop
});
