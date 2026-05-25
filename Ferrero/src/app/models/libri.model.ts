import { DefaultTitleStrategy } from "@angular/router";


export interface Libro {
  _id?: string;   // il ? indica che l'id è opzionale: non serve quando creiamo un nuovo studente, ma è presente negli studenti letti dal DB
  titolo: string;
  genere: string;
  autore: string;
  premi_vinti?: string[];
  dettagli:Dettagli;
}

export interface Dettagli {
  pagine: number;
  editore: string;
  annoPubblicazione:number;
}

export interface LoginRequest {
  nome: string;
  cognome: string;
}

export interface LoginResponse {
  msg: string;
  token: string;
}

export interface StatisticaItem {
  _id: string;
  totale: number;
}
