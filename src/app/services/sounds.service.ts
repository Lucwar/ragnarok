import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundsService {

  constructor() { }

  musicaFondo = new Audio('../assets/musicaFondo.mp3');
  diceEffect = new Audio('../assets/dadosEfecto.mp3');
  swordEffect = new Audio('../assets/espadaEfecto.mp3')
  shofaEffect = new Audio('../assets/shofaEfecto.mp3')
  screamEffect = new Audio('../assets/gritoVikingoEfecto.mp3')
  diceSound(){
    this.diceEffect.play();
    this.diceEffect.currentTime = 0;
  }
  attackSound(){
    this.screamEffect.play();
    this.screamEffect.currentTime = 3;
    this.swordEffect.currentTime = 3;
    this.shofaEffect.currentTime = 0;
    this.shofaEffect.play();
    this.swordEffect.play();
  }
  playMusic() {
    this.musicaFondo.loop = true;
    this.musicaFondo.currentTime = 0;
    this.musicaFondo.play();
  }
  stopMusic(){
    this.musicaFondo.pause();
  }
}
