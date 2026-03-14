import { Component, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'chessboard-element';
import { Chess } from 'chess.js';
import { ViewChildren, QueryList, ElementRef } from '@angular/core';

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
  movePairs = signal<{ white?: string; black?: string }[]>([]);
  moveIndex = signal(0);
  currentFen = signal(this.chess.fen());
  @ViewChildren('moveRow') moveRows!: QueryList<ElementRef>;

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

    // Build move pairs
    const pairs: { white?: string; black?: string }[] = [];

    for (let i = 0; i < history.length; i += 2) {
      pairs.push({
        white: history[i],
        black: history[i + 1]
      });
    }

    this.movePairs.set(pairs);

    this.chess.reset();
    this.currentFen.set(this.chess.fen());
  }

  nextMove() {
    const index = this.moveIndex();
    if (index >= this.moves().length) return;

    this.chess.move(this.moves()[index]);
    this.moveIndex.set(index + 1);
    this.currentFen.set(this.chess.fen());
    setTimeout(() => this.scrollToCurrentMove());
  }

  prevMove() {
    if (this.moveIndex() === 0) return;

    this.chess.undo();
    this.moveIndex.set(this.moveIndex() - 1);
    this.currentFen.set(this.chess.fen());
    setTimeout(() => this.scrollToCurrentMove());
  }

  goToStart() {
    this.chess.reset();
    this.moveIndex.set(0);
    this.currentFen.set(this.chess.fen());
  }

  goToEnd() {
    this.chess.reset();
    const moves = this.moves();

    for (let move of moves) {
      this.chess.move(move);
    }

    this.moveIndex.set(moves.length);
    this.currentFen.set(this.chess.fen());
  }

  reset() {
    this.chess.reset();
    this.moveIndex.set(0);
    this.currentFen.set(this.chess.fen());
  }

  goToMove(index: number) {
    this.chess.reset();
    const moves = this.moves();

    for (let i = 0; i <= index; i++) {
      this.chess.move(moves[i]);
    }

    this.moveIndex.set(index + 1);
    this.currentFen.set(this.chess.fen());
    setTimeout(() => this.scrollToCurrentMove());
  }

  scrollToCurrentMove() {
    const move = this.moveIndex();
    if (move === 0) return;
    const rowIndex = Math.floor((move - 1) / 2);
    const rows = this.moveRows.toArray();
    if (!rows[rowIndex]) return;

    rows[rowIndex].nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

}