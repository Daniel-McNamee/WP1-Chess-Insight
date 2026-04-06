import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChessService {

  // Base URL for the backend API
  private apiBase = 'http://localhost:3000/api';

  // Inject HttpClient for making API calls
  constructor(private http: HttpClient) {}

  // Fetch player profile information
  getPlayer(username: string): Observable<any> {
    return this.http.get(`${this.apiBase}/player/${username}`);
  }

  getPlayerStats(username: string): Observable<any> {
    return this.http.get(`${this.apiBase}/player/${username}/stats`);
  }

  // Fetch games for a player
  getPlayerGames(username: string) {
  return this.http.get<any[]>(`${this.apiBase}/player/${username}/games`);
  }

  // Search for players by username
  searchPlayers(query: string) {
    return this.http.get<string[]>(`http://localhost:3000/api/players/search/${query}`);
  }

  // Fetch player's game archives
  getArchives(username: string) {
    return this.http.get<any[]>(`http://localhost:3000/api/player/${username}/archives`);
  }

  // Fetch games from a specific archive
  getArchiveGames(url: string, username: string) {
    return this.http.get<any[]>(
      `http://localhost:3000/api/archive?url=${encodeURIComponent(url)}&username=${username}`
    );
  }

  // Save search history
  saveSearch(username: string) {
    return this.http.post(
      'http://localhost:3000/db/players/search',
      { username }
    );
  }

  // Fetch search history
  getSearchHistory() {
    return this.http.get<any[]>(
      'http://localhost:3000/db/players/search'
    );
  }

  // Toggle favourite game
  toggleFavourite(game: any) {
    return this.http.post(
      'http://localhost:3000/db/favourites/toggle',
      game
    );
  }

  // Fetch favourite games
  getFavouriteGames() {
    return this.http.get<any[]>(
      'http://localhost:3000/db/favourites'
    );
  }

  // Add a game to recent games
  addRecentGame(game: any) {
    return this.http.post(
      'http://localhost:3000/db/recent',
      game
    );
  }

  // Fetch recent games
  getRecentGames() {
    return this.http.get<any[]>(
      'http://localhost:3000/db/recent'
    );
  }

  // Save a move note for a specific game
  saveMoveNote(note: any) {
    return this.http.post(
      'http://localhost:3000/db/move-notes',
      note
    );
  }

  // Fetch move notes for a specific game
  getMoveNotes(pgn: string) {
    return this.http.get<any[]>(
      'http://localhost:3000/db/move-notes/' + encodeURIComponent(pgn)
    );
  }

  // Fetch annotated games
  getAnnotatedGames() {
    return this.http.get<any[]>(
      'http://localhost:3000/db/move-notes'
    );
  }

}