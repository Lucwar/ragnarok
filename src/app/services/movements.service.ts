import { Injectable } from '@angular/core';
import { Player } from 'src/models/player.model';
import { Given } from 'src/models/given.model';
import { Cards } from 'src/models/cards.model';
import { TurnosService } from './turnos.service';
import { GivenService } from './given.service';
import { StartService } from './start.service';
import { identifierModuleUrl, RecursiveVisitor } from '@angular/compiler';
import { SoundsService } from './sounds.service';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

@Injectable({
  providedIn: 'root'
})
export class MovementsService {

  
  constructor(public _shifts: TurnosService,
              public _start: StartService, 
              public _given: GivenService,
              public _sound: SoundsService
              ) { 
              }
  //Inicialización de las variables
  cards: any = new Cards();
  powerAttack: any = 1;
  typeAttack: any = 0;
    //Funcion para atacar
    //Esta funcion toma al atacante, el defensor y el valor del ataque
    //El valor del ataque lo da el numero
    attack(attacker: any, defender: any, numero: number): any{
      console.log(numero)
      this.powerAttack = numero;
      this._start.list[attacker].powerAttack = this.powerAttack;
      console.log(this._start.list[attacker].powerAttack, this._start.list[attacker])
      this._start.list[attacker].typeAttack = 0;
      console.error('El jugador ' + this._start.list[attacker].team + ' atacó al jugador ' + this._start.list[defender].team);
      let totalStolen = this._start.list[defender].stealSoldiers;
  
      //Verifico si el defensor no tenga escudo y el poder de ataque sea positivo
      if(this._start.list[defender].shield == undefined){
        //En esta apartado prioriza a los soldados robados
        this.prioritizeStolenSoldiers(this.powerAttack, defender, attacker, totalStolen, false);
        this._sound.attackSound();
        //En esta parte verifica si EXISTE ESCUDO
      }else{
        //Proxima tarea definir si el escudo es trampa
        if(this._start.list[defender].shield.type == 'trampa'){
          this.getTrap(attacker, defender, this._start.list[defender].shield.id);
        }else if(this._start.list[defender].shield.type == 'escudo'){
          //Si es escudo entra a esta parte
          if(this._start.list[defender].shield.valor < this.powerAttack){
            this.prioritizeStolenSoldiers((this.powerAttack - this._start.list[defender].shield.valor), defender, attacker, totalStolen, false);
            this._start.list[defender].shield = undefined;
            console.warn('El jugador ' + this._start.list[defender].team + ' pierde el escudo.');
          }else{
            //Se rompio el escudo
            //El escudo es más fuerte que el ataque por lo tanto no muere nadie, solo se rompe el escudo
            this._start.list[defender].shield = undefined;
            console.warn('El jugador ' + this._start.list[defender].team + ' se defendió con éxito y pierde el escudo.');
          }
  
          // //Mato los soldados la diferencia del escudo y del numero
          // this._start.list[defender].soldiers -= (numero - this._start.list[defender].shield.valor);
          // //Agrego la cantidad de soldados muertos
          // this._start.list[defender].deadSoldiers += (numero - this._start.list[defender].shield.valor);
          // //Imprimo la jugada
          // console.warn('El jugador ' + this._start.list[defender].team + ' pierde el escudo y ' + (numero - this._start.list[defender].shield.valor) + ' soldado/s');
          // //Rompo es escudo
          // this._start.list[defender].shield = undefined;
        }
      }
      this._shifts.nextTurn(attacker);
      this._shifts.whoTurn();
      console.table(this._start.listaDeJugadores);
      this._shifts.hasWinner();
      // this.limpieza();
      this._given.hasRoll = false;
    }
  
