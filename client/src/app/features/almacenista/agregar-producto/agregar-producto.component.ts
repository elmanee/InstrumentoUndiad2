import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

// Importar servicios
import { AlmacenistaService } from '../../../services/almacenista.service';
import { ImageUploadService } from '../../../services/image-upload.service';
import { Producto } from '../../../services/almacenista.service';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './agregar-producto.component.html',
  styleUrls: ['./agregar-producto.component.css']
})
export class AgregarProductoComponent {
  // Modelo de producto actualizado con nombres de campos correctos
  producto: Producto = {
    codigo_barras: '',
    nombre_producto: '',
    marca: '',
    tamanio: '',
    categoria: '',
    nombre_proveedor: [],
    precio_pieza: undefined,
    precio_caja: undefined,
    cantidad_caja: undefined,
    pasillo: undefined,  // Cambiado de 'posillo' a 'pasillo'
    existencia_almacen: undefined,
    stock_almacen: undefined,
    existencia_exhibe: undefined,  // Cambiado de 'existencia_exhibicion' a 'existencia_exhibe'
    stock_exhibe: undefined,
    imagen: undefined
  };

  // Variable para manejar la imagen seleccionada
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;

  // Variable para mostrar estado de carga
  cargando = false;
  // Variable para mostrar errores
  mensajeError: string = '';

  constructor(
    private almacenistaService: AlmacenistaService,
    private imageUploadService: ImageUploadService,
    private router: Router


  ) {

  }

  // Método para manejar la selección de archivos
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;

      // Crear vista previa
      const reader = new FileReader();
      reader.onload = () => {
          this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
  }
  }

  // Método principal para guardar el producto
  async guardarProducto(): Promise<void> {
    // Limpiar mensaje de error previo
    this.mensajeError = '';

    // Validación inicial de datos
    if (!this.validarProducto()) {
      return;
    }

    // Iniciar estado de carga
    this.cargando = true;

    try {
      // Verificar si hay imagen para subir
      if (this.imagenSeleccionada) {
        try {
          const urlImagen = await this.imageUploadService.subirImagen(
            this.imagenSeleccionada,
            this.producto.nombre_producto
          );
          // Guardar URL de imagen en el producto
          this.producto.imagen = urlImagen;
        } catch (error) {
          console.error('Error al subir imagen:', error);
          this.mensajeError = 'Error al subir la imagen. Intente nuevamente.';
          this.cargando = false;
          return;
        }
      }

      // Crear producto en el servidor
      this.crearProductoEnServidor();
    } catch (error) {
      this.cargando = false;
      console.error('Error general:', error);
      this.mensajeError = 'Ocurrió un error inesperado. Intente nuevamente.';
    }
  }

  // Método de validación más completo
  validarProducto(): boolean {
    // Validaciones más exhaustivas
    if (!this.producto.codigo_barras?.trim()) {
      alert('Código de barras es obligatorio');
      return false;
    }

    if (!this.producto.nombre_producto?.trim()) {
      alert('Nombre del producto es obligatorio');
      return false;
    }

    if (!this.producto.marca) {
      alert('Selecciona una marca');
      return false;
    }

    if (!this.producto.tamanio) {
      alert('Selecciona un tamaño');
      return false;
    }

    if (!this.producto.categoria) {
      alert('Selecciona una categoría');
      return false;
    }

    return true;
  }

  // Método para crear el producto en el servidor
  private crearProductoEnServidor(): void {
    // Verificar si hay proveedores seleccionados
    console.log('Proveedores seleccionados antes de enviar:', this.producto.nombre_proveedor);

    // Si no hay proveedores o es null/undefined, asegúrate de enviar un array vacío
    const proveedoresFiltrados = this.producto.nombre_proveedor
    ? this.producto.nombre_proveedor.filter(p => p !== null && p !== undefined)
    : [];

    // Creamos una copia del objeto y convertimos valores a número
    const productoEnvio = {
        ...this.producto,
        // Asegúrate de que proveedores sea incluido en el objeto enviado
        nombre_proveedor: proveedoresFiltrados, // Crear copia del array
        precio_pieza: this.producto.precio_pieza ? Number(this.producto.precio_pieza) : undefined,
        precio_caja: this.producto.precio_caja ? Number(this.producto.precio_caja) : undefined,
        cantidad_caja: this.producto.cantidad_caja ? Number(this.producto.cantidad_caja) : undefined,
        pasillo: this.producto.pasillo ? Number(this.producto.pasillo) : undefined,
        existencia_almacen: this.producto.existencia_almacen ? Number(this.producto.existencia_almacen) : undefined,
        stock_almacen: this.producto.stock_almacen ? Number(this.producto.stock_almacen) : undefined,
        existencia_exhibe: this.producto.existencia_exhibe ? Number(this.producto.existencia_exhibe) : undefined,
        stock_exhibe: this.producto.stock_exhibe ? Number(this.producto.stock_exhibe) : undefined,
    };

    // Depurar para verificar
    console.log('Enviando producto:', productoEnvio);

    this.almacenistaService.crearProducto(productoEnvio).subscribe({
        next: (respuesta) => {
            this.cargando = false;
            alert('Producto creado exitosamente');
            this.router.navigate(['/inventario']);
        },
        error: (error) => {
            this.cargando = false;
            console.error('Error al crear producto', error);
            // Mostrar mensaje de error más detallado
            this.mensajeError = `Error: ${error.status} - ${error.error?.message || error.statusText || 'Error desconocido'}`;
            alert(this.mensajeError);
        }
    });
}

// Método para manejar los checkboxes de proveedores
toggleProveedor(proveedor: string, event: any): void {
  // Inicializar el array si no existe
  if (!this.producto.nombre_proveedor) {
    this.producto.nombre_proveedor = [];
  }

  if (event.target.checked) {
    if (!this.producto.nombre_proveedor.includes(proveedor)) {
      this.producto.nombre_proveedor.push(proveedor);
    }
  } else {
    this.producto.nombre_proveedor = this.producto.nombre_proveedor.filter(p => p !== proveedor);
  }

  console.log('Proveedores actuales:', this.producto.nombre_proveedor);
}

  listaProveedores: string[] = [
    'SuKarne',
    'Sigma Alimentos',
    'Grupo Bafar',
    'Marindustrias',
    'Pescanova',
    'JBS USA',
    'Cargill Meat Solutions',
    'Tyson Foods'
  ];
}
