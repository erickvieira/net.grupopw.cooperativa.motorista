import { Injectable } from '@angular/core';
import 'rxjs/add/observable/fromPromise';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class LocationProvider {

  private notify = new Subject<Geoposition>();
  locationObserver = this.notify.asObservable();

  constructor(
    private geolocation: Geolocation,
  ) {}

  watchPosition(
    interval: number,
    onSuccess: (data: Geoposition) => void,
    onFailure: (error: any) => void
  ) {
    setInterval(() => {
      this.getCurrentPosition();
      this.locationObserver.subscribe((data) => {
        onSuccess(data);
      }, error => onFailure(error));
    }, interval ? interval : 20000);
  }

  getCurrentPosition() {
    this.geolocation.getCurrentPosition({
      enableHighAccuracy: true
    }).then((data: Geoposition) => {
      this.notify.next(data);
    }).catch(error => {
      this.notify.error(error);
    });
  }

}
