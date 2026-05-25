import { Routes } from '@angular/router';
import {Libri} from './pages/libri/libri';


export const routes: Routes = [
  {path:'',redirectTo:'libri',pathMatch:'full'},
  {path:'libri',component:Libri},
];
