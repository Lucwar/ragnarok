import { Injectable } from '@angular/core';
import { Player } from 'src/models/player.model';
import { Given } from 'src/models/given.model';
import { Cards } from 'src/models/cards.model';
import { MovementsService } from './movements.service';
import { TurnosService } from './turnos.service';
import { StartService } from './start.service';
import { SoundsService } from './sounds.service';

@Injectable({
  providedIn: 'root'
})
export class GivenService {

  //Inicialización de las variables
  given: any = new Given();

  constructor( 
              public _start: StartService,
              public _sound: SoundsService
              ) {
              }
              
              
  dado1:any;
  dado2: any;
  resultado: any;
  hasRoll = false;
  pickCart = false;
  dados:any = [];

  //Tira un numero al azar (sirve del 1 al 12 y tambien del 1 al 6)
  givenNumber(min: number, max: number){
    //Utilizo la funcion Math.random para tirar un numero al azar
    this.dados[0] =  Math.trunc(Math.random() * (max - min) + min);
    this.dados[1] =  Math.trunc(Math.random() * (max - min) + min);
    // Math.trunc para cortar los decimales
    //Imprimo el resultado de los 2 dados
    //Imprimo la acción a ejecutar
    this.resultado = this.dados[0] + this.dados[1];
    this.hasRoll = true;
    this.pickCart = false;
    console.info('El resultado es: ' + this.resultado)
    console.info('Acción: ' + this.given[this.resultado].info)
    this._sound.diceSound();
  }
}
