import { Routes } from '@angular/router';
import { Survey } from './survey/survey';

export const routes: Routes = [
  { path: ':lang/:formKey', component: Survey },
  { path: '', redirectTo: '/en/default', pathMatch: 'full' },
  { path: '**', redirectTo: '/en/default' }
];
