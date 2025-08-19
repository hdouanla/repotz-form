import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FormData {
  id: string;
  title: string;
  form_data: any;
  logo_url?: string;
  background_color?: string;
  [key: string]: any;
}

export interface FormSubmissionResponse {
  success: boolean;
  id?: string;
  redirect_url?: string;
  message?: string;
}



@Injectable({
  providedIn: 'root'
})
export class FormApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  loadFormData(formKey: string): Observable<FormData> {
    return this.http.get<FormData>(`${this.baseUrl}/forms/${formKey}`);
  }

  createFormResponse(formKey: string, data: any): Observable<FormSubmissionResponse> {
    return this.http.post<FormSubmissionResponse>(`${this.baseUrl}/forms/${formKey}/responses`, {
      formData: data
    });
  }

  updateFormResponse(formKey: string, formId: string, data: any, completed = false): Observable<FormSubmissionResponse> {
    return this.http.put<FormSubmissionResponse>(`${this.baseUrl}/forms/${formKey}/responses/${formId}`, {
      formData: data,
      completed
    });
  }
}