    //Si la defensa es una trampa (es decir no es escudo)
    getTrap(attacker: any, defender: any, id: Number){
      switch (id){
        //Caso de trampa 1
        case 10011: 
          this.stole(attacker, defender, this.powerAttack, true);
          console.warn('El jugador ' + this._start.list[attacker].team + ' cayó en una trampa, le roban 1');
          //SE ROMPE EL ESCUDO
          this._start.list[defender].shield = undefined;
          console.warn('Al jugador ' + this._start.list[defender].team + ' se le rompe el escudo');
          break;
        //Caso de trampa 2
        case 11101: 
          this.prioritizeStolenSoldiers(this._start.list[attacker].powerAttack, attacker, defender, this._start.list[attacker].stealSoldiers, true)
          console.warn('El jugador ' + this._start.list[attacker].team + ' cayó en una trampa, se le muere 1');
          //SE ROMPE EL ESCUDO
          this._start.list[defender].shield = undefined;
          console.warn('Al jugador ' + this._start.list[defender].team + ' se le rompe el escudo');
          break;
        //Caso de trampa 3
        case 10100:
          let cartasDefender = this._start.list[defender].cards;
          let cartasAttacker = this._start.list[attacker].cards;
          this._start.list[defender].shield = undefined;
          if(cartasAttacker.length != 0){
            cartasDefender.push(cartasAttacker[0]);
            cartasAttacker.splice(0, 1);
            console.warn('El jugador ' + this._start.list[attacker].team + ' cayó en una trampa, le roban 1 carta');
          }else{
            console.warn('El jugador ' + this._start.list[attacker].team + ' cayó en una trampa, sin embargo se salvó');
          }
          //SE ROMPE EL ESCUDO
          console.warn('Al jugador ' + this._start.list[defender].team + ' se le rompe el escudo');
          break;
        //Caso de trampa 4 Espejito
        case 10101: 
          if(this._start.list[attacker].typeAttack == 0){
            //Priorizo los jugadores robadores y devuelvo el ataque
            this.prioritizeStolenSoldiers(this._start.list[attacker].powerAttack, attacker, defender, this._start.list[attacker].stealSoldiers, true);
            console.warn('El jugador ' + this._start.list[attacker].team + ' cayó en una trampa, se le muere ' + this._start.list[attacker].powerAttack + ' soldado/s');
          }else{
            this.stole(attacker, defender, this.powerAttack, true);
            console.warn('El jugador ' + this._start.list[attacker].team + ' cayó en una trampa, le roban ' + this._start.list[attacker].powerAttack + ' soldado/s');
          }
          //SE ROMPE EL ESCUDO
          this._start.list[defender].shield = undefined;
          console.warn('Al jugador ' + this._start.list[defender].team + ' se le rompe el escudo');
          break;
        //Caso de trampa 5 Espejito x 3
        case 10110:
          if(this._start.list[attacker].typeAttack == 0){
          this.prioritizeStolenSoldiers(this._start.list[attacker].powerAttack * 2, attacker, defender, this._start.list[attacker].stealSoldiers, true);
          console.warn('El jugador ' + this._start.list[attacker].team + ' cayó en una trampa, se le mueren ' + this._start.list[attacker].powerAttack * 2);
          }else{
            this.stole(attacker, defender, this.powerAttack * 2, true);
            console.warn('El jugador ' + this._start.list[attacker].team + ' cayó en una trampa, le roban ' + this._start.list[attacker].powerAttack + ' soldado/s');
          }
          //SE ROMPE EL ESCUDO
          this._start.list[defender].shield = undefined;
          console.warn('Al jugador ' + this._start.list[defender].team + ' se le rompe el escudo');
          break;
      }
    }
    prioritizeStolenSoldiers(numero: any, defender:any, attacker: any, totalStolen: any, isTrap: boolean){
      if(totalStolen != []){
        //Recorro el array de los prisioneros del defensor
        //Se corta cuando no hay más prisioneros o se acabó el poder del ataque
        for(let i = 0; i < this._start.list[defender].stealSoldiers.length && numero > 0; i++){
          //Si termina con la vida de TODOS los prisioneros del mismo color
          //Elimina ese grupo y pasa al siguiente (hasta que el poder del ataque sea 0 o se acaben los prisioneros)
          if(this._start.list[defender].stealSoldiers[i].steals - numero <= 0){
            for(let j = 0; j < this._start.list.length; j++){
              //Verifico la procedencia del prisionero y lo devuelvo a su equipo como muerto
              if(this._start.list[defender].stealSoldiers[i].to == this._start.list[j].team){
                this._start.list[j].deadSoldiers += this._start.list[defender].stealSoldiers[i].steals;
              }
            }
            //Al poder de ataque le resto la cantidad de soldados prisioneros de un mismo grupo
            numero -= this._start.list[defender].stealSoldiers[i].steals;
            //Imprime mensaje de la jugada
            !isTrap ? console.warn('El jugador ' + this._start.list[attacker].team + ' mató ' + this._start.list[defender].stealSoldiers[i].steals
            + ' prisionero/s que pertenecian al jugador ' + this._start.list[defender].stealSoldiers[i].to
            ) : console.warn('El jugador ' + this._start.list[attacker].team + ' perdió ' + this._start.list[defender].stealSoldiers[i].steals
            + ' prisionero/s que pertenecian al jugador ' + this._start.list[defender].stealSoldiers[i].to
            );
            //Elimina el grupo de prisioneros del mismo equipo
            this._start.list[defender].stealSoldiers.splice(i, 1);
          }else{
            //Si el poder de ataque es menor que la cantidad de prisioneros
            //Se restan los prisioneros pero sigue habiendo prisioneros
            for(let k = 0; k < this._start.list.length; k++){
              if(this._start.list[defender].stealSoldiers[i].to == this._start.list[k].team){
                this._start.list[k].deadSoldiers += numero;
              }
            }
            //A la cantidad de prisioneros le resto el poder de ataque
            this._start.list[defender].stealSoldiers[i].steals -= numero;
            //Imprime el mensaje de la jugada
            !isTrap ? console.warn('El jugador ' + this._start.list[attacker].team + ' mató ' + numero
            + ' prisionero/s que pertenecian al jugador ' + this._start.list[defender].stealSoldiers[i].to
            ) : console.warn('El jugador ' + this._start.list[attacker].team + ' perdió ' + numero
            + ' prisionero/s que pertenecian al jugador ' + this._start.list[defender].stealSoldiers[i].to
            );
            //Seteo el poder de ataque en 0 para no seguir con la función (IMPORTANTE)
            numero = 0;
          }
        }
      }
      //Mato los soldados segun el poder de ataque
      this._start.list[defender].soldiers -= numero;
      this._start.list[defender].deadSoldiers += numero;
      if(numero > 0){
        console.warn('El jugador ' + this._start.list[defender].team + ' perdió ' + numero + ' soldado/s');    
      }
    }
  
