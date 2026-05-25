import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class Httpcall {
  private readonly apiUrl = 'http://127.0.0.1:8888';

  constructor(private http: HttpClient, private auth: Auth) {}

  /** Costruisce gli headers con il token JWT corrente */
  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    // Il server legge req.headers["token"] — NON "Authorization"
    return new HttpHeaders().set('token', `Bearer ${token}`);
  }

  /** GET autenticato — restituisce la risposta JSON completa al componente */
  getCall(endpoint: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  /** POST autenticato — restituisce la risposta JSON completa al componente */
  postCall(endpoint: string, body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${endpoint}`, body, {
      headers: this.getHeaders()
    });
  }
}
