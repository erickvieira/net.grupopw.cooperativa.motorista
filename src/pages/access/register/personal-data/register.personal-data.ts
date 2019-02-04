import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Events } from 'ionic-angular';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { HandlerFactoryProvider } from '../../../../providers/handler-factory';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as PC from '../../../../constants/project-constants';
import { UserProvider } from '../../../../providers/user.provider';
import { RegisterSecurityDataPage } from '../security-data/register.security-data';
import { InteractionProvider } from '../../../../providers/interaction.provider';
import { LoginPage } from '../../login/login';
import { User } from '../../../../models/user.model';
import { DriverInvitation } from '../../../../models/driver.model';
import * as moment from 'moment'
import { timestamp } from 'rxjs/internal/operators/timestamp';

@Component({
  selector: 'page-register-personal-data',
  templateUrl: 'register.personal-data.html',
})
export class RegisterPersonalDataPage {

  registerForm: FormGroup

  updatingAPreviusProfile = false
  invalidTicket = true
  driverTicketForm: FormGroup
  driverTicket: DriverInvitation

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public formBuilder: FormBuilder,
    public toastCtrl: ToastController,
    public userProv: UserProvider,
    public handFac: HandlerFactoryProvider,
    public intCtrl: InteractionProvider,
    public eventCtrl: Events,
  ) {
    this.driverTicket = { email: undefined, code: undefined }
    this.driverTicketForm = formBuilder.group({
      email: [
        this.driverTicket.email,
        Validators.compose([
          Validators.email,
          Validators.required,
        ])
      ],
      code: [
        this.driverTicket.code,
        Validators.compose([
          Validators.pattern(/^([a-f]|[\d]){6}$|^([a-f]|[\d]){8}$/gi),
          Validators.required,
        ])
      ]
    })
    this.registerForm = formBuilder.group({
      name: [
        this.userProv.instance.name,
        Validators.compose([
          Validators.minLength(3),
          Validators.required
        ])
      ], document: [
        this.userProv.instance.document,
        Validators.compose([
          Validators.minLength(14),
          Validators.required
        ])
      ], gender: [
        this.userProv.instance.gender,
      ], birthday: [
        this.userProv.instance.birthday,
        Validators.required
      ], phone: [
        this.userProv.instance.phone,
        Validators.compose([
          Validators.minLength(15),
          Validators.pattern(PC.PATTERNS.PHONE),
          Validators.required
        ])
      ],
    })
  }

  monitoring(stuff) {
    console.log('MONITORING', stuff)
  }

  ionViewDidEnter() {
    let vm = this
    this.eventCtrl.subscribe('#invalid_credentials', () => {
      this.intCtrl.genericAlert(
        'ERRO',
        `O convite informado está vencido ou não é válido. 
        Entre em contato conosco para mais informações.`,
        () => {
          vm.navCtrl.setRoot(LoginPage)
        }
      )
    })
    this.eventCtrl.subscribe('#previus_profile', () => {
      this.intCtrl.genericAlert(
        '',
        `Você já possui um cadastro como passageiro. 
        Usaremos os dados deste seu cadastro. Por favor, 
        apenas clique em "próximo passo".`
      )
    })
  }

  ionViewWillLeave() {
    this.eventCtrl.unsubscribe('#invalid_credentials')
    this.eventCtrl.unsubscribe('#previus_profile')
  }

  insertInvitation() {
    this.afDB.list('/invites').set(btoa('erick-vieira-s@outlook.com'), {
      code: '000bbbff',
      created_at: 1548608099081,
      email: 'erick-vieira-s@outlook.com'
    })
  }

  checkCredentials() {
    if (this.driverTicketForm.valid) {
      this.intCtrl.presentLoading('Carregando...')
      this.driverTicket = this.driverTicketForm.value as DriverInvitation
      this.afDB.list(`/invites`, q => {
        return q.orderByChild('email').equalTo(this.driverTicket.email)
      }).valueChanges().subscribe(data => {
        if (!data || !data[0] || !(data[0] as DriverInvitation).created_at) {
          this.eventCtrl.publish('#invalid_credentials')
          return
        }

        let invitation = data[0] as DriverInvitation
        this.invalidTicket = data == undefined || invitation == undefined
        this.invalidTicket = this.invalidTicket || invitation.code != this.driverTicket.code

        let createdAt = moment.duration(moment.now() - invitation.created_at).asMilliseconds()
        let twoWeeks = moment.duration({ weeks: 2 }).asMilliseconds()
        this.invalidTicket = this.invalidTicket || createdAt > twoWeeks

        if (this.invalidTicket) {
          this.eventCtrl.publish('#invalid_credentials')
        } else {
          this.intCtrl.presentLoading('Carregando...')
          this.afDB.object(
            `/invites/${btoa(invitation.email)}`
          ).remove().then(_ => {
            console.log('REMOVED:', invitation)
            this.userProv.searchByField({ 
              key: 'email', 
              value: invitation.email
            }).subscribe(data => {
              this.userProv.instance = data[0] as User
              for (let key in this.userProv.instance) {
                if (this.registerForm.controls[key]) {
                  this.registerForm.controls[key].setValue(this.userProv.instance[key])
                  this.registerForm.controls[key].disable()
                  this.updatingAPreviusProfile = true
                  this.eventCtrl.publish('#previus_profile')
                }
              }
              console.error(`USER [ ${invitation.email} ] FOUND:`, this.userProv.instance)
            }, err => {
              this.userProv.instance = new User()
              console.error(`USER [ ${invitation.email} ] NOT FOUND:`, err.message)
            })
          }).catch(err => {
            console.error('ERROR:', err.message)
            console.error('WHILE ROMOVING:', invitation)
          })
        }
      })
    }
  }

  nextStep() {
    this.userProv.instance = new User();
    for (let v in this.registerForm.value) {
      this.userProv.instance[v] = this.registerForm.value[v]
    }
    console.log('[ ADD USER ]', this.userProv.instance)
    this.userProv.includeDataFromObject(this.registerForm.value)
    this.intCtrl.presentLoading('Carregando...')
    this.userProv.searchUserByDocument(
      this.userProv.instance.document,
      data => {
        if (data == 0 || this.updatingAPreviusProfile) {
          this.navCtrl.push(RegisterSecurityDataPage, {
            updatingProfile: this.updatingAPreviusProfile
          })
        } else {
          this.userProv.instance = new User();
          this.intCtrl.genericAlert(
            'CPF INVÁLIDO',
            `O CPF informado já está em uso em outra conta.
            Se você já fez seu cadastro antes nesse App, use seu e-mail
            e senha na tela de login. Caso não seja você, entre em contato
            conosco através do número: ${PC.PHONE_CONTACT}, para resolvermos
            o problema.`
          )
          this.navCtrl.setRoot(LoginPage)
        }
      }, error => {
        this.userProv.instance = new User();
        this.intCtrl.genericAlert(
          'FALHA NA COMUNICAÇÃO',
          `Infelizmente não conseguimos contactar nossos servidores.
          Por favor, tente novamente mais tarde. Caso o problema
          persista, entre em contato através do número:
          ${PC.PHONE_CONTACT}.`
        )
        this.navCtrl.setRoot(LoginPage)
        console.error(JSON.stringify(error))
      }
    )
  }
}
