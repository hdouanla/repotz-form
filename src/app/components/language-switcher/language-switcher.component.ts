import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  imports: [CommonModule],
  template: `
    <button 
      class="language-switcher" 
      (click)="toggleLanguage()"
      [title]="translations.switchLanguage">
      {{ translations.switchLanguage }}
    </button>
  `,
  styles: [`
    .language-switcher {
      position: fixed;
      top: 20px;
      left: 20px;
      background: linear-gradient(135deg, #ff9500 0%, #ffc107 100%);
      border: 2px solid #e68900;
      border-radius: 25px;
      padding: 10px 18px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);
      
      &:hover {
        background: linear-gradient(135deg, #e68900 0%, #ffb300 100%);
        box-shadow: 0 6px 20px rgba(255, 149, 0, 0.4);
        transform: translateY(-2px);
        border-color: #cc7a00;
      }
      
      &:active {
        transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(255, 149, 0, 0.4);
      }
      
      &:focus {
        outline: 3px solid rgba(255, 193, 7, 0.5);
        outline-offset: 2px;
      }
    }
  `]
})
export class LanguageSwitcherComponent {
  private languageService = inject(LanguageService);
  
  get translations() {
    return this.languageService.getTranslations();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }
}