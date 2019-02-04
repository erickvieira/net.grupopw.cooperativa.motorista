import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class HandlerFactoryProvider {

  private concat = {};

  constructor() {}

  make(..._: object[]) {
    for (let i = 0; i < arguments.length; i++) {
      this.concat = {...this.concat, ...arguments[i]}
    }
    return this.concat
  }

  decompose(ref: object, target?: object) {
    let t = target ? target : this.concat;
    let concatKeys = Object.keys(t);
    let refKeys = Object.keys(ref) as Array<any>;
    let result = {};

    concatKeys.forEach(k => {
      if (refKeys.includes(k)) {
        if (typeof refKeys[k] === typeof concatKeys[k]) {
          result[k] = t[k];
        }
      }
    });

    return result;
  }

}
