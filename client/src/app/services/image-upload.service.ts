import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs'; // Importar para manejar promesas
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FirebaseService } from '../services/firebase-service.service';




@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl = 'http://localhost:3000/api'; // Mantén el prefijo "/api" si es necesario

  constructor(private http: HttpClient, private firebaseService: FirebaseService) { }

  async subirImagen(archivo: File, nombreProducto: string): Promise<string> {
    const formData = new FormData();
    formData.append('imagen', archivo, nombreProducto);

    try {
      // Usar firstValueFrom para convertir Observable a Promise (método moderno)
      const resp: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/upload`, formData)
      );
      return resp.urlImagen;
    } catch (error) {
      console.error('Error en servicio de subida de imagen:', error);
      throw error;
    }
  }
}
