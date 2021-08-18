import { Injectable } from '@angular/core';
import { Player } from 'src/models/player.model';
import { Given } from 'src/models/given.model';
import { Cards } from 'src/models/cards.model';
import { MovementsService } from './movements.service';
import { GivenService } from './given.service';
import { TurnosService } from './turnos.service';

@Injectable({
  providedIn: 'root'
})
export class StartService {

  constructor(){}
  //Inicialización de las variables
  listaDeJugadores: any = [];
  list: any = this.listaDeJugadores;
  


  //Creo un jugador de tipo "Player" con un "team" especifico
  createPlayer(team: string){
    //Creo al jugador
    let newPlayer = new Player();
    //Asigno el team al jugador
    newPlayer.team = team;
    //Lo agrego a la lista de jugadores
    this.listaDeJugadores.push(newPlayer);
    //Imprimo mensaje que se ha creado un nuevo equipo
    console.error('El equipo ' + newPlayer.team + ' ha sido creado.')
    //Imprimo lista de jugadores
    console.table(this.listaDeJugadores);
  }
}
