import { Component, Input, signal, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'chessboard-element';
import { Chess } from 'chess.js';
import { ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-viewer.html',
  styleUrl: './game-viewer.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class GameViewerComponent implements AfterViewInit {

  @Input() game: any;
  @ViewChildren('moveRow') moveRows!: QueryList<ElementRef>;
  @ViewChild('board') board!: ElementRef;
  @Input() playerUsername!: string;

  chess = new Chess();

  moves = signal<string[]>([]);
  movePairs = signal<{ white?: string; black?: string }[]>([]);
  moveIndex = signal(0);
  currentFen = signal(this.chess.fen());
  orientation = signal<'white' | 'black'>('white');
  highlightSquares = signal<string>('');

  constructor() {
    effect(() => {
      const game = this.game;
      if (!game?.pgn) return;

      this.loadGame(game.pgn);
    });
  }

  ngAfterViewInit() {
    this.injectHighlightStyles();
  }

  loadGame(pgn: string) {
    this.chess.reset();

    // Remove clock annotations
    const cleanedPgn = pgn.replace(/\{[^}]+\}/g, '');

    this.chess.loadPgn(cleanedPgn);

    const history = this.chess.history({ verbose: true });

    const sanMoves = history.map(m => m.san);

    this.moves.set(sanMoves);
    this.moveIndex.set(0);

    // Determine orientation
    const username = this.playerUsername?.toLowerCase();

    if (this.game?.black?.toLowerCase() === username) {
      this.orientation.set('black');
    } else {
      this.orientation.set('white');
    }

    // Build move pairs
    const pairs: { white?: string; black?: string }[] = [];

    for (let i = 0; i < sanMoves.length; i += 2) {
      pairs.push({
        white: sanMoves[i],
        black: sanMoves[i + 1]
      });
    }

    this.movePairs.set(pairs);

    this.chess.reset();
    this.currentFen.set(this.chess.fen());
  }

  nextMove() {
    const index = this.moveIndex();
    if (index >= this.moves().length) return;

    const move = this.chess.move(this.moves()[index]);
    this.moveIndex.set(index + 1);
    this.currentFen.set(this.chess.fen());
    this.updateHighlight(move);
    setTimeout(() => this.scrollToCurrentMove());
  }

  prevMove() {
    if (this.moveIndex() === 0) return;
    this.chess.undo();

    const newIndex = this.moveIndex() - 1;
    this.moveIndex.set(newIndex);

    this.currentFen.set(this.chess.fen());

    const history = this.chess.history({ verbose: true });
    const lastMove = history[history.length - 1];
    this.updateHighlight(lastMove);

    setTimeout(() => this.scrollToCurrentMove());
  }

  goToStart() {
    this.chess.reset();
    this.moveIndex.set(0);
    this.currentFen.set(this.chess.fen());
    this.updateHighlight(null);
  }

  goToEnd() {
    this.chess.reset();
    const moves = this.moves();

    for (let move of moves) {
      this.chess.move(move);
    }

    this.moveIndex.set(moves.length);
    this.currentFen.set(this.chess.fen());

    this.updateHighlightFromHistory();
  }

  goToMove(index: number) {
    this.chess.reset();
    const moves = this.moves();

    for (let i = 0; i <= index; i++) {
      this.chess.move(moves[i]);
    }

    this.moveIndex.set(index + 1);
    this.currentFen.set(this.chess.fen());

    this.updateHighlightFromHistory();

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

  updateHighlight(move: any) {
    const boardEl = this.board?.nativeElement;
    if (!boardEl) return;

    const shadow = boardEl.shadowRoot;
    if (!shadow) return;

    // remove previous highlights
    shadow.querySelectorAll('.last-move-from, .last-move-to').forEach((el: Element) => {
      el.classList.remove('last-move-from');
      el.classList.remove('last-move-to');
    });

    if (!move) return;
    const fromSquare = shadow.querySelector(`[data-square="${move.from}"]`);
    const toSquare = shadow.querySelector(`[data-square="${move.to}"]`);

    fromSquare?.classList.add('last-move-from');
    toSquare?.classList.add('last-move-to');
  }

  updateHighlightFromHistory() {
    const history = this.chess.history({ verbose: true });
    const lastMove = history[history.length - 1];
    this.updateHighlight(lastMove);
  }

  injectHighlightStyles() {
    const boardEl = this.board?.nativeElement;
    if (!boardEl) return;

    const shadow = boardEl.shadowRoot;
    if (!shadow) return;

    if (shadow.querySelector('#highlight-style')) return;

    const style = document.createElement('style');
    style.id = 'highlight-style';

    style.textContent = `
      @keyframes movePulse {
        0% {
          box-shadow: inset 0 0 0 0px rgba(30,136,229,0.9);
          background: rgba(30,136,229,0.55);
        }
        100% {
          box-shadow: inset 0 0 0 5px #1e88e5;
          background: rgba(30,136,229,0.35);
        }
      }

      .last-move-from,
      .last-move-to {
        box-shadow: inset 0 0 0 5px #1e88e5;
        background: rgba(30,136,229,0.35);
        animation: movePulse 220ms ease-out;
      }
    `;

    shadow.appendChild(style);
  }

}