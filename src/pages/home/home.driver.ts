import { AngularFireDatabase } from "@angular/fire/database";
import { Platform } from "ionic-angular";
import { Travel } from "../../models/user.model";

export class HomeDriverAuxPage {

  travelsRef
  travelsList = []
  travelsCount = 0

  constructor(
    public afDB: AngularFireDatabase,
    public platform: Platform
  ) {
    this.travelsRef = afDB.list('travels', q => {
      return q.orderByChild('driver').equalTo(undefined)
    })
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.travelsRef.valueChanges().subscribe((travels: Travel[]) => {
        this.travelsCount = travels.length
        this.travelsList = travels
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

}