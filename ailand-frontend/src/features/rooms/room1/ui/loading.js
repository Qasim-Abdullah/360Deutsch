import * as THREE from "three";

import gsap from "gsap";
import { backgroundMusic, muteMusic } from "../audio/music.js";

import { manager } from "../models/loadRoom.js";

let touchHappened = false;
let isMuted = false;

const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-screen-button");
const noSoundButton = document.querySelector(".no-sound-button");


manager.onLoad = function () {
  loadingScreenButton.style.border = "8px solid #2a0f4e";
  loadingScreenButton.style.background = "#401d49";
  loadingScreenButton.style.color = "#e6dede";
  loadingScreenButton.style.boxShadow = "rgba(0,0,0,0.24) 0px 3px 8px";
  loadingScreenButton.textContent = "Enter!";
  loadingScreenButton.style.cursor = "pointer";
  loadingScreenButton.style.transition = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)";
  let isDisabled = false;

  noSoundButton.textContent = "Enter without Sound :(";

  const handleEnter = (withSound = true) => {
    if (isDisabled) return;
    isDisabled = true;
    noSoundButton.textContent = "";
    loadingScreenButton.textContent = "~ 안녕하세요 ~";
    loadingScreen.style.background = "#ead7ef";
    loadingScreenButton.style.cursor = "default";
    loadingScreenButton.style.border = "8px solid #6e5e9c";
    loadingScreenButton.style.background = "#ead7ef";
    loadingScreenButton.style.color = "#6e5e9c";
    loadingScreenButton.style.boxShadow = "none";

    if (!withSound) {
      muteMusic();
      isMuted = true;
    } else {
      backgroundMusic.play();
    }

    playReveal();
  };

  loadingScreenButton.addEventListener("mouseenter", () => {
    loadingScreenButton.style.transform = "scale(1.3)";
  });
  loadingScreenButton.addEventListener("mouseleave", () => {
    loadingScreenButton.style.transform = "none";
  });
  loadingScreenButton.addEventListener("touchend", (e) => {
    touchHappened = true; e.preventDefault(); handleEnter();
  });
  loadingScreenButton.addEventListener("click", (e) => {
    if (!touchHappened) handleEnter(true);
  });
  noSoundButton.addEventListener("click", (e) => {
    if (!touchHappened) handleEnter(false);
  });
};

function playReveal() {
  const tl = gsap.timeline();
  tl.to(loadingScreen, {
    scale: 0.5, duration: 1.2, delay: 0.25, ease: "back.in(1.8)",
  }).to(loadingScreen, {
    y: "200vh",
    transform: "perspective(1000px) rotateX(45deg) rotateY(-35deg)",
    duration: 1.2,
    ease: "back.in(1.8)",
    onComplete: () => {
 loadingScreen.remove();
  document.dispatchEvent(new Event("intro:start"));    },
  }, "-=0.1");
}
