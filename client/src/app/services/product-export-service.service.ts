import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Producto } from '../../app/services/almacenista.service'; // Adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class ProductExportService {
  constructor() { }

  exportToExcel(productos: Producto[], nombreArchivo: string = 'productos'): void {
    // Prepare data with specific columns
    const exportData = productos.map(producto => ({
      codigo_barras: producto.codigo_barras,
      nombre_producto: producto.nombre_producto,
      categoria: producto.categoria,
      precio_caja: producto.precio_caja,
      precio_pieza: producto.precio_pieza,
      existencia_almacen: producto.existencia_almacen,
      existencia_exhibe: producto.existencia_exhibe
    }));

    // Create a worksheet with the specific columns
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    // Create a workbook
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    // Generate the Excel file
    XLSX.writeFile(workbook, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  exportToCsv(productos: Producto[], nombreArchivo: string = 'productos'): void {
    // Prepare data with specific columns
    const exportData = productos.map(producto => ({
      codigo_barras: producto.codigo_barras,
      nombre_producto: producto.nombre_producto,
      categoria: producto.categoria,
      precio_caja: producto.precio_caja,
      precio_pieza: producto.precio_pieza,
      existencia_almacen: producto.existencia_almacen,
      existencia_exhibe: producto.existencia_exhibe
    }));

    // Convert the list of products to CSV
    const csvContent = this.convertToCSV(exportData);

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a download link
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private convertToCSV(productos: any[]): string {
    if (productos.length === 0) {
      return '';
    }

    // Explicitly define headers in the desired order
    const headers = [
      'codigo_barras',
      'nombre_producto',
      'categoria',
      'precio_caja',
      'precio_pieza',
      'existencia_almacen',
      'existencia_exhibe'
    ];

    // Create the header line
    const csvRows = [
      headers.join(',')
    ];

    // Add each product as a row
    for (const producto of productos) {
      const values = headers.map(header => {
        let value = producto[header];

        // Handle values that may contain commas
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
          value = `"${value}"`;
        }

        return value;
      });

      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}
