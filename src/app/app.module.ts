import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BrMaskerModule } from 'brmasker-ionic-3';

// MODULOS INTERNOS
import { AccessModule } from '../pages/access/acess.module';

// PROVIDERS INTERNOS
import { HandlerFactoryProvider } from '../providers/handler-factory';
import * as PC from '../constants/project-constants'

// FIREBASE
import * as firebaseConfig from '../../api/firebase/firebase-config';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule, AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/auth';
import { UserProvider } from '../providers/user.provider';
import { InteractionProvider } from '../providers/interaction.provider';

// MAPS e LOCALIZAÇÃO
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { LocationProvider } from '../providers/location.provider';
import { Geolocation } from '@ionic-native/geolocation';

// ANIMAÇÕES e UX
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LongPressModule } from 'ionic-long-press';
import { NgRippleModule } from 'ng-ripple-module';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage
  ],
  imports: [
    AccessModule,
    BrowserModule,
    BrowserAnimationsModule,
    BrMaskerModule,
    IonicModule.forRoot(MyApp),
    AgmCoreModule.forRoot({
      apiKey: PC.AGM.apiKey,
      libraries: PC.AGM.libs
    }),
    AgmDirectionModule,
    AgmJsMarkerClustererModule,
    AngularFireModule.initializeApp(firebaseConfig.config),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    LongPressModule,
    NgRippleModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage
  ],
  providers: [
    InteractionProvider,
    LocationProvider,
    UserProvider,
    HandlerFactoryProvider,
    StatusBar,
    SplashScreen,
    AngularFireDatabase,
    AngularFireAuth,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
