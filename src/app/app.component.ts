import { Component, defineInjectable } from '@angular/core';
import { Player } from 'src/models/player.model';
import { Given } from 'src/models/given.model';
import { Cards } from 'src/models/cards.model';
import { MovementsService } from './services/movements.service';
import { GivenService } from './services/given.service';
import { TurnosService } from './services/turnos.service';
import { StartService } from './services/start.service';
import { SoundsService } from './services/sounds.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // content = document.getElementsByClassName('content');
  
  constructor(public _mov: MovementsService,
              public _given: GivenService, 
              public _shifts: TurnosService,
              public _start: StartService,
              public _sound: SoundsService,
              public config: NgbModalConfig, 
              private modalService: NgbModal
              ) {
                _sound.playMusic();
               }
               isOptionListVisible = false;
               onTabPress($event:any) {
                /*
                Here you will press tab or shift+tab. 
                In both the cases this.isOptionListVisible will be set to false.
                <input
                    type="text"
                    (keydown)="onTabPress($event)"
                    />
                */
                if ($event.key === 'm') {
                  this.isOptionListVisible = !this.isOptionListVisible;
                }
                this.config.backdrop = 'static';
                this.config.keyboard = false;
              }
              open(content: any) {
                // console.log(this.content);
                this.modalService.open(content);
              }
}