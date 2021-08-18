import { Injectable } from '@angular/core';
import { Player } from 'src/models/player.model';
import { Given } from 'src/models/given.model';
import { Cards } from 'src/models/cards.model';
import { MovementsService } from './movements.service';
import { GivenService } from './given.service';
import { StartService } from './start.service';


@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  constructor( public _start: StartService,
                public _given: GivenService
              ) {

              }
  
 //Inicializaciones
  cards: any = new Cards();
  hasStart = false;
  onlyUseOneCard = false;
  start(){
    if(this._start.listaDeJugadores == ''){
      console.error('No hay equipos creados todavía')
      console.warn('Por favor cree 2 o más equipos.')
    }else{
      this._start.listaDeJugadores[0].turn = true;
      console.error('Comienza el juego')
      this.whoTurn();
    }
    this.setCardsStart();
    this.hasStart = true;
  }
  //SERVICIO PARA MANEJAR LOS TURNOS DE LOS JUGADORES
  //Idea principal: Hacer un estado (Si es su turno ponerle true)
  //Hay que habilitar los botones si es su turno
  //El primer jugador que se creó tendrá el primer turno
  //En el modelo player hacer un apartado si es su turno o no


  // shifts(){
  //   this._start.listaDeJugadores
  // }
  nextTurn(number: any){
    if((number + 1) > this._start.listaDeJugadores.length-1){
      this._start.listaDeJugadores[0].turn = true;
      this._start.listaDeJugadores[number].turn = false;
    }else{
      this._start.listaDeJugadores[number+1].turn = true;
      this._start.listaDeJugadores[number].turn = false;
    }
    this.resetAttackPlayers()
    this._given.hasRoll = false;
    this.onlyUseOneCard = false;
  }
  
  whoTurn(){
    for(let i = 0; i < this._start.listaDeJugadores.length; i++){
      if(this._start.listaDeJugadores[i].turn == true){
        console.warn('Turno del equipo ' +  this._start.listaDeJugadores[i].team)
      }
    }
  }

  resetAttackPlayers(){
    for(let i = 0; i < this._start.listaDeJugadores.length; i++){
      this._start.listaDeJugadores[i].powerAttack = 1;
      this._start.listaDeJugadores[i].typeAttack = 0;
    }
  }
  //Funcion que verifica si alguien ganó
  //Esta funcion la verificamos cada vez que hay un movimiento en el tablero
  hasWinner(){
    //La variable win contiene el largo de la lista de los jugadores
    let hasWinner = this._start.listaDeJugadores;
    //Winner es el último que queda en la lista
    let winner;
    //Recorro todos los jugadores
    for(let i = 0; i < this._start.listaDeJugadores.length; i++){
      //Verifico si alguien murio (es decir no tiene soldados) y lo saco de la lista
      if(this._start.listaDeJugadores[i].soldiers <= 0){
        hasWinner.splice(i, 1);
      }
    }
    //Si la variable hasWinner.length llega a 1 significa que tenemos ganador e imprimo el ganador
    if(hasWinner.length === 1){
      alert('Se acabó el juego... Ganó el equipo ' + hasWinner[0].team);
      return hasWinner[0].team;
    }
  }
  setCardsStart(){
    for(let i = 0; i < this._start.listaDeJugadores.length; i++){
      this.giveCard(i);
      this.giveCard(i);
    }
  }
  //Da una carta del maso aleatoria
  giveCard(number: any){
    let max = 12;
    let min = 1;
    let aleatoria = Math.trunc(Math.random() * (max - min) + min);
    //Imprimo el mensaje de la carta
    // console.log('[Nombre]= ' + this.cards[aleatoria].name + ' [Info]= ' + this.cards[aleatoria].info);
    //Le pusheo la carta al array de cartas del jugador
    let cartasJugador = this._start.list[number].cards;
    cartasJugador.push(this.cards[aleatoria]);
    //Imprimo la lista y los nuevos valores
    // console.table(this._start.listaDeJugadores);
    this._given.pickCart = !this._given.pickCart;
  }
}