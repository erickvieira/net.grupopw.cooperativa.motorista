import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { User } from '../models/user.model';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import * as PC from '../constants/project-constants';
import { FirebaseDatabaseProvider } from './firebasedatabase.provider';
import { Observable } from 'rxjs';

@Injectable()
export class UserProvider extends FirebaseDatabaseProvider<User> {

  instance: User
  private userRegistered: boolean

  constructor(
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth,
  ) {
    super(afDB, 'users', new User())
    this.userRegistered = false
  }

  userDBKey(email?: string) {
    if (email && email != '') {
      return PC.StringTools.b64EncodeUnicode(email)
    }
    return PC.StringTools.b64EncodeUnicode(this.instance.email)
  }

  createUser(
    user: User,
    onResult: (result: any) => void,
    onError: (error: any) => void,
    onInvalidPswd: () => void
  ) {
    if (user.password === user.confirm) {
      this.afAuth.auth.createUserWithEmailAndPassword(
        user.email,
        user.password
      ).then(result => {
        this.instance = {
          ...this.instance,
          email: user.email,
          id: result.user.uid,
          created_at: new Date(result.user.metadata.creationTime).getTime(),
          updated_at: new Date(result.user.metadata.creationTime).getTime(),
          password: undefined,
          confirm: undefined,
        } as User
        localStorage.setItem('current_user', JSON.stringify(this.instance))
        onResult(result)
        return
      }).catch(err => {
        console.log('create user error', JSON.stringify(err))
        onError(err)
        return
      })
    } else {
      onInvalidPswd()
    }
  }

  persistUser(): Observable<User> {
    let key = this.encodeAsBase64(this.instance.email)
    return this.persist({key: key, value: this.instance})
  }

  registerCurrentUserAsNewUser() {
    if (!this.userRegistered) {
      let user = JSON.parse(localStorage.getItem('current_user'))
      this.searchUserByDocument(
        user.document,
        data => {
          if (data.length == 0) {
            let key = this.userDBKey()
            console.log('CURRENT_USER:', JSON.stringify(user));
            this.afDB.list(`/users/${key}`).push({
              ...user
            }).then(_ => {
              console.log('==============================================')
              console.warn('USER SAVED')
              console.log('==============================================')
              this.userRegistered = true
            })
          }
        }, _ => {}
      )
    }
  }

  checkCredentials(
    onError: (error: any) => void,
    onSuccess?: () => void
  ) {
    this.afAuth.authState.subscribe(data => {
      if (data && data.email && data.uid) {
        console.log('loading data...')
        this.loadUserData(
          data.uid,
          error => {
            onError(error)
          },
          () => {
            if (onSuccess) onSuccess()
          },
        )
      } else onError({})
    }, error => {
      console.log('get error...')
      onError(error)
      console.log('authState.error', JSON.stringify(error))
    })
  }

  loadUserData(
    uid: string,
    onError: (error: any) => void,
    onSuccess?: () => void,
  ) {
    this.afDB.list('/users', ref => {
      return ref.orderByChild('id').equalTo(uid)
    }).valueChanges().subscribe(
      data => {
        console.log('response:', JSON.stringify(data))
        if (data.length == 0) {
          this.registerCurrentUserAsNewUser()
          return
        } else {
          this.includeDataFromObject(data.pop())
        }
        console.log('user:', JSON.stringify(this.instance))
        if (onSuccess) onSuccess()
      },
      error => {
        onError(error)
        console.error('loadUserData.error', JSON.stringify(error))
      }
    );
  }

  logout() {
    this.instance = new User()
    localStorage.clear()
    this.afAuth.auth.signOut()
  }

  searchUserByDocument(
    document: string,
    onData: (data: any) => void,
    onError: (error: any) => void
  ) {
    this.afDB.list('/users', ref => {
      return ref.orderByChild('document').equalTo(document)
    }).valueChanges().subscribe(
      data => onData(data),
      error => onError(error)
    );
  }

  getAllData(id: string, callback?: (data) => void) {
    this.searchById(id).subscribe(data => {
      if (callback) callback(data)
    }, err => console.error('GET USER DATA', err))
  }

  includeDataFromObject(object: any) {
    return super.includeDataFromObject(object);
  }

}
