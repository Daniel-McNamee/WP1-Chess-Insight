import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChessService {

  private apiBase = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getPlayer(username: string): Observable<any> {
    return this.http.get(`${this.apiBase}/player/${username}`);
  }

  getPlayerStats(username: string): Observable<any> {
    return this.http.get(`${this.apiBase}/player/${username}/stats`);
  }

  getPlayerGames(username: string) {
  return this.http.get<any[]>(`${this.apiBase}/player/${username}/games`);
  }

  searchPlayers(query: string) {
    return this.http.get<string[]>(`http://localhost:3000/api/players/search/${query}`);
  }

  getArchives(username: string) {
    return this.http.get<any[]>(`http://localhost:3000/api/player/${username}/archives`);
  }

  getArchiveGames(url: string, username: string) {
    return this.http.get<any[]>(
      `http://localhost:3000/api/archive?url=${encodeURIComponent(url)}&username=${username}`
    );
  }

}