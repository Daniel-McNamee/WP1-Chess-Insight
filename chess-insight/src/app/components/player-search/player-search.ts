import { Component, signal } from '@angular/core';
import { ChessService } from '../../services/chess';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './player-search.html',
  styleUrl: './player-search.css'
})
export class PlayerSearchComponent {

  username = signal('');
  player = signal<any | null>(null);
  stats = signal<any | null>(null);
  games = signal<any[]>([]);
  error = signal<string | null>(null);

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
}