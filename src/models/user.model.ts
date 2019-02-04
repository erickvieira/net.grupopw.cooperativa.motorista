import { Car } from "./driver.model";
import { duration } from "moment";

export class User {
  public id: string;
  public picture?: string;
  public last_loc?: Coords;
  public name = '';
  public document = '';
  public gender = '';
  public birthday: Date = null;
  public phone = '';
  public email = '';
  public password? = '';
  public confirm? = '';
  public created_at: number;
  public updated_at: number;
  public active: boolean = true;
  public car?: Car = undefined;
  public verified: boolean = false;
}

export class Travel {
  readonly id: string
  passenger: string
  driver?: string
  origin: Coords
  originAddress?: string
  destin?: Coords
  destinAddress?: string
  duration: {
    prevision: number
    real?: number
  }
  distance: number
  km_value?: number
  created_at: number
  updated_at: number
}

export class Coords {
  lat: number
  lng: number
  checkin?: number
}
