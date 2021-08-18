import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MovementsService } from './services/movements.service';
import { GivenService } from './services/given.service';
import { TurnosService } from './services/turnos.service';
import { StartService } from './services/start.service';


import { AppComponent } from './app.component';
import { Given } from 'src/models/given.model';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgbModule
  ],
  providers: [MovementsService, GivenService, TurnosService, StartService],
  bootstrap: [AppComponent]
})
export class AppModule { }
