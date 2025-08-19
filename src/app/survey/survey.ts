import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SurveyModule } from 'survey-angular-ui';
import { Model, surveyLocalization } from 'survey-core';
import { firstValueFrom, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { LanguageService, SupportedLanguage } from '../services/language.service';
import { FormApiService, FormSubmissionResponse } from '../services/form-api.service';
import { LanguageSwitcherComponent } from '../components/language-switcher/language-switcher.component';


@Component({
  selector: 'app-survey',
  imports: [CommonModule, SurveyModule, LanguageSwitcherComponent],
  templateUrl: './survey.html',
  styleUrl: './survey.scss'
})
export class Survey implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private languageService = inject(LanguageService);
  private formApiService = inject(FormApiService);
  private languageSubscription?: Subscription;
  private routeSubscription?: Subscription;

  surveyModel!: Model;
  showThankYou = false;
  currentLanguage: SupportedLanguage = 'en';
  formKey = '';
  currentFormId?: string;
  logoUrl = '';
  headerBackgroundColor = '';

  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe(params => {
      const urlLang = params['lang'];
      this.formKey = params['formKey'];

      // Initialize language based on URL, browser, or fallback
      this.currentLanguage = this.languageService.initializeFromUrl(urlLang);

      // Form starts fresh - no form ID yet
      this.currentFormId = undefined;

      this.loadSurveyData();
    });

    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
      this.updateSurveyLanguage();
    });
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  get translations() {
    return this.languageService.getTranslations();
  }

  private async loadSurveyData() {
    if (!this.formKey) return;

    const surveyLocale = this.currentLanguage === 'en' ? 'en' : 'fr';
    surveyLocalization.currentLocale = surveyLocale;

    try {
      // Load the form definition
      const formData = await firstValueFrom(this.formApiService.loadFormData(this.formKey));

      console.log('formData: ', formData);

      // Set dynamic logo and theme from API response
      this.logoUrl = formData.logo_url || '';
      this.headerBackgroundColor = formData.background_color || '#ffffff';

      this.surveyModel = new Model(formData.form_data);
      this.surveyModel.locale = surveyLocale;
      this.surveyModel.onComplete.add(this.onSurveyComplete.bind(this));
      this.surveyModel.onPartialSend.add(this.onPartialSave.bind(this));

      // Note: Form always starts fresh on app load

      // Enable incremental saving
      this.setupIncrementalSaving();

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading form data:', error);
      this.createFallbackSurvey();
    }
  }


  private updateSurveyLanguage() {
    if (!this.surveyModel) return;

    const surveyLocale = this.currentLanguage === 'en' ? 'en' : 'fr';
    surveyLocalization.currentLocale = surveyLocale;
    this.surveyModel.locale = surveyLocale;
    this.cdr.detectChanges();
  }

  private createFallbackSurvey() {
    const surveyLocale = this.currentLanguage === 'en' ? 'en' : 'fr';

    this.surveyModel = new Model({
      title: this.currentLanguage === 'en' ? "Form Not Found" : "Formulaire non trouvé",
      pages: [{
        name: "error",
        elements: [{
          type: "html",
          name: "error_message",
          html: this.currentLanguage === 'en'
            ? "<p>The requested form could not be loaded. Please check the URL and try again.</p>"
            : "<p>Le formulaire demandé n'a pas pu être chargé. Veuillez vérifier l'URL et réessayer.</p>"
        }]
      }]
    });

    this.surveyModel.locale = surveyLocale;
    this.cdr.detectChanges();
  }

  private setupIncrementalSaving() {
    if (!this.surveyModel) return;

    // Save on value changes (debounced)
    let saveTimeout: any;
    this.surveyModel.onValueChanged.add(() => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => this.saveIncrementally(), 2000);
    });
  }

  private async saveIncrementally() {
    if (!this.surveyModel || !this.formKey) return;

    const formData = this.surveyModel.data;

    try {
      if (this.currentFormId) {
        // Update existing form response
        await firstValueFrom(
          this.formApiService.updateFormResponse(this.formKey, this.currentFormId, formData, false)
        );
      } else {
        // Create new form response
        const response = await firstValueFrom(
          this.formApiService.createFormResponse(this.formKey, formData)
        );

        if (response.id) {
          this.currentFormId = response.id;
        }
      }
    } catch (error) {
      console.warn('Error saving form incrementally:', error);
    }
  }

  private async onSurveyComplete(sender: any) {
    const formData = sender.data;

    if (!this.formKey) {
      this.handleErrorResponse();
      return;
    }

    try {
      let response: FormSubmissionResponse;

      if (this.currentFormId) {
        // Final update with completion flag
        response = await firstValueFrom(
          this.formApiService.updateFormResponse(this.formKey, this.currentFormId, formData, true)
        );
      } else {
        // Create and complete in one go
        response = await firstValueFrom(
          this.formApiService.createFormResponse(this.formKey, formData)
        );

        if (response.id) {
          response = await firstValueFrom(
            this.formApiService.updateFormResponse(this.formKey, response.id, formData, true)
          );
        }
      }

      // Form completed successfully

      this.handleSuccessResponse(response);
    } catch (error) {
      console.error('Error completing form submission:', error);
      this.handleErrorResponse();
    }
  }

  private async onPartialSave(sender: any) {
    // This method can be called by SurveyJS for partial saves
    await this.saveIncrementally();
  }

  private handleErrorResponse() {
    this.showThankYouMessage();
  }

  private handleSuccessResponse(response: FormSubmissionResponse) {
    // Check if API response contains a redirect URL
    if (response?.redirect_url) {
      window.location.href = response.redirect_url;
    } else {
      // No redirect URL provided, show thank you message
      this.showThankYouMessage();
    }
  }

  private showThankYouMessage() {
    this.showThankYou = true;
    this.cdr.detectChanges();
  }
}
