import { Component, computed, signal } from '@angular/core';
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
  suggestions = signal<string[]>([]);
  gameFilter = signal<'all' | 'blitz' | 'rapid' | 'bullet'>('all');
  currentPage = signal(1);
  gamesPerPage = 15;
  loadingGames = signal(false);

  selectGame(game: any) {
  this.selectedGame.set(game);
  }

  constructor(private chessService: ChessService) {}

  search() {
    this.error.set(null);
    this.player.set(null);
    this.stats.set(null);
    this.games.set([]);

    this.loadingGames.set(true);

    // Reset filters and pagination when new player loaded
    this.gameFilter.set('all');
    this.currentPage.set(1);
    this.selectedGame.set(null);
    this.replayMode.set(false);

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
      next: data => {
        this.games.set(data);
        this.loadingGames.set(false);
      }
    });
    
  }

  startReplay() {
    if (!this.selectedGame()) return;
    this.replayMode.set(true);
  }

  exitReplay() {
    this.replayMode.set(false);
  }

  onUsernameChange(value: string) {
    this.username.set(value);

    if (value.length < 2) {
      this.suggestions.set([]);
      return;
    }

    this.chessService.searchPlayers(value).subscribe(players => {
      this.suggestions.set(players);
    });
  }

  selectSuggestion(username: string) {
    this.username.set(username);
    this.suggestions.set([]);
    this.search();
  }

  filteredGames = computed(() => {
    const filter = this.gameFilter();
    const games = this.games();

    if (filter === 'all') return games;

    return games.filter(g => g.timeClass === filter);
  });

  setFilter(filter: 'all' | 'blitz' | 'rapid' | 'bullet') {
    this.gameFilter.set(filter);
    this.currentPage.set(1);
  }

  pagedGames = computed(() => {
    const page = this.currentPage();
    const games = this.filteredGames();

    const start = (page - 1) * this.gamesPerPage;
    const end = start + this.gamesPerPage;

    return games.slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredGames().length / this.gamesPerPage);
  });

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

}