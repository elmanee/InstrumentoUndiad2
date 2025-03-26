// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlmacenistaComponent } from './features/almacenista/almacenista.component';
import { InventarioComponent } from './features/almacenista/inventario/inventario.component';
import { AgregarProductoComponent } from './features/almacenista/agregar-producto/agregar-producto.component';
import { ProductosComponent } from './productos/productos.component';
import { VendedorPasilloComponent } from './vendedor-pasillo/vendedor-pasillo.component';

const routes: Routes = [
  { path: 'almacenista', component: AlmacenistaComponent, data: { title: 'Almacenista' } },
  { path: 'inventario', component: InventarioComponent, data: { title: 'Inventario' } },
  { path: 'agregar-productos', component: AgregarProductoComponent, data: { title: 'Agregar Productos' } },
  { path: 'cliente', component: ProductosComponent, data: { title: 'Cliente' } },
  { path: 'vendedor-pasillo', component: VendedorPasilloComponent, data: { title: 'Vendedor de Pasillo' } },
  { path: '', redirectTo: '/almacenista', pathMatch: 'full' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
