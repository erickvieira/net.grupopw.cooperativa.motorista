import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/access/login/login';
import { UserProvider } from '../providers/user.provider';
import { HTTP } from '@ionic-native/http';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  templateUrl: 'app.html',
  providers: [
    HTTP,
  ]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;
  connected = false
  loading = true
  loadingText = 'Estabelecendo conexão...'

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public userProv: UserProvider,
    public menu: MenuController,
    public http: HTTP,
    public afDB: AngularFireDatabase,
  ) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [{
      title: 'Tela Inicial',
      component: HomePage
    }];

  }

  ngOnDestroy(): void {
    this.afDB.object(`/online_drivers/${btoa(this.userProv.instance.email)}`).remove()
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // this.statusBar.backgroundColorByHexString('#ffffff')
      this.statusBar.styleBlackTranslucent()
      this.statusBar.styleLightContent()
      this.splashScreen.hide()
      this.http.get(
        'https://google.com',
        undefined,
        undefined
      ).then(_ => {
        this.connected = true
        this.loading = false
        this.loadingText = 'Conectando...'
      }).catch(err => {
        console.error('APP.HTTP.GET', err)
        this.connected = false
        this.loading = false
        this.loadingText = 'Isso está demorando...'
      })
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component)
  }

  logout() {
    this.menu.close()
    this.nav.setRoot(this.rootPage).then(data => {
      this.afDB.object(
        `/online_drivers/${btoa(this.userProv.instance.email)}`
      ).remove().then(_ => {
        this.userProv.logout()
      })
    })
  }

}