    //Usando carta de defensa
    //La funcion recibe un jugador y un id de la carta
    useCard(user: any, idCard: any):any{
      //Selecciono la carta deseada
      let cardSelected = -1;
      let positionCard: any;
      let has = false;
      //Verifico si el jugador tiene cartas
      if(this._start.list[user].cards.length > 0){
        //Busco la carta deseada por el id
        for(let i = 0; i < this._start.list[user].cards.length; i++){
          if(this._start.list[user].cards[i].id == idCard){
            cardSelected = this._start.list[user].cards[i];
            positionCard = i;
          }
        }
        //Verifico que exista la carta deseada
          if(positionCard >= 0){
            //Si existe la uso
            has = true;

            switch(this._start.list[user].cards[positionCard].type){
              case "ataque": 
                if(this._start.list[user].cards[positionCard].id == 11010){
                  this._start.list[user].powerAttack *= 2;
                  this._start.list[user].cards.splice(positionCard,1);
                }else
                if(this._start.list[user].cards[positionCard].id == 11001){
                  this._start.list[user].powerAttack = this._given.dado1;
                  this._start.list[user].cards.splice(positionCard,1);
                  this._given.hasRoll = false;
                }else
                if(this._start.list[user].cards[positionCard].id == 11100){
                  this.ragnarok(this._start.list[user]);
                  this._start.list[user].cards.splice(positionCard,1);
                }
                break;
              case "trampa" :
                this._start.list[user].shield = cardSelected;
                this._start.list[user].cards.splice(positionCard,1);
                break;
              case "escudo" :
                this._start.list[user].shield = cardSelected;
                this._start.list[user].cards.splice(positionCard,1);
                break;
              case "revivir" :
                if(this._start.list[user].deadSoldiers > 0){
                  this.revive(user, this._start.list[user].cards[positionCard].valor);
                  this._start.list[user].cards.splice(positionCard,1);
                }else{
                  console.warn('No puedes usar esta carta.');
                  return 0;
                }
                break;
            }
            console.log('Carta usada con exito.');
            console.table(this._start.listaDeJugadores);
          }
        //El jugador no posee esa carta
        if(!has){
          console.log('No posees esa carta o el id es incorrecto');
          return 0;
        }
      }
      this._shifts.onlyUseOneCard = true;
    }

