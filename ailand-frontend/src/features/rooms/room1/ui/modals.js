
import gsap from "gsap";
import { playClickSound } from "../audio/button.js";
import { controls } from "../scene/controls.js";

export const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),
};

export const overlay = document.querySelector(".overlay");
let touchHappened = false;
let isModalOpen = true;

export const hideModal = (modal) => {
  isModalOpen = false;
  controls.enabled = true;

  gsap.to(overlay, { opacity: 0, duration: 0.5 });
  gsap.to(modal, {
    opacity: 0,
    scale: 0,
    duration: 0.5,
    ease: "back.in(2)",
    onComplete: () => {
      modal.style.display = "none";
      overlay.style.display = "none";
    },
  });
};

export const showModal = (modal) => {
  modal.style.display = "block";
  overlay.style.display = "block";
  isModalOpen = true;
  controls.enabled = false;

  gsap.set(modal, { opacity: 0, scale: 0 });
  gsap.set(overlay, { opacity: 0 });
  gsap.to(overlay, { opacity: 1, duration: 0.5 });
  gsap.to(modal, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    ease: "back.out(2)",
  });
};

overlay.addEventListener("touchend", (e) => {
  touchHappened = true;
  e.preventDefault();
  const modal = document.querySelector('.modal[style*="display: block"]');
  if (modal) hideModal(modal);
}, { passive: false });

overlay.addEventListener("click", (e) => {
  if (touchHappened) return;
  e.preventDefault();
  const modal = document.querySelector('.modal[style*="display: block"]');
  if (modal) hideModal(modal);
}, { passive: false });

document.querySelectorAll(".modal-exit-button").forEach((button) => {
  const handleExit = (e) => {
    e.preventDefault();
    const modal = e.target.closest(".modal");
    gsap.to(button, {
      scale: 5,
      duration: 0.5,
      ease: "back.out(2)",
      onStart: () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.5,
          ease: "back.out(2)",
          onComplete: () => gsap.set(button, { clearProps: "all" }),
        });
      },
    });
    playClickSound();
    hideModal(modal);
  };

  button.addEventListener("touchend", (e) => { touchHappened = true; handleExit(e); }, { passive: false });
  button.addEventListener("click", (e) => { if (!touchHappened) handleExit(e); }, { passive: false });
});
