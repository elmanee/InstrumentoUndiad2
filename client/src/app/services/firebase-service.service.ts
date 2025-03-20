// src/app/services/firebase.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firebaseApp;
  private storage;

  constructor() {
    // Inicializar Firebase
    this.firebaseApp = initializeApp(environment.firebaseConfig);
    this.storage = getStorage(this.firebaseApp);
  }

  getStorage() {
    return this.storage;
  }
}
