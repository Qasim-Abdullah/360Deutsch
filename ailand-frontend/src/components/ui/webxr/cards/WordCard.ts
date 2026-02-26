import * as THREE from "three";
import { drawGradientButton } from "../buttons/GradientButton";
import { drawAudioGradientButton } from "../buttons/AudioButton";

type WordCardData = {
    word: string;
    article?: string;
    ipa?: string;
    imageUrl?: string;
    cta?: string;
};


export function createWordCard({
    word,
    article,
    ipa,
    imageUrl,
    cta = "WEITER",
}: WordCardData) {
    const group = new THREE.Group();

    /* ---------- glass panel ---------- */
    const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.9),
        new THREE.MeshPhysicalMaterial({
            transparent: true,
            transmission: 1,
            thickness: 0.25,
            roughness: 0.25,
            clearcoat: 1,
            clearcoatRoughness: 0.15,
            ior: 1.45,
            depthWrite: false,
        })
    );
    panel.renderOrder = 1;
    group.add(panel);



    /* ---------- canvas ---------- */
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = Math.round(1024 / (0.66 / 0.75));
    const ctx = canvas.getContext("2d")!;

    const W = canvas.width;
    const H = canvas.height;
    const R = 72;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    let img: HTMLImageElement | null = null;

    const rr = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };



    const draw = () => {
        ctx.clearRect(0, 0, W, H);

        /* ---------- background ---------- */
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 60;
        ctx.shadowOffsetY = 28;

        rr(120, 120, W - 240, H - 190, R);
        ctx.fillStyle = "rgba(255,255,255,0.78)";
        ctx.fill();
        ctx.restore();

        /* ---------- image ---------- */
        if (img) {
            const size = 700;
            ctx.drawImage(img, W / 2 - size / 2, 140, size, size);
        }

        /* ---------- audio button ---------- */
        drawAudioGradientButton({
            ctx,
            rr,
            W,
            y: 160,
        });



        /* ---------- words list ---------- */
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(20,20,20,0.95)";
        ctx.font = "700 78px Arial";
        const displayWord = article ? `${article} ${word}` : word;
        ctx.fillText(displayWord, W / 2, 790);


        /* ---------- IPA ---------- */
        if (ipa) {
            ctx.font = "500 36px Arial";
            ctx.fillStyle = "rgba(80,80,80,0.8)";
            ctx.fillText(ipa, W / 2, 850);
        }


        /* ---------- CTA ---------- */
        drawGradientButton({
            ctx,
            rr,
            W,
            y: H - 260,
            text: cta,
        });
    };

    draw();
    texture.needsUpdate = true;

    /* ---------- image loading ---------- */
    /* ---------- image loading ---------- */
    if (imageUrl) {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = imageUrl;

        image.onload = () => {
            img = image;
            draw();
            texture.needsUpdate = true;
        };
    }


    /* ---------- text plane ---------- */
    const textPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.66, 0.75),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
        })
    );
    textPlane.position.z = 0.002;
    textPlane.renderOrder = 2;
    group.add(textPlane);



    /* ---------- CTA hit ---------- */
    const btn = new THREE.Mesh(
        new THREE.PlaneGeometry(0.55, 0.18),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, colorWrite: false })
    );
    const canvasBtnY = H - 260;
    const normalizedY = (canvasBtnY / H - 0.5) * -0.75;

    btn.position.set(0, normalizedY, 0.01);

    btn.name = "cta";
    btn.renderOrder = 3;
    group.add(btn);


    ///
    const cleanWord = word.split(" ").pop()?.toLowerCase();
    const audio = new Audio(`/audio/arwords/${cleanWord}.mp3`);
    audio.preload = "auto";


    /* ---------- audio hit ---------- */
    const audioBtn = new THREE.Mesh(
        new THREE.CircleGeometry(0.08, 32), // slightly bigger
        new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            colorWrite: false
        })
    );

    const bw = 110;
    const bh = 110;

    const canvasX = W - 120 - bw - 24 + bw / 2;
    const canvasY = 160 + bh / 2;

    const audioX = (canvasX / W - 0.5) * 0.66;
    const audioY = (canvasY / H - 0.5) * -0.75;

    audioBtn.position.set(audioX, audioY, 0.02);


    audioBtn.name = "audio";
    audioBtn.userData.audio = audio;
    audioBtn.renderOrder = 10;

    group.add(audioBtn);


    return group;
}
