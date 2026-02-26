import * as THREE from "three";
import { drawGradientButton } from "../buttons/GradientButton";


type LevelCardData = {
    level: string;
    subtitle: string;
    items: string[];
    iconUrl: string;
    cta?: string;
    onEnter?: () => void;
};

export function createLevelCard({
    level,
    subtitle,
    items,
    iconUrl,
    cta = "BETRETEN",
    onEnter,
}: LevelCardData) {
    const group = new THREE.Group();

    const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.9),
        new THREE.MeshPhysicalMaterial({
            transparent: true,
            opacity: 1,
            roughness: 0.25,
            metalness: 0,
            transmission: 1,
            thickness: 0.25,
            ior: 1.45,
            clearcoat: 1,
            clearcoatRoughness: 0.15,
            depthWrite: false,
        })
    );
    panel.renderOrder = 1;
    group.add(panel);

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1400;
    const ctx = canvas.getContext("2d")!;

    const W = canvas.width;
    const H = canvas.height;
    const R = 72;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    let iconImg: HTMLImageElement | null = null;

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

        // Card background
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 60;
        ctx.shadowOffsetY = 28;
        const sidePad = 120;
        const topPad = 120;
        const bottomPad = 70;
        rr(
            sidePad,
            topPad,
            W - sidePad * 2,
            H - topPad - bottomPad,
            R
        );

        ctx.fillStyle = "rgba(255,255,255,0.78)";
        ctx.fill();
        ctx.restore();


        // Icon
        if (iconImg) {
            const size = 500;
            ctx.drawImage(iconImg, W / 2 - size / 2, 100, size, size);
        }

        // Level
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(20,20,20,0.9)";
        ctx.font = "500 130px Arial";
        ctx.fillText(level, W / 2, 620);

        // Subtitle
        ctx.font = "400 44px Arial";
        ctx.fillStyle = "rgba(50,50,50,0.75)";
        ctx.fillText(subtitle, W / 2, 680);

        // Divider
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.moveTo(220, 760);
        ctx.lineTo(W - 220, 760);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Checklist
        ctx.textAlign = "left";
        let y = 870;

        items.forEach((t) => {
            // Check circle
            ctx.fillStyle = "#5a47c7"; // ← your hex color
            ctx.beginPath();
            ctx.arc(260, y - 14, 22, 0, Math.PI * 2);
            ctx.fill();

            // Check mark
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(252, y - 14);
            ctx.lineTo(258, y - 8);
            ctx.lineTo(270, y - 22);
            ctx.stroke();

            // Text
            ctx.fillStyle = "rgba(30,30,30,0.85)";
            ctx.font = "500 46px Arial";
            ctx.fillText(t, 300, y);

            y += 90;
        });

        // Button

        drawGradientButton({
            ctx,
            rr,
            W,
            y: H - 260,
            text: cta,
        });



    };

    draw();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = iconUrl;
    img.onload = () => {
        iconImg = img;
        draw();
        texture.needsUpdate = true;
    };

    const textPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.66, 0.86),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
        })
    );
    textPlane.position.z = 0.002;
    textPlane.renderOrder = 2;
    group.add(textPlane);

    // Invisible button hit area
    const btn = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.14),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, colorWrite: false})
    );
    btn.position.set(0, -0.31, 0.01);
    btn.name = "cta";
    btn.renderOrder = 3;
    group.add(btn);

    group.userData.onEnter = onEnter;

    return group;
}