    //Funcion para revivir (a través de dados o de carta)
    //Recibe un jugador y el numero a revivir (si es que tiene soldados muertos)
    revive(defender: any, numero: any){
      //Verifico si tiene soldados muertos
      if(this._start.list[defender].deadSoldiers > 0){
        //Si hay 3 o menos soldados muertos puedo revivir normal
        if(numero <= this._start.list[defender].deadSoldiers){
          //Si el numero a revivir es menor a la cantidad de muertos, revivo ese numero.
          this._start.list[defender].soldiers += numero;
          this._start.list[defender].deadSoldiers -= numero;
          console.warn('El jugador ' +  this._start.list[defender].team + ' revivió ' + numero + ' soldados.' );
        }else{
          //Si el numero a revivir es mayor a la cantidad de muertos, revivo todos.
          this._start.list[defender].soldiers += this._start.list[defender].deadSoldiers;
          console.warn('El jugador ' +  this._start.list[defender].team + ' revivió ' + this._start.list[defender].deadSoldiers + ' soldados.' );
          this._start.list[defender].deadSoldiers = 0;
        }
      }else{
        //Si no hay muertos no puedes revivir
        //Imprimo la jugada
        console.warn('No tienes soldados para revivir');
      }
      console.table(this._start.list);
    }
  
