import { Component } from '@angular/core';
import { NavController, NavParams, Events, AlertController } from 'ionic-angular';
import { HandlerFactoryProvider } from '../../../../providers/handler-factory';
import { User } from '../../../../models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as PC from '../../../../constants/project-constants';
import { UserProvider } from '../../../../providers/user.provider';
import { LoginPage } from '../../login/login';
import { InteractionProvider } from '../../../../providers/interaction.provider';
import { HomePage } from '../../../home/home';
import { Car } from '../../../../models/driver.model';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'page-register-security-data',
  templateUrl: 'register.security-data.html',
})
export class RegisterSecurityDataPage {

  registerForm: FormGroup
  includeCarForm: FormGroup
  passwordAccepted = false
  updatingProfile = false
  carIncluded = false
  colors = [
    'amarelo',
    'azul',
    'branco',
    'cinza',
    'dourado',
    'laranjado',
    'perolado',
    'prata',
    'preto',
    'rosa',
    'roxo',
    'verde',
    'vermelho',
    'vinho',
    'OUTRA'
  ]
  readonly anotherColor = this.colors[this.colors.length - 1]
  anotherColorSelected = false
  carrierSizes = [{ 
    key: 'pequeno', 
    value: 'small',
  }, {
    key: 'médio',
    value: 'medium',
  }, {
    key: 'grande',
    value: 'large',
  }]

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public afAuth: AngularFireAuth,
    public intCtrl: InteractionProvider,
    public alertCtrl: AlertController,
    public userProvider: UserProvider,
    public handFac: HandlerFactoryProvider,
    public eventCtrl: Events,
  ) {
    this.updatingProfile = navParams.data['updatingProfile']
    this.userProvider.instance.car = new Car();

    this.includeCarForm = formBuilder.group({
      model: [
        this.userProvider.instance.car.model,
        Validators.required,
      ],
      id: [
        this.userProvider.instance.car.id,
        Validators.compose([
          Validators.pattern(/^[A-Z]{3}[\s-]?[\d]{4}$/g),
          Validators.minLength(7),
          Validators.maxLength(8),
          Validators.required
        ]),
      ],
      color: [
        this.userProvider.instance.car.color,
        Validators.required,
      ],
      carrier_size: [
        this.userProvider.instance.car.carrier_size,
        Validators.required,
      ]
    })

    this.registerForm = formBuilder.group({
      email: [
        this.userProvider.instance.email,
        Validators.compose([
          Validators.email,
          Validators.required
        ])
      ], password: [
        this.userProvider.instance.password,
        Validators.compose([
          Validators.pattern(PC.PATTERNS.PASSWORD),
          Validators.required
        ])
      ], confirm: [
        this.userProvider.instance.confirm,
        Validators.compose([
          Validators.pattern(PC.PATTERNS.PASSWORD),
          Validators.required
        ])
      ],
    })
  }

  ngAfterViewInit() {
    this.eventCtrl.subscribe('#previus_profile', () => {
      this.updatingProfile = true
    })
  }

  ionViewWillLeave() {
    this.eventCtrl.unsubscribe('#previous_profile')
  }

  checkIfIsAnotherColor(color: string) {
    this.anotherColorSelected = color == this.anotherColor
    if (this.anotherColorSelected) {
      this.includeCarForm.controls['color'].setValue('')
    }
  }

  private camelize(target: string) {
    let result = target.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return " "
      return index == 0 ? match.toLowerCase() : match.toUpperCase()
    });
    let arrStr = result.split('')
    let firstChar = arrStr.shift()
    let rest = arrStr.join('')
    return firstChar.toUpperCase() + rest
  }

  includeVehicleData() {
    let car = this.includeCarForm.value as Car
    this.userProvider.updateRefData({
      key: 'email',
      value: this.userProvider.instance.email
    }, {
      car: {
        ...car
      }
    })

    this.carIncluded = true;
    this.intCtrl.genericAlert(
      'CADASTRADO',
      `Seja bem-vind${ this.userProvider.instance.gender == 'F' ? 'a' : 'o' },
      ${this.userProvider.instance.name}!`
    )

    localStorage.setItem('dbUser', JSON.stringify(this.userProvider.instance))
    this.navCtrl.setRoot(HomePage, { uid: this.userProvider.instance.id })
  }

  includeVehicleDataWithValidation() {
    console.clear()
    console.log('INCLUDING CAR', this.includeCarForm.value as Car)
    let vm = this
    this.alertCtrl.create({
      title: 'Senha',
      message: 'Precisamos confirmar sua identidade antes de prosseguir.',
      inputs: [{
        name: 'email',
        type: 'email',
        placeholder: 'Digite seu email de login'
      }, {
        name: 'password',
        type: 'password',
        placeholder: 'Digite sua senha'
      }],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: _ => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirmar',
          handler: alertForm => {
            vm.intCtrl.presentLoading('Carregando...')
            vm.afAuth.auth.signInWithEmailAndPassword(
              alertForm.email,
              alertForm.password
            ).then(_ => {
              vm.intCtrl.decisionAlert(
                'CONFIRMAÇÃO',
                'Tem certeza que deseja incluir este carro? Essa ação não pode ser desfeita.',
                {
                  text: 'sim',
                  callback: () => {
                    vm.userProvider.instance = {
                      ...vm.userProvider.instance,
                      email: alertForm.email,
                      password: alertForm.password
                    }
                    vm.includeVehicleData()
                  }
                }
              )
            })
          }
        }
      ]
    }).present();
  }

  register() {
    let user = this.registerForm.value as User
    this.intCtrl.presentLoading('Carregando...')
    this.userProvider.createUser(
      user,
      (_) => {
        console.log('RegisterSecurityDataPage', JSON.stringify(this.userProvider.instance))
        this.includeVehicleData()
        return
      }, (error) => {
        console.error('RegisterSecurityDataPage', JSON.stringify(error))
        this.userProvider.instance = new User();
        this.intCtrl.genericAlert('CADASTRO NÃO REALIZADO', PC.FIREBASE_CREATING_USER_ERROS[error.code])
        this.includeVehicleData()
        this.navCtrl.push(LoginPage)
        return
      }, () => {
        console.log('RegisterSecurityDataPage', 'onInvalidPass')
        this.intCtrl.genericAlert(
          'SENHAS INVÁLIDAS',
          'Por favor, informe senhas idênticas nos dois campos.',
          () => console.error(`${user.password} != ${user.confirm}`)
        )
        this.userProvider.instance.email = user.email;
        this.navCtrl.pop()
        this.navCtrl.push(RegisterSecurityDataPage)
      }
    )
  }
}
