"use client";
import { Howl } from "howler";

export const buttonSounds = {
  click: new Howl({
    src: ["/audio/sfx/click/bubble.ogg"],
    preload: true,
    volume: 0.5,
  }),
};

export const playClickSound = () => {
  buttonSounds.click.play();
};
