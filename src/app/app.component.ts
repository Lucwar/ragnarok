import { Component, defineInjectable } from '@angular/core';
import { Player } from 'src/models/player.model';
import { Given } from 'src/models/given.model';
import { Cards } from 'src/models/cards.model';
import { MovementsService } from './services/movements.service';
import { GivenService } from './services/given.service';
import { TurnosService } from './services/turnos.service';
import { StartService } from './services/start.service';
import { SoundsService } from './services/sounds.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public _mov: MovementsService,
              public _given: GivenService, 
              public _shifts: TurnosService,
              public _start: StartService,
              public _sound: SoundsService
              ) {
                _sound.playMusic();
               }

 
}