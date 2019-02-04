import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Driver } from '../models/driver.model';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { FirebaseDatabaseProvider } from './firebasedatabase.provider';
import { Events } from 'ionic-angular';

@Injectable()
export class OnlineDriversProvider extends FirebaseDatabaseProvider<AngularFireList<Driver>> {

  public instance: Driver[] = undefined
  public selectedDriver: Driver = undefined

  constructor(
    public afDB: AngularFireDatabase,
    private eventCtrl: Events
  ) {
    super(afDB, 'online_drivers', undefined)
  }

  getAllDrivers(callback?: (drivers) => void) {
    this.searchByField({key: 'available', value: true}).subscribe(drivers => {
      this.instance = drivers
      this.eventCtrl.publish('#online_drivers')
      console.warn('ALL DRIVERS', JSON.stringify(this.instance))
      if (callback) callback(this.instance)
    }, error => console.error('ALL DRIVERS', JSON.stringify(error)))
  }

}
