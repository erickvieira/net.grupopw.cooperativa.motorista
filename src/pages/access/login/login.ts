import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { HomePage } from '../../home/home';
import { HandlerFactoryProvider } from '../../../providers/handler-factory';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { User } from '../../../models/user.model';
import { RegisterPersonalDataPage } from '../register/personal-data/register.personal-data';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserProvider } from '../../../providers/user.provider';
import { InteractionProvider } from '../../../providers/interaction.provider';
import * as PC from '../../../constants/project-constants';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  loginForm: FormGroup
  registerPage = RegisterPersonalDataPage

  constructor(
    public navCtrl: NavController,
    public handFac: HandlerFactoryProvider,
    public menu: MenuController,
    public afDataBase: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public formBuilder: FormBuilder,
    public userProv: UserProvider,
    public intProv: InteractionProvider,
  ) {
    menu.enable(false)
    this.loginForm = formBuilder.group({
      email: [
        this.userProv.instance.email,
        Validators.required
      ], password: [
        this.userProv.instance.password,
        Validators.required
      ],
    });
  }

  login() {
    let user = this.loginForm.value as User
    const auth = this.afAuth.auth
    console.log(user.email, user.password)
    if (user.email && user.email != '' && user.password && user.password != '') {
      auth.signInWithEmailAndPassword(user.email, user.password).then(
        data => {
          localStorage.setItem('driverId', data.user.uid)
          this.userProv.searchByField({
            key: 'email',
            value: data.user.email
          }).subscribe(dbUser => {
            this.userProv.instance = dbUser[0] as User
            console.log('\n\n\n[ USER INSTANCE ] : ' + JSON.stringify(this.userProv.instance) + '\n\n\n')
            localStorage.setItem('dbUser', JSON.stringify(dbUser[0]))
            if (dbUser[0].car) {
              this.navCtrl.setRoot(HomePage, { uid: data.user.uid })
            } else {
              console.error(dbUser[0])
              this.intProv.genericAlert('Oops', 'Parece que você não é um motorista.')
            }
          })
        }
      ).catch(err => {
        this.intProv.genericAlert('FALHA NO LOGIN', PC.FIREBASE_LOGIN_ERROS[err.code])
        console.error(err)
      })
    } else {
      this.intProv.genericAlert(
        'DADOS INVÁLIDOS',
        `Por favor, informe um e-mail e uma senha para efetuar o login.`
      )
    }
  }

}