    //Funcion para robar un soldado a otro jugador
    stole(attacker: any, defender: any, numero: any, isTrap: boolean){
      this.powerAttack = numero;
      this._start.list[attacker].powerAttack = this.powerAttack;
      this._start.list[attacker].typeAttack = 1;
      //SI NO VIENE DE UNA TRAMPA
      if(!isTrap){
        console.error('El jugador ' + this._start.list[attacker].team + ' atacó al jugador ' + this._start.list[defender].team);
        //Verificamos que tenga la cantidad de soldados a robar y no tenga escudo.
        if(this._start.list[defender].soldiers >= this.powerAttack && this._start.list[defender].shield == undefined){
          //Priorizo primero robar los soldados ya robados
          if(this._start.list[defender].stealSoldiers.length > 0){
            this.prioritizenStolenSoldiersInStole(defender, attacker, this.powerAttack);
          }else{
            //Agrego a la lista de robados la cantidad de soldados robados
            //Tambien los diferencio por equipo para saber a quien se los robé
            this._start.list[attacker].stealSoldiers.push({
              steals: this.powerAttack,
              to: this._start.list[defender].team
            });
            //Resto la cantidad de soldados robados a los soldados del defensor
            this._start.list[defender].soldiers -= this.powerAttack;
            console.warn('El jugador ' + this._start.list[attacker].team + ' le roba ' + this.powerAttack + ' soldados al ' + this._start.list[defender].team);
          }
        }else if(this._start.list[defender].shield == undefined) {
          if(this._start.list[attacker].stealSoldiers != []){
            this.prioritizenStolenSoldiersInStole(attacker, defender, this.powerAttack);
          }else{
            //Si el numero a robar es mayor que la cantidad de soldados
            //Robo todo
            this._start.list[attacker].stealSoldiers.push( {
              steals: this._start.list[defender].soldiers,
              to: this._start.list[defender].team
            });
            //El defensor se quedan sin soldados
            this._start.list[defender].soldiers = 0;
            this._start.list[defender].shield = undefined; 
            console.warn('El jugador ' + this._start.list[attacker].team + ' le roba todos los soldados al ' + this._start.list[defender].team);
          }
        }
        
        //Si el defensor tiene escudo
        if(this._start.list[defender].shield !== undefined){
          if(this._start.list[defender].shield.type == 'trampa'){
            this.getTrap(attacker, defender, this._start.list[defender].shield.id)
          }else
          //Verifico si el escudo cubre la totalidad del ataque
            if(this._start.list[defender].shield.valor >= this.powerAttack){
              //Entra acá si el escudo cubre el ataque
              //Solo rompo el escudo y ya
              this._start.list[defender].shield = undefined;
              console.warn('El jugador ' + this._start.list[defender].team + ' se defiende del ataque y pierde el escudo.');
            }else{
              let diference = this.powerAttack - this._start.list[defender].shield.valor;
              if(this._start.list[attacker].stealSoldiers != []){
                this.prioritizenStolenSoldiersInStole(attacker, defender, diference);
                this._start.list[defender].shield = undefined;
                console.warn('El jugador ' + this._start.list[defender].team + ' se defiende del ataque, más el escudo no aguanta y le roban ' + diference + ' soldiers.');
              }
              if(diference > 0){
                //Si el escudo no cubre la totalidad del ataque
                //Robo la diferencia
                this._start.list[attacker].stealSoldiers.push( {
                  steals: diference,
                  to: this._start.list[defender].team
                });
                console.warn('El jugador ' + this._start.list[defender].team + ' se defiende del ataque, más el escudo no aguanta y le roban ' + diference + ' soldiers.');
                this._start.list[defender].soldiers -= diference;
                this._start.list[defender].shield = undefined;
              }
            }
          }
          this._shifts.nextTurn(attacker);
          console.table(this._start.list);
          this._shifts.whoTurn();
          this._shifts.hasWinner();
    
          this._given.hasRoll = false;
      }else{
        //SI VIENE DE UNA TRAMPA
        //Pregunto si el atacante tiene soldados robados
        if(this._start.list[attacker].stealSoldiers != []){
          this.prioritizenStolenSoldiersInStole(attacker, defender, this.powerAttack);
        }
        //Si se le acabaron la lista de soldados robados o no tiene soldados robados entra acá
        if(this.powerAttack >= this._start.list[attacker].soldiers){
          console.warn('El jugador ' +  this._start.list[defender].team + ' roba ' 
                              + this._start.list[attacker].soldiers
                              + ' soldados de ' + this._start.list[attacker].team);
          this._start.list[defender].stealSoldiers.push( {
            steals: this._start.list[attacker].soldiers,
            to: this._start.list[attacker].team
          });
          this._start.list[attacker].soldiers = 0;
        }else if(this.powerAttack > 0){
          console.warn('El jugador ' +  this._start.list[defender].team + ' roba ' 
                              + this.powerAttack 
                              + ' soldados de ' + this._start.list[attacker].team);
          this._start.list[attacker].soldiers -= this.powerAttack;
          this._start.list[defender].stealSoldiers.push( {
            steals: this.powerAttack,
            to: this._start.list[attacker].team
          });
        }
      }
    }

    prioritizenStolenSoldiersInStole(attacker: any, defender: any, numero: any){
      this.powerAttack = numero;
      //Recorro la lista de los soldados robados hasta que no haya más o se acabe el poder de ataque
      for(let i = 0; i < this._start.list[attacker].stealSoldiers.length && this.powerAttack > 0; i++){
        //Pregunto si los soldados a robar son del propio jugador
        if(this._start.list[attacker].stealSoldiers[i].to == this._start.list[defender].team && this.powerAttack > 0){
          //Me fijo cuantos robados del defensor tiene
          if(this.powerAttack >= this._start.list[attacker].stealSoldiers[i].steals){
            console.warn('El jugador ' +  this._start.list[defender].team + ' libera a ' 
                          + this._start.list[attacker].stealSoldiers[i].steals 
                          + ' soldados de su equipo de las manos del ' + this._start.list[attacker].team);
            this._start.list[defender].soldiers += this._start.list[attacker].stealSoldiers[i].steals;
            this.powerAttack -= this._start.list[attacker].stealSoldiers[i].steals;
            this._start.list[attacker].stealSoldiers.splice(i, 1);
          }else{
            console.warn('El jugador ' +  this._start.list[defender].team + ' libera a ' 
                          + this.powerAttack 
                          + ' soldados de su equipo de las manos del ' + this._start.list[attacker].team);
            this._start.list[defender].soldiers += this.powerAttack;
            this._start.list[attacker].stealSoldiers[i].steals -= this.powerAttack;
            this.powerAttack -= this._start.list[attacker].stealSoldiers[i].steals;
          }
        }else 
        if(this.powerAttack >= this._start.list[attacker].stealSoldiers[i].steals){
          console.warn('El jugador ' +  this._start.list[defender].team + ' roba ' 
                          + this._start.list[attacker].stealSoldiers[i].steals
                          + ' soldados que pertenecian a ' + this._start.list[attacker].stealSoldiers[i].to);
          this._start.list[defender].stealSoldiers.push(this._start.list[attacker].stealSoldiers[i]);
          this.powerAttack -= this._start.list[attacker].stealSoldiers[i].steals;
          this._start.list[attacker].stealSoldiers.splice(i, 1);
        }else{
          console.warn('El jugador ' +  this._start.list[defender].team + ' roba ' 
                          + this.powerAttack
                          + ' soldados que pertenecian a ' + this._start.list[attacker].stealSoldiers[i].to);
          this._start.list[defender].stealSoldiers.push({steals: this._start.list[attacker].stealSoldiers[i].steals - this.powerAttack,
                                                          to: this._start.list[attacker].stealSoldiers[i].to});
          // this._start.list[attacker].stealSoldiers[i].steals -= numero;
          this.powerAttack -= this._start.list[attacker].stealSoldiers[i].steals;
        }
      }
    }
    //Robar cartas (Con la funcion del dado)
    stoleCard(attacker: any, defender: any, number: Number){
      let cartasDefender = this._start.list[defender].cards;
      let cartasAttacker = this._start.list[attacker].cards;
      if(cartasDefender.length != 0){
        if(cartasDefender.length >= number && number == 2){
          cartasAttacker.push(cartasDefender[0]);
          cartasAttacker.push(cartasDefender[1]);
          cartasDefender.splice(0, 2);
        }else{
          cartasAttacker.push(cartasDefender[0]);
          cartasDefender.splice(0, 1)
        }
      }else{
        console.log('El jugador no tiene cartas disponibles en su maso.')
      }
      this._shifts.nextTurn(attacker);
      console.table(this._start.list);
      this._shifts.whoTurn();
      this._shifts.hasWinner();
      this._given.hasRoll = false;
    }
    autoDeath(user: any, numero: any){
      this._start.list[user].soldiers -= numero;
      this._start.list[user].deadSoldiers += numero;
      console.warn('Hubo peleas en el equipo ' + this._start.list[user].team + ' y murieron ' + numero + ' soldados.')
      console.table(this._start.list);
    }
    ragnarok(lista: Array<Player>){
      for(let i = 0; i < lista.length; i++){
        lista[i].soldiers = 1;
      }
      console.info('Todos los jugadores se quedan con 1 soldier');
      console.table(this._start.list);
    }
}
