import { Component, defineInjectable } from '@angular/core';
import { Player } from 'src/models/player.model';
import { Given } from 'src/models/given.model';
import { Cards } from 'src/models/cards.model';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  //Inicialización de variables
  cards: any = new Cards();
  given: any = new Given();
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
    //Imprimo lista de jugadores
    console.table(this.listaDeJugadores);
  }

  //Funcion que verifica si alguien ganó
  //Esta funcion la verificamos cada vez que hay un movimiento en el tablero
  hasWinner(){
    //La variable win contiene el largo de la lista de los jugadores
    let hasWinner = this.listaDeJugadores.length;
    //Winner es el ganador (seteado en 0 porque aun nadie ganó)
    let winner;
    //Recorro todos los jugadores
    for(let i = 0; i < this.listaDeJugadores.length; i++){
      //Verifico si alguien murio (es decir no tiene soldados) y le resto 1 a la variable hasWinner
      if(this.listaDeJugadores[i].soldiers <= 0){
        hasWinner -= 1;
        //Winner va almacenando al ultimo jugador que le queden soldados vivos
      }else if(this.listaDeJugadores[i].soldiers != 0){
        winner = this.listaDeJugadores[i];
      }
      //Si la variable hasWinner llega a 1 significa que tenemos ganador e imprimo el ganador
      if(hasWinner == 1){
        alert('Se acabó el juego... Ganó el equipo ' + winner.team);
      }
    }
  }
  giveCard(player: any){
    let max = 12;
    let min = 1;
    let aleatoria = Math.trunc(Math.random() * (max - min) + min);
    console.log('[Nombre]= ' + this.cards[aleatoria].name + ' [Info]= ' + this.cards[aleatoria].info);
    this.list[player].cards.push({id: this.cards[aleatoria].id,name: this.cards[aleatoria].name, valor: this.cards[aleatoria].valor});

    console.table(this.listaDeJugadores);
  }

  //Tira un numero al azar (sirve del 1 al 12 y tambien del 1 al 6)
  givenNumber(min: number, max: number){
    //Utilizo la funcion Math.random para tirar un numero al azar
    // Math.trunc para cortar los decimales
    let resultado =  Math.trunc(Math.random() * (max - min) + min);
    //Imprimo el resultado de los 2 dados
    console.info('El resultado es: ' + resultado)
    //Imprimo la acción a ejecutar
    console.info('Acción: ' + this.given[resultado].info)
    return resultado;
  }

  //Funcion para atacar
  //Esta funcion toma al atacante, el defensor y el valor del ataque
  //El valor del ataque lo da el numero
  attack(attacker: any, defender: any, numero: number): any{
    console.error('El jugador ' + this.list[attacker].team + ' atacó al jugador ' + this.list[defender].team);
    let totalStolen = this.list[defender].stealSoldiers;

    //Si el ataque lo mata y lo deja en negativo
    //Devuelve deadSoldiers 0 y queda fuera del juego
    if(this.list[defender].soldiers - numero < 0){
      this.list[defender].soldiers = 0;
      this.list[defender].deadSoldiers = 5;
      console.warn('Las tropas del jugador ' + this.list[defender].team + ' han sido eliminadas.')
      console.table(this.list)
      this.hasWinner();
      return 0;
    }

    //Verifico si el defensor no tenga escudo y el poder de ataque sea positivo
    if(this.list[defender].shield == undefined && numero > 0){
      //En esta apartado prioriza a los soldados robados
      this.prioritizeStolenSoldiers(numero, defender, attacker, totalStolen);
      //En esta parte verifica si EXISTE ESCUDO
    }else if(numero <= this.list[defender].shield.valor && numero > 0){
      //Proxima tarea definir si el escudo es trampa
      if(this.list[defender].shield.type == 'trampa'){
        this.getTrap(attacker, defender, this.list[defender].shield.id);
      }else if(this.list[defender].shield.type == 'escudo'){
        //Si es escudo entra a esta parte
        if(this.list[defender].shield.valor < numero){
          this.prioritizeStolenSoldiers((numero - this.list[defender].shield.valor), defender, attacker, totalStolen);
          this.list[defender].shield = undefined;
          console.warn('El jugador ' + this.list[defender].team + ' pierde el escudo.');
        }else{
          //Se rompio el escudo
          //El escudo es más fuerte que el ataque por lo tanto no muere nadie, solo se rompe el escudo
          this.list[defender].shield = undefined;
          console.warn('El jugador ' + this.list[defender].team + ' se defendió con éxito y pierde el escudo.');
        }

        // //Mato los soldados la diferencia del escudo y del numero
        // this.list[defender].soldiers -= (numero - this.list[defender].shield.valor);
        // //Agrego la cantidad de soldados muertos
        // this.list[defender].deadSoldiers += (numero - this.list[defender].shield.valor);
        // //Imprimo la jugada
        // console.warn('El jugador ' + this.list[defender].team + ' pierde el escudo y ' + (numero - this.list[defender].shield.valor) + ' soldado/s');
        // //Rompo es escudo
        // this.list[defender].shield = undefined;
      }
    }
    console.table(this.listaDeJugadores);
    this.hasWinner();
  }

  getTrap(attacker: any, defender: any, id: Number){
    switch (id){
      case 10011: 
        this.list[defender].stealSoldiers.push( {
          steals: 1,
          to: this.list[attacker].team
        });
        this.list[attacker].soldiers -= 1;
        this.list[defender].shield = undefined;
        console.warn('El jugador ' + this.list[attacker].team + ' cayó en una trampa, le roban 1');
        console.warn('Al jugador ' + this.list[defender].team + ' se le rompe el escudo');
        break;
      case 10100:
        console.warn('ACA SUPUESTAMENTE LE ROBAS 1 CARTA')
        break;
      case 10101: 
        this.list[attacker].soldiers -= 1;
        this.list[attacker].deadSoldiers += 1;
        this.list[defender].shield = undefined;
        console.warn('El jugador ' + this.list[attacker].team + ' cayó en una trampa, se le muere 1');
        console.warn('Al jugador ' + this.list[defender].team + ' se le rompe el escudo');
        break;
      case 10110:
        console.warn('ACA LE DEVUELVE EL ATAQUE X 2')
        break;
    }
  }
  prioritizeStolenSoldiers(numero: any, defender:any, attacker: any, totalStolen: any){
    if(totalStolen != []){
      //Recorro el array de los prisioneros del defensor
      //Se corta cuando no hay más prisioneros o se acabó el poder del ataque
      for(let i = 0; i < this.list[defender].stealSoldiers.length && numero > 0; i++){
        //Si termina con la vida de TODOS los prisioneros del mismo color
        //Elimina ese grupo y pasa al siguiente (hasta que el poder del ataque sea 0 o se acaben los prisioneros)
        if(this.list[defender].stealSoldiers[i].steals - numero <= 0){
          for(let j = 0; j < this.list.length; j++){
            //Verifico la procedencia del prisionero y lo devuelvo a su equipo como muerto
            if(this.list[defender].stealSoldiers[i].to == this.list[j].team){
              this.list[j].deadSoldiers += this.list[defender].stealSoldiers[i].steals;
            }
          }
          //Al poder de ataque le resto la cantidad de soldados prisioneros de un mismo grupo
          numero -= this.list[defender].stealSoldiers[i].steals;
          //Imprime mensaje de la jugada
          console.warn('El jugador ' + this.list[attacker].team + ' mató ' + this.list[defender].stealSoldiers[i].steals
          + ' prisionero/s que pertenecian al jugador ' + this.list[defender].stealSoldiers[i].to
          );
          //Elimina el grupo de prisioneros del mismo equipo
          this.list[defender].stealSoldiers.splice(i, 1);
        }else{
          //Si el poder de ataque es menor que la cantidad de prisioneros
          //Se restan los prisioneros pero sigue habiendo prisioneros
          for(let k = 0; k < this.list.length; k++){
            if(this.list[defender].stealSoldiers[i].to == this.list[k].team){
              this.list[k].deadSoldiers += numero;
            }
          }
          //A la cantidad de prisioneros le resto el poder de ataque
          this.list[defender].stealSoldiers[i].steals -= numero;
          //Imprime el mensaje de la jugada
          console.warn('El jugador ' + this.list[attacker].team + ' mató ' + numero
          + ' prisionero/s que pertenecian al jugador ' + this.list[defender].stealSoldiers[i].to
          );
          //Seteo el poder de ataque en 0 para no seguir con la función (IMPORTANTE)
          numero = 0;
        }
      }
    }
    //Mato los soldados segun el poder de ataque
    this.list[defender].soldiers -= numero;
    this.list[defender].deadSoldiers += numero;
    this.list[defender].shield = undefined;
    if(numero > 0){
      console.warn('El jugador ' + this.list[defender].team + ' perdió ' + numero + ' soldado/s');
    }
  }

  //Usando carta de defensa
  //La funcion recibe un jugador y un id de la carta
  useDefenseCard(defender: any, card: number){
    //Selecciono la carta deseada
    let cardSelected;
    let has = false;
    //Busco la carta deseada por el id
    let claves = Object.keys(this.cards);
    for(let i = 1; i < claves.length; i++){
      if(this.cards[i].id == card){
        cardSelected = this.cards[i];
      }
    }
    //Verifico si el jugador tiene cartas
    if(this.list[defender].cards.length > 0){
      //Si tiene cartas, recorro su lista de cartas
      for(let i = 0; i < this.list[defender].cards.length; i++){
        //Verifico que exista la carta deseada
        if(this.list[defender].cards[i].id == card){
          //Si existe la uso
          has = true;
          this.list[defender].shield = cardSelected;
          this.list[defender].cards.splice(i, 1);
          console.log('Carta usada con exito');
          console.table(this.listaDeJugadores)
          break;
        }
      }
      //El jugador no posee esa carta
      if(!has){
        console.log('No posees esa carta o el id es incorrecto');
      }
    }
  }

  //Esta funcion es obsoleta (la reemplaza useDefenseCard) pero puede servir en un futuro
  //Eliminar si no es usada
  defense(defender: any, cardDefense: Cards, number: number){
    this.list[defender].shield = this.cards[number];
    console.warn('El jugador ' + this.list[defender].team + ' utilizó un escudo.');
    console.table(this.list);
  }

  //Funcion para revivir (a través de dados o de carta)
  //Recibe un jugador y el numero a revivir (si es que tiene soldados muertos)
  revive(defender: any, numero: number){
    //Verifico si tiene soldados muertos
    if(this.list[defender].deadSoldiers > 0){
      //Si hay 3 o menos soldados muertos puedo revivir normal
      if(numero <= this.list[defender].deadSoldiers){
        //Si el numero a revivir es menor a la cantidad de muertos, revivo ese numero.
        this.list[defender].soldiers += numero;
        this.list[defender].deadSoldiers -= numero;
        console.warn('El jugador ' +  this.list[defender].team + ' revivió ' + numero + ' soldados.' );
      }else{
        //Si el numero a revivir es mayor a la cantidad de muertos, revivo todos.
        this.list[defender].soldiers = this.list[defender].deadSoldiers;
        this.list[defender].deadSoldiers = 0;
        console.warn('El jugador ' +  this.list[defender].team + ' revivió ' + this.list[defender].deadSoldiers + ' soldados.' );
      }
    }else{
      //Si no hay muertos no puedes revivir
      //Imprimo la jugada
      console.warn('No puedes revivir');
    }
    console.table(this.list);
  }

  //Funcion para robar un soldado a otro jugador
  stole(attacker: any, defender: any, numero: any){
    //Verificamos que tenga la cantidad de soldados a robar y no tenga escudo.
    if(this.list[defender].soldiers >= numero && this.list[defender].shield == undefined){
      //Agrego a la lista de robados la cantidad de soldados robados
      //Tambien los diferencio por equipo para saber a quien se los robé
      this.list[attacker].stealSoldiers.push( {
        steals: numero,
        to: this.list[defender].team
      });
      //Resto la cantidad de soldados robados a los soldados del defensor
      this.list[defender].soldiers -= numero;
      console.warn('El jugador ' + this.list[attacker].team + ' le roba ' + numero + ' soldados al ' + this.list[defender].team);
    }else if(this.list[defender].shield == undefined) {
      //Si el numero a robar es mayor que la cantidad de soldados
      //Robo todo
      this.list[attacker].stealSoldiers.push( {
        steals: this.list[defender].soldiers,
        to: this.list[defender].team
      });
      //El defensor se quedan sin soldados
      this.list[defender].soldiers = 0;
      this.list[defender].shield = undefined; 
      console.warn('El jugador ' + this.list[attacker].team + ' le roba todos los soldados al ' + this.list[defender].team);
    }
    
    //Si el defensor tiene escudo
    if(this.list[defender].shield !== undefined){
      if(this.list[defender].shield.type == 'trampa'){
        this.getTrap(attacker, defender, this.list[defender].shield.id)
      }else
      //Verifico si el escudo cubre la totalidad del ataque
        if(this.list[defender].shield.valor >= numero){
          //Entra acá si el escudo cubre el ataque
          //Solo rompo el escudo y ya
          this.list[defender].shield = undefined;
          console.warn('El jugador ' + this.list[defender].team + ' se defiende del ataque y pierde el escudo.');
        }else{
          let diference = numero - this.list[defender].shield.valor;
          console.log(numero, this.list[defender].shield.valor, diference)
          //Si el escudo no cubre la totalidad del ataque
          //Robo la diferencia
          this.list[attacker].stealSoldiers.push( {
            steals: diference,
            to: this.list[defender].team
          });
          console.warn('El jugador ' + this.list[defender].team + ' se defiende del ataque, más el escudo no aguanta y le roban ' + diference + ' soldiers.');
          this.list[defender].soldiers -= diference;
          this.list[defender].shield = undefined;
        }
    }
    console.table(this.list);
    this.hasWinner();
  }

  ragnarok(lista: Array<Player>){
    for(let i = 0; i < lista.length; i++){
      lista[i].soldiers = 1;
    }
    console.info('Todos los jugadores se quedan con 1 soldier');
    console.table(this.list);
  }
}
