import { Howl } from "howler";

let pianoDebounceTimer = null;
let isMusicFaded = false;
const MUSIC_FADE_TIME = 500;
const PIANO_TIMEOUT = 2000;
const BACKGROUND_MUSIC_VOLUME = 1;
const FADED_VOLUME = 0;

let isMuted = false;

export const backgroundMusic = new Howl({
  src: ["/audio/music/cosmic_candy.ogg"],
  loop: true,
  volume: 1,
});

export const fadeOutBackgroundMusic = () => {
  if (!isMuted && !isMusicFaded) {
    backgroundMusic.fade(backgroundMusic.volume(), FADED_VOLUME, MUSIC_FADE_TIME);
    isMusicFaded = true;
  }
};

export const fadeInBackgroundMusic = () => {
  if (!isMuted && isMusicFaded) {
    backgroundMusic.fade(FADED_VOLUME, BACKGROUND_MUSIC_VOLUME, MUSIC_FADE_TIME);
    isMusicFaded = false;
  }
};

export const muteMusic = () => {
  isMuted = true;
  backgroundMusic.mute(true);
};

export const unmuteMusic = () => {
  isMuted = false;
  backgroundMusic.mute(false);
};

export const getMusicState = () => ({
  isMuted,
  isMusicFaded,
});
