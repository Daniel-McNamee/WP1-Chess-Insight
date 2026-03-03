import { Component, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'chessboard-element';
import { Chess } from 'chess.js';

@Component({
  selector: 'app-game-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-viewer.html',
  styleUrl: './game-viewer.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class GameViewerComponent {

  @Input() game: any;

  chess = new Chess();

  moves = signal<string[]>([]);
  moveIndex = signal(0);
  currentFen = signal(this.chess.fen());

  constructor() {
    effect(() => {
      const game = this.game;
      if (!game?.pgn) return;

      this.loadGame(game.pgn);
    });
  }

  loadGame(pgn: string) {
    this.chess.reset();

    // Remove clock annotations
    const cleanedPgn = pgn.replace(/\{[^}]+\}/g, '');

    this.chess.loadPgn(cleanedPgn);

    const history = this.chess.history();

    this.moves.set(history);
    this.moveIndex.set(0);

    this.chess.reset();
    this.currentFen.set(this.chess.fen());
  }

  nextMove() {
    const index = this.moveIndex();
    if (index >= this.moves().length) return;

    this.chess.move(this.moves()[index]);
    this.moveIndex.set(index + 1);
    this.currentFen.set(this.chess.fen());
  }

  prevMove() {
    if (this.moveIndex() === 0) return;

    this.chess.undo();
    this.moveIndex.set(this.moveIndex() - 1);
    this.currentFen.set(this.chess.fen());
  }

  reset() {
    this.chess.reset();
    this.moveIndex.set(0);
    this.currentFen.set(this.chess.fen());
  }
}