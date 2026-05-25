import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/libri.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // Il server usa HTTPS sulla porta 8888
  private readonly apiUrl = 'http://127.0.0.1:8888/api';
  private readonly TOKEN_KEY = 'jwt_token';

  constructor(private http: HttpClient) {}

  /** POST /api/login — autentica e salva il token JWT in localStorage */
  /**
   * Invia le credenziali al server e, se il login va a buon fine,
   * salva il token JWT nel localStorage del browser.
   *
   * Il metodo restituisce un Observable<LoginResponse>:
   * chi chiama login() deve fare .subscribe() per avviare la chiamata
   * e ricevere la risposta. Gli Observable sono "pigri": senza subscribe
   * la chiamata HTTP non parte mai.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {

    // this.http.post<LoginResponse>(...) esegue una chiamata POST al server.
    // Il tipo generico <LoginResponse> dice ad Angular come interpretare
    // il JSON di risposta: { msg: string, token: string }
    // credentials (username + password) viene serializzato automaticamente in JSON nel body.
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)

      // .pipe() permette di "agganciare" operatori RxJS all'Observable
      // senza modificare i dati che fluiscono — è come una catena di filtri.
      .pipe(

        // tap() esegue un'azione "di lato" (side effect) ogni volta che
        // arriva un valore dall'Observable, MA non modifica il valore stesso.
        // È come mettere uno specchio sul flusso: guarda i dati senza toccarli.
        // In questo caso usiamo tap per salvare il token PRIMA che il componente
        // riceva la risposta, così quando il componente entra nel suo next()
        // il token è già in localStorage.
        tap(response => {

          // Controlliamo che il server abbia effettivamente restituito un token
          // (potrebbe mancare in caso di risposta anomala)
          if (response.token) {

            // localStorage è lo storage persistente del browser:
            // sopravvive alla chiusura della scheda, finché non viene rimosso.
            // TOKEN_KEY è la chiave con cui il token viene salvato ('jwt_token').
            console.log(response.token)
            localStorage.setItem(this.TOKEN_KEY, response.token);

            console.log('Token salvato in localStorage:', response.token);
          }
        })

        // Dopo il tap, l'Observable continua a trasportare la risposta originale
        // (invariata) verso il componente che ha fatto la subscribe().
      );
  }

  /** Rimuove il token dal localStorage */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /** Salva (o aggiorna) il token JWT nel localStorage */
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /** Restituisce il token JWT salvato */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Controlla se l'utente è loggato (token presente) */
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}

