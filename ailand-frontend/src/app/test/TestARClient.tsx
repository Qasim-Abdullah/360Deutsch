"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

import { createSentenceCard } from "@/components/ui/webxr/cards/SentenceCard";

export default function TestARPage() {
  useEffect(() => {
    startAR();
  }, []);

  async function startAR() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    document.body.appendChild(renderer.domElement);

    document.body.appendChild(
      ARButton.createButton(renderer, {
        requiredFeatures: ["hit-test"],
      })
    );

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.08, 0.1, 32),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc })
    );

    reticle.rotation.x = -Math.PI / 2;
    reticle.visible = false;

    scene.add(reticle);

    const examples = [
      { de: "Ich lerne Deutsch.", en: "I am learning German." },
      { de: "Das ist ein Beispiel.", en: "This is an example." },
      { de: "Heute ist es kalt.", en: "Today it is cold." },
    ];

    const card = createSentenceCard({ examples });

    card.visible = false;
    scene.add(card);

    let hitTestSource: any = null;
    let hitTestRequested = false;
    let localSpace: any = null;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(0, 0);

    function onTap() {
      if (!card.visible) return;

      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObjects(card.children, true);

      if (hits.length > 0) {
        const obj = hits[0].object;

        if (obj.parent?.userData?.next) {
          obj.parent.userData.next();
        }
      }
    }

    renderer.domElement.addEventListener("touchend", onTap);
    renderer.domElement.addEventListener("click", onTap);

    renderer.setAnimationLoop((_, frame) => {
      if (!frame) {
        renderer.render(scene, camera);
        return;
      }

      const xrSession = renderer.xr.getSession() as any;

      if (!xrSession) {
        renderer.render(scene, camera);
        return;
      }

      if (!hitTestRequested) {
        xrSession
          .requestReferenceSpace("viewer")
          .then((viewerSpace: any) => {
            if (!viewerSpace) return;

            xrSession
              .requestReferenceSpace("local-floor")
              .then((local: any) => {
                localSpace = local;

                xrSession
                  .requestHitTestSource({
                    space: viewerSpace,
                  })
                  .then((source: any) => {
                    hitTestSource = source;
                  });
              });
          });

        xrSession.addEventListener("end", () => {
          hitTestRequested = false;
          hitTestSource = null;
          localSpace = null;
        });

        hitTestRequested = true;
      }

      if (hitTestSource && localSpace) {
        const hits = frame.getHitTestResults(hitTestSource);

        if (hits.length > 0) {
          const hit = hits[0];
          const pose = hit.getPose(localSpace);

          if (pose) {
            reticle.visible = true;

            reticle.matrix.fromArray(pose.transform.matrix);

            reticle.matrix.decompose(
              reticle.position,
              reticle.quaternion,
              reticle.scale
            );
          }
        } else {
          reticle.visible = false;
        }
      }

      renderer.render(scene, camera);
    });

    renderer.xr.addEventListener("sessionstart", () => {
      renderer.domElement.addEventListener("touchstart", () => {
        if (reticle.visible && !card.visible) {
          card.position.copy(reticle.position);
          card.quaternion.copy(reticle.quaternion);

          card.scale.set(0.6, 0.6, 0.6);

          card.visible = true;
        }
      });
    });
  }

  return null;
}
