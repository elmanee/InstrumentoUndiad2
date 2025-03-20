// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';

// Importa directamente los componentes
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AlmacenistaComponent } from './features/almacenista/almacenista.component';
// Elimina la importación de InventarioComponent ya que es standalone
import { HttpClientModule } from '@angular/common/http';

// Importa tu servicio de Firebase
import { FirebaseService } from './services/firebase-service.service';

import { AlmacenistaService } from './services/almacenista.service';
import { ImageUploadService } from './services/image-upload.service';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    AlmacenistaComponent
    // Elimina InventarioComponent de las declaraciones
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule
    // Si necesitas usar InventarioComponent en rutas, déjalo configurado en AppRoutingModule
  ],
  providers: [
    FirebaseService, // Añade FirebaseService aquí
    AlmacenistaService,
    ImageUploadService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(){
  }
}
