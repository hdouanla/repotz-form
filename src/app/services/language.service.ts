import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SupportedLanguage = 'fr' | 'en';

export interface Translations {
  thankYouTitle: string;
  thankYouMessage: string;
  loading: string;
  switchLanguage: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<SupportedLanguage>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: Record<SupportedLanguage, Translations> = {
    fr: {
      thankYouTitle: 'Merci de votre participation !',
      thankYouMessage: 'Nous apprécions vos commentaires et votre participation à notre enquête.',
      loading: 'Chargement de l\'enquête...',
      switchLanguage: 'English'
    },
    en: {
      thankYouTitle: 'Thank you for participating!',
      thankYouMessage: 'We appreciate your feedback and participation in our survey.',
      loading: 'Loading survey...',
      switchLanguage: 'Français'
    }
  };

  constructor() {
    // Language initialization is now handled by the survey component based on URL
  }

  initializeFromUrl(urlLang: string): SupportedLanguage {
    const supportedLangs: SupportedLanguage[] = ['fr', 'en'];
    
    // First try URL parameter
    if (supportedLangs.includes(urlLang as SupportedLanguage)) {
      this.setLanguage(urlLang as SupportedLanguage);
      return urlLang as SupportedLanguage;
    }
    
    // Then try browser language
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    if (supportedLangs.includes(browserLang)) {
      this.setLanguage(browserLang);
      return browserLang;
    }
    
    // Finally fallback to English
    this.setLanguage('en');
    return 'en';
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguageSubject.value;
  }

  getTranslations(): Translations {
    return this.translations[this.getCurrentLanguage()];
  }

  setLanguage(lang: SupportedLanguage): void {
    this.currentLanguageSubject.next(lang);
  }

  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang: SupportedLanguage = currentLang === 'fr' ? 'en' : 'fr';
    this.setLanguage(newLang);
  }
}