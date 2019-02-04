import { IProvider } from './iprovider';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subject, Observable } from 'rxjs';
import * as PC from '../constants/project-constants';

export class FirebaseDatabaseProvider<T> implements IProvider<T> {

  table: string;
  instance: any;
  readObject: (key: string) => T;
  writeObject: (ref: { key: string, value: T }) => void;

  constructor(
    public afDB: AngularFireDatabase,
    table: string,
    instance: any
  ) {
    this.instance = instance
    this.table = table
    this.init()
  }

  private init() {
    this.writeObject = (ref) => {
      localStorage.setItem(ref.key, JSON.stringify(ref.value))
    }
    this.readObject = (key) => {
      return JSON.parse(localStorage.getItem(key))
    }
  }

  protected encodeAsBase64(text: string) {
    return PC.StringTools.b64EncodeUnicode(text)
  }

  public persist(ref: { key: string, value: T }): Observable<any> {
    let notifyCreating = new Subject<any>();
    let createObserver = notifyCreating.asObservable();

    this.afDB.list(`/${this.table}`).set(ref.key,
      ref.value
    ).then(res => {
      notifyCreating.next(res)
    }).catch(err => {
      notifyCreating.error(err)
    })
    return createObserver
  }

  public updateRefData(updateRef: { key: string, value: any }, changes: any){
    this.afDB.list(`/${this.table}`, ref => {
      return ref.orderByChild(updateRef.key).equalTo(updateRef.value)
    }).snapshotChanges().subscribe(dataList => {
      dataList.forEach(data => {
        this.afDB.list(
          `/${this.table}`
        ).update(data.key, changes);
      });
    });
}

  public searchById(id: string): Observable<T | any> {
    return this.afDB.list(`/${this.table}`, q => {
      return q.orderByChild('id').equalTo(id)
    }).valueChanges()
  }

  public searchByField(ref: { key: string, value: any }): Observable<T | any> {
    return this.afDB.list(`/${this.table}`, q => {
      return q.orderByChild(ref.key).equalTo(ref.value)
    }).valueChanges()
  }

  public includeDataFromObject(object: object) {
    if (object) {
      let objKeys = Object.keys(object)
      let usrKeys = Object.keys({} as T)
      objKeys.forEach(k => {
        if (usrKeys.includes(k)) {
          this.instance[k] = object[k]
        }
      })
    }
    return this.instance;
  }

}
