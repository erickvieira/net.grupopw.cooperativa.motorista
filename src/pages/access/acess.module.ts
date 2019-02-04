import { NgModule } from '@angular/core';
import { LoginPage } from './login/login';
import { IonicModule, IonicPageModule } from 'ionic-angular';
import { RegisterPersonalDataPage } from './register/personal-data/register.personal-data';
import { BrMaskerModule } from 'brmasker-ionic-3';
import { RegisterSecurityDataPage } from './register/security-data/register.security-data';

@NgModule({
  declarations: [
    LoginPage,
    RegisterPersonalDataPage,
    RegisterSecurityDataPage,
  ],
  imports: [
    BrMaskerModule,
    IonicModule,
    IonicPageModule.forChild(RegisterPersonalDataPage),
    IonicPageModule.forChild(RegisterSecurityDataPage),
    IonicPageModule.forChild(LoginPage),
  ],
  entryComponents: [
    LoginPage,
    RegisterPersonalDataPage,
    RegisterSecurityDataPage,
  ],
  providers: [
  ]
})
export class AccessModule {}
