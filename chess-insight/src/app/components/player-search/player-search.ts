import { Component, signal } from '@angular/core';
import { ChessService } from '../../services/chess';
import { GameViewerComponent } from '../game-viewer/game-viewer';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-search',
  standalone: true,
  imports: [FormsModule, GameViewerComponent ],
  templateUrl: './player-search.html',
  styleUrl: './player-search.css'
})
export class PlayerSearchComponent {

  username = signal('');
  player = signal<any | null>(null);
  stats = signal<any | null>(null);
  games = signal<any[]>([]);
  selectedGame = signal<any | null>(null);
  replayMode = signal(false);
  error = signal<string | null>(null);

  selectGame(game: any) {
  this.selectedGame.set(game);
  }

  constructor(private chessService: ChessService) {}

  search() {
    this.error.set(null);
    this.player.set(null);
    this.stats.set(null);

    const name = this.username().trim();
    if (!name) return;

    this.chessService.getPlayer(name).subscribe({
      next: data => this.player.set(data),
      error: () => this.error.set('Player not found')
    });

    this.chessService.getPlayerStats(name).subscribe({
      next: data => this.stats.set(data)
    });

    this.chessService.getPlayerGames(name).subscribe({
      next: data => this.games.set(data)
    });

  }

  startReplay() {
    if (!this.selectedGame()) return;
    this.replayMode.set(true);
  }

  exitReplay() {
    this.replayMode.set(false);
  }

}