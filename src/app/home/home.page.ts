import { Component } from '@angular/core';
import {
  AlertController, IonButton, IonContent, IonHeader,
  IonTitle, IonToolbar,
} from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage {
  // Ubicaciones fijas: cámbialas por tu casa, el parque, etc.
  destino = { lat: -0.229415, lng: -78.524581 };
  paradas = [
    { lat: -0.201452, lng: -78.498124 },
    { lat: -0.220164, lng: -78.512328 },
  ];

  urlUbicacion = '';
  urlRuta = '';

  constructor(private alertCtrl: AlertController) {}

  async obtenerUbicacion() {
    try {
      await Geolocation.requestPermissions();
    } catch {
      /* en el navegador no existe; se ignora */
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    const { latitude: lat, longitude: lng } = pos.coords;

    // 1. Enlace a mi posición
    this.urlUbicacion = `https://www.google.com/maps/@${lat},${lng},17z`;

    // 2. Enlace de la ruta (origen = mi posición actual)
    const waypoints = this.paradas.map(p => `${p.lat},${p.lng}`).join('%7C');
    this.urlRuta =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${lat},${lng}` +
      `&destination=${this.destino.lat},${this.destino.lng}` +
      `&waypoints=${waypoints}`;
  }

  async abrir(ev: Event, url: string) {
    ev.preventDefault();
    await Browser.open({ url });
  }

  // 3 y 4. Guardar en .txt
  async guardarTxt(nombre: string, contenido: string) {
    try {
      const res = await Filesystem.writeFile({
        path: `gps/${nombre}`,
        data: contenido,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true,
      });
      await this.avisar('Archivo guardado', res.uri);
    } catch (e) {
      await this.avisar('Error al guardar', String(e));
    }
  }

  guardarUbicacion() { return this.guardarTxt('ubicacion.txt', this.urlUbicacion); }
  guardarRuta()      { return this.guardarTxt('ruta.txt', this.urlRuta); }

  private async avisar(header: string, message: string) {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }
}