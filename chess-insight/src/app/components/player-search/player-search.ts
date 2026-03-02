import { Component } from '@angular/core';
import { ChessService } from '../../services/chess';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-search',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './player-search.html',
  styleUrl: './player-search.css'
})
export class PlayerSearchComponent {

  username = '';
  player: any = null;
  stats: any = null;
  error: string | null = null;

  constructor(private chessService: ChessService) {}

  search() {
    this.error = null;
    this.player = null;
    this.stats = null;

    if (!this.username) return;

    this.chessService.getPlayer(this.username).subscribe({
      next: data => this.player = data,
      error: () => this.error = 'Player not found'
    });

    this.chessService.getPlayerStats(this.username).subscribe({
      next: data => this.stats = data
    });
  }
}