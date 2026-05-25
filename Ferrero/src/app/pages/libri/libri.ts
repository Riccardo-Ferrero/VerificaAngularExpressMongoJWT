import {ChangeDetectorRef, Component, linkedSignal, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Auth} from '../../services/auth';
import {Httpcall} from '../../services/httpcall';
import {Router} from '@angular/router';
import { LoginRequest, Libro } from '../../models/libri.model';
@Component({
  selector: 'libri',
  imports: [FormsModule, CommonModule],
  templateUrl: './libri.html',
  styleUrl: './libri.css',
})
export class Libri implements OnInit{
    constructor(private auth:Auth, private http:Httpcall,private router:Router,private cdr:ChangeDetectorRef) {  }
    credentials: LoginRequest = {nome:'Riccardo',cognome:'Ferrero'};
    errorMessage="";
    libri: Libro[] = []
    selectedGenere = "";
    showForm:boolean = false;
    formData = {
        titolo:"",
        genere : "",
        autore: "",
        dettagli:{
            pagine:1,
            editore:"",
            annoPubblicazione:2026
        }
    }
    premi_vinti_String ="";

    ngOnInit(): void {
        this.auth.login(this.credentials).subscribe({
            next: (response) => {
                
                if(response.token){
                    this.loadLibri();

                }   
                else{
                    this.errorMessage = response.msg || "Credenziali non valide";
                }
            },
            error: (err) => {
                this.errorMessage="Errore di connessione al server";
                console.log(this.errorMessage)
            }
        })
    }

    loadLibri(){
        this.errorMessage="";
        this.selectedGenere = "";
        this.http.getCall('/api/libri').subscribe({
            next: (res) =>{
                this.auth.saveToken(res.newToken);
                this.libri=res.data;
                console.log(this.libri);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage="Errore nel caricamento dei libri";
                this.cdr.detectChanges();
            }
        })
    }

    loadLibriGenere(){
        this.errorMessage =""
        
        if(this.selectedGenere == ""){
            this.errorMessage = "Seleziona un genere"
            return
        }

        this.libri = [];

        this.http.postCall('/api/libri/cercaPerGenere', {genere: this.selectedGenere}).subscribe({
            next: (res) =>{
                this.auth.saveToken(res.newToken);
                this.libri=res.data;
                console.log(this.libri);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage="Errore nel caricamento dei libri";
                this.cdr.detectChanges();
            }
        })

    }

    nuovoLibro(){
        this.showForm = true 
        this.formData = {
            titolo:"",
            genere : "",
            autore: "",
            dettagli:{
                pagine:1,
                editore:"",
                annoPubblicazione:2026
            }
        }
        this.premi_vinti_String ="";


    }

    annulla(){
        this.showForm = false;
        this.errorMessage = "";
    }

    aggiungiLibro(){
        this.errorMessage ="";
        if(this.formData.titolo.trim() === ""){
            this.errorMessage = "Titolo del libro obbligatorio";
            return;
        }

        const documento: any = {
            titolo : this.formData.titolo,
            genere : this.formData.genere,
            autore : this.formData.autore
        }

        
    }
}
