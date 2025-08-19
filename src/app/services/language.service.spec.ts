import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default language as French or English based on browser', () => {
    const currentLang = service.getCurrentLanguage();
    expect(['fr', 'en']).toContain(currentLang);
  });

  it('should toggle language correctly', () => {
    const initialLang = service.getCurrentLanguage();
    service.toggleLanguage();
    const newLang = service.getCurrentLanguage();
    expect(newLang).not.toBe(initialLang);
  });

  it('should provide translations for current language', () => {
    const translations = service.getTranslations();
    expect(translations.thankYouTitle).toBeDefined();
    expect(translations.thankYouMessage).toBeDefined();
    expect(translations.loading).toBeDefined();
    expect(translations.switchLanguage).toBeDefined();
  });
});