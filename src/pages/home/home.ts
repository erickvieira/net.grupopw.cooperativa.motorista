import { Component, AfterViewInit, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core'
import { NavController, MenuController, NavParams, Events, ActionSheetController, Platform } from 'ionic-angular'
import { UserProvider } from '../../providers/user.provider'
import { InteractionProvider } from '../../providers/interaction.provider'
import { LoginPage } from '../access/login/login'
import * as PC from '../../constants/project-constants'
import { FormControl } from '@angular/forms';
import { MapsAPILoader, AgmCircle } from '@agm/core';
import { LocationProvider } from '../../providers/location.provider';
import { Geolocation } from '@ionic-native/geolocation';
import { OnlineDriversProvider } from '../../providers/driver.provider';
import { style, animate, transition, trigger } from '@angular/animations';
import { User, Travel, Coords } from '../../models/user.model';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SMS, SmsOptions } from '@ionic-native/sms';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { HTTP } from '@ionic-native/http';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'page-home',
  animations: [
    trigger('easyInOutVer', [
      transition(':enter', [
        style({
          bottom: 35,
          opacity: 0
        }),
        animate(150, style({
          bottom: 65,
          opacity: 1
        })),
        animate(100, style({
          bottom: 55,
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate(100, style({
          opacity: 0,
          bottom: 45,
        }))
      ]),
    ]), trigger('easyInOutVerDelay250', [
      transition(':enter', [
        style({
          bottom: 35,
          opacity: 0
        }),
        animate(150 + 250, style({
          bottom: 65,
          opacity: 1
        })),
        animate(100 + 250, style({
          bottom: 55,
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate(100, style({
          opacity: 0,
          bottom: 45,
        }))
      ]),
    ]), trigger('scaleInOutHor', [
      transition(':enter', [
        style({
          width: 0,
          opacity: 0
        }),
        animate(150, style({
          width: 110,
          opacity: 1
        })),
        animate(100, style({
          width: 105,
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate(100, style({
          opacity: 0,
          width: 0,
        }))
      ]),
    ]), trigger('fadeInOut', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate(150, style({
          opacity: 0
        })),
        animate(300, style({
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate(100, style({
          opacity: 0
        }))
      ]),
    ])
  ],
  templateUrl: 'home.html',
  providers: [
    OnlineDriversProvider,
    UserProvider,
    LocationProvider,
    Geolocation,
    SMS,
    InAppBrowser,
    HTTP,
  ]
})
export class HomePage implements AfterViewInit, OnInit {

  readonly mapStyles = PC.AGM.styles
  travel = {
    origin: { lat: undefined, lng: undefined },
    destin: { lat: undefined, lng: undefined },
    destinAddress: '',
    distance: 0,
    duration: 0,
    ready: false,
  }
  apiKey = PC.AGM.apiKey
  mapCenter = PC.AGM.default.coords
  zoomLevel = PC.AGM.default.zoom.unfocused
  typingAddress = false
  wantFastTravel = false
  automaticUpdateLocation = true
  insideTheState = false
  searchingDeviceLocation = true

  showDriverData = false
  nearbyDrivers: any[] = undefined
  selectedDriver: User = undefined

  travelsRef: AngularFireList<Travel | any>
  travelsList: Travel[] = []
  travelsCount = 0

  uid: string = undefined

  readonly refreshPage = () => {
    this.navCtrl.setRoot(
      this.navCtrl.getActive().component
    ).then(_ => {
      this.eventCtrl.unsubscribe('#online_drivers')
      this.eventCtrl.unsubscribe('#marker_position')
    })
  }

  @ViewChild('searchRadius', { read: AgmCircle }) searchReadiusRef: AgmCircle
  @ViewChild('mainDirection') directionRef: ElementRef
  @ViewChild('mapsAutoComplete') searchElementRef: ElementRef
  searchControl: FormControl

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public menu: MenuController,
    public userProv: UserProvider,
    public drivProv: OnlineDriversProvider,
    public intProv: InteractionProvider,
    public actionSheetCtrl: ActionSheetController,
    public mapsAPILoader: MapsAPILoader,
    public locProv: LocationProvider,
    public geolocation: Geolocation,
    public sms: SMS,
    public iab: InAppBrowser,
    public ngZone: NgZone,
    public eventCtrl: Events,
    public afDB: AngularFireDatabase,
    public platform: Platform,
    public http: HTTP,
    public sanitizer: DomSanitizer,
  ) {
    this.userProv.instance = JSON.parse(localStorage.getItem('dbUser'))
    this.travelsRef = afDB.list('travels', q => {
      return q.orderByChild('driver').equalTo('')
    })
    console.log('Hello for HomePage')
    menu.enable(true)
    this.drivProv.getAllDrivers()
    this.setCurrentPosition(PC.AGM.default.coords)
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.travelsRef.valueChanges().subscribe((travels: Travel[]) => {
        this.travelsCount = travels.length
        this.travelsList = travels
        this.travelsList.forEach(travel => {
          let stand_time = Math.ceil(moment.duration(moment.now() - travel.created_at).asMinutes()) - 120
          travel['stand_time'] = stand_time
        })
        let notification = {
          id: +(travels[0].id),
          text: (this.travelsCount > 1 ? `${this.travelsCount} novas viagens disponíveis.` : 'Uma nova viagem está disponível.'),
          data: {
            secret: `Encontramos alguns passageiros para você em Goiânia. Acesse o app para mais informações.`
          }
        }
      })
    })
  }

  confirmTravel(index: number) {
    let did = this.userProv.instance.id
    this.travelsList[index].driver = did ? did : this.navParams.data.uid
  }

  openOnWaze(travel: Travel) {
    let wazeNavigationUrl = `https://www.waze.com/ul?ll=${travel.origin.lat}%2C${travel.origin.lng}&navigate=yes&zoom=17`
    this.intProv.decisionAlert(
      'ACEITAR CORRIDA', 
      `Tem certeza que deseja aceitar esta corrida? Se sim, avisaremos 
      o passageiro que você está a caminho.`,
      {
        text: 'Sim, aceito', 
        callback: () => {
          this.intProv.decisionAlert(
            'Abrir o Waze?', 
            `Deseja ver o trajeto até o passageiro no Waze?`,
            {
              text: 'Sim, por favor', 
              callback: () => {
                // this.travelsList[this.travelsList.indexOf(travel)]['driver'] = this.uid
                this.afDB.list('/travels').valueChanges().subscribe(travels => {
                  let updated = false
                  travels.forEach(t => {
                    if (t['id'] == travel.id) {
                      updated = true
                      t['driver'] = travel.driver
                    }
                  })

                  if (updated == false) {
                    this.intProv.genericAlert('ERRO', 'Outro motorista já pegou esta corrida.')
                  } else this.iab.create(wazeNavigationUrl, '_system')
                })
              }
            }, {
              text: 'Não, cancele a viagem',
              callback: () => {}
            }
          )
        }
      }
    )
  }

  openOnMaps(travel: Travel) {
    let googleMapsRoutesUrl = `https://www.google.com/maps/dir/?api=1&origin=${travel.origin.lat},%20${travel.origin.lng}&destination=${travel.destin.lat},%20${travel.destin.lng}&travelmode=driving`
    this.intProv.decisionAlert(
      'ATENÇÃO', 
      `A corrida não será confirmada até você clicar no botão "aceitar". 
      Deseja ver o trajeto da localização atual do usuário até o destino 
      da viagem no Google Maps?`,
      {
        text: 'Abrir no Maps', 
        callback: () => {
          this.iab.create(googleMapsRoutesUrl, '_system')
        }
      }, {
        text: 'Cancelar',
        callback: () => {}
      }
    )
  }

  sanitizeTravelMapPreview(travel: Travel) {
    let baseUrl = 'http://maps.googleapis.com/maps/api/staticmap?center=' + 
      travel.origin.lat + ',%20' + travel.origin.lng + 
      '&zoom=15&size=400x200&maptype=roadmap&key=AIzaSyBZxYL4CcU9gFKlkgW3E_WDt_RpMXbwHDA';
    return this.sanitizer.bypassSecurityTrustStyle(`url(${baseUrl})`);
  }

  ngOnInit(): void {
    this.initMapsAutoComplete()
    this.observeDevicePosition()
    this.filterOnlineDrivers()
  }

  ngAfterViewInit(): void {
    this.userProv.checkCredentials(() => {
      this.navCtrl.setRoot(LoginPage)
    })
  }

  ngOnDestroy(): void {
    this.eventCtrl.unsubscribe('#online_drivers')
    this.eventCtrl.unsubscribe('#marker_position')
  }

  filterOnlineDrivers() {
  }

  observeDevicePosition() {
    setInterval(() => {
      this.getCurrentPosition()
    }, 500)
  }

  getCurrentPosition(): void {
    let key = `${btoa(this.userProv.instance.email)}`
    console.log(this.userProv.instance.email, key)
    let driverId = localStorage.getItem('driverId')
    let driver = {
      available: true,
      id: driverId,
      last_loc: this.userProv.instance.last_loc
    }
    if (driver.id) {
      this.afDB.list('/online_drivers').set(
        key, driver
      )
    } else console.error('USER.ID', this.userProv.instance)
    this.geolocation.getCurrentPosition({ enableHighAccuracy: false }).then(resp => {
      if (this.automaticUpdateLocation && !this.typingAddress && !this.travel.ready) {
        this.setCurrentPosition(resp.coords && resp.coords.latitude && resp.coords.longitude ? {
          lat: resp.coords.latitude,
          lng: resp.coords.longitude,
        } : PC.AGM.default.coords)
        console.log('location updated', JSON.stringify(this.userProv.instance.last_loc))
      }
    }).catch(err => {
      // if (this.automaticUpdateLocation) this.intProv.genericToast(`${err.code} ${err.message}`)
    })
  }

  initMapsAutoComplete(): void {
    this.searchControl = new FormControl();
    this.autoCompleteListener();
  }

  setCurrentPosition(position?: { lat: number, lng: number }) {
    if (position && position.lat && position.lng) {
      this.userProv.instance.last_loc = {
        ...position,
        checkin: Date.now()
      }
      if (position != PC.AGM.default.coords) {
        this.searchingDeviceLocation = false
      }
      this.mapCenter = position
      if (this.travel.ready) {
        this.travel.origin = position
      }
      this.zoomLevel = PC.AGM.default.zoom.focused
      this.eventCtrl.publish('#marker_position')
    }
  }

  getAddressAttribute(
    place: google.maps.places.PlaceResult,
    search_type: string,
    length_type?: string
  ) {
    let result: any = place.address_components.find((element) => {
      return typeof element.types.find((type) => { return type === search_type }) != 'undefined';
    });
    if (result) {
      result = (length_type) ? result[length_type] : result['short_name'];
    } else {
      result = ''
    }
    return result;
  }

  autoCompleteListener() {
    if (this.searchElementRef) {
      this.mapsAPILoader.load().then(() => {
        let autoComplete = new google.maps.places.Autocomplete(
          this.searchElementRef.nativeElement,
          { componentRestrictions: { country: 'br' } },
        );
        autoComplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            let place: google.maps.places.PlaceResult = autoComplete.getPlace();
            if (place.geometry === undefined || place.geometry === null) {
              console.error('No geometry was encontred.')
              return;
            }
            let currentZone = this.getAddressAttribute(place, 'administrative_area_level_1', 'short_name')
            this.insideTheState = [ 'GO', 'DF' ].includes(currentZone)
            this.travel.destinAddress = this.getAddressAttribute(place, 'premise', 'long_name')
            this.travel.origin = this.userProv.instance.last_loc
            this.travel.destin = place.geometry.location.toJSON() as {lat: number, lng: number}
            this.zoomLevel = PC.AGM.default.zoom.focused
          });
        });
      }).catch(error => {
        throw error
      });
    }
  }

  ceiledDistance() {
    return Math.ceil(this.travel.distance)
  }

  findADriverForFastTravel() {
    this.intProv.genericAlert(
      'A CAMINHO',
      'O motorista chegará na sua localização em breve!'
    )
    this.wantFastTravel = false
  }

  findADriver(event: any) {
    if (this.insideTheState) {
      this.updateTravelDistance()
      this.typingAddress = false
      this.travel.ready = true
    } else {
      this.travel.destin = undefined
      this.intProv.genericAlert(
        'Destino Inválido',
        `O destino selecionado está fora da nossa área de cobertura.`
      )
    }
  }

  onMapClick(event: any) {
    console.log('map.clickEvent')
  }

  onMarkerDrag(event: any) {
    this.automaticUpdateLocation = false;
    if (event.coords) {
      this.intProv.genericSnackbar(
        'Você alterou o local combinado com o motorista. Agora ele vai te buscar no local onde o marcador foi colocado, e não mais na localização do seu aparelho.'
      )
      this.setCurrentPosition(event.coords)
    }
    console.log('marker.dragEvent', JSON.stringify(event))
  }

  startObservePositionAgain() {
    this.automaticUpdateLocation = true;
    this.searchingDeviceLocation = true;
    this.intProv.genericSnackbar('O motorista vai chegar até você através da localização do aparelho.', 2000)
  }

  updateTravelDistance() {
    let page = this
    new google.maps.DirectionsService().route({
      origin: this.travel.origin,
      destination: this.travel.destin,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        let distanceInMeters = response.routes[0].legs[0].distance.value / 1000
        let durationInSeconds = Math.ceil(response.routes[0].legs[0].duration.value / 60)
        page.travel.distance = distanceInMeters
        page.travel.duration = durationInSeconds
      }
    })
  }

  getDriverInfo() {
    if (this.nearbyDrivers.length == 0) {
      this.intProv.genericAlert('Oops!', 'Desculpe, mas não há motoristas disponíveis na sua região.')
    } else {
      let random = Math.floor(
        Math.random() * this.nearbyDrivers.length
      )
      let selected = this.nearbyDrivers[random]
      this.userProv.getAllData(selected.id, (data) => {
        this.selectedDriver = data[0] as User
        this.showDriverData = true
        let pic = this.selectedDriver.picture
        const defaultPic = './assets/icon/default-contact.png'
        let name = this.selectedDriver.name
        this.selectedDriver.name = `${name.split(' ')[0]} ${name.split(' ')[1]}`
        this.selectedDriver.picture = pic ? pic : defaultPic
        this.travel.destin = this.selectedDriver.last_loc
        this.intProv.genericAlert('Aguarde', 'O motorista está a caminho.')
        console.log('SELECTED DRIVER:', JSON.stringify(this.selectedDriver))
      })
    }
  }

  showDriverDetailedInfo() {
    let btnSearchImages = {
      text: `${this.selectedDriver.car.model}, ${this.selectedDriver.car.color}`,
      icon: 'logo-google',
      handler: () => {
        this.iab.create(`https://www.google.com/search?tbm=isch&q=${btnSearchImages.text}`, '_system')
      }
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: ``,
      enableBackdropDismiss: true,
      buttons: [{
        text: `Enviar SMS para ${this.selectedDriver.name.split(' ')[0]}`,
        icon: 'mail',
        handler: () => {
          this.sms.send(
            this.selectedDriver.phone,
            'Olá',
            {
              android: {
                intent: 'INTENT'
              }
            } as SmsOptions
          )
        }
      }, {
        ...btnSearchImages
      }, {
        text: 'Fechar',
        icon: 'close',
        role: 'destructive',
      }]
    });
    actionSheet.present();
  }

}
