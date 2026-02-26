import * as THREE from "three";
import { Text } from "troika-three-text";

type Card3DOptions = {
    title: string;
    subtitle?: string;
    ipa?: string;
    example?: string;
    width?: number;
    height?: number;
};

export function createCard3D({
    title,
    subtitle,
    ipa,
    example,
    width = 0.38,
    height = 0.24,
}: Card3DOptions) {
    const group = new THREE.Group();

    const radius = 0.035;
    const thickness = 0.015;

    const shape = new THREE.Shape();
    const w = width / 2;
    const h = height / 2;

    shape.moveTo(-w + radius, -h);
    shape.lineTo(w - radius, -h);
    shape.quadraticCurveTo(w, -h, w, -h + radius);
    shape.lineTo(w, h - radius);
    shape.quadraticCurveTo(w, h, w - radius, h);
    shape.lineTo(-w + radius, h);
    shape.quadraticCurveTo(-w, h, -w, h - radius);
    shape.lineTo(-w, -h + radius);
    shape.quadraticCurveTo(-w, -h, -w + radius, -h);

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: false,
    });

    const material = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        roughness: 0.12,
        metalness: 0,
        transmission: 0,
        transparent: true,
        opacity: 0.35,
        clearcoat: 0.9,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.5,
        depthWrite: false,
    });


    const card = new THREE.Mesh(geometry, material);
    card.position.z = -thickness / 2;
    group.add(card);

    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x334155,
        opacity: 0.28,
        transparent: true,
        side: THREE.DoubleSide,
    });

    const glow = new THREE.Mesh(new THREE.ShapeGeometry(shape), glowMat);
    glow.position.z = 0.002;
    group.add(glow);

    const titleText = makeText(title, 0.042, 0.06);
    titleText.position.set(0, 0.05, 0.01);
    group.add(titleText);

    if (subtitle) {
        const sub = makeText(subtitle, 0.026, 0.04);
        sub.color = 0xa5f3fc;
        sub.position.set(0, 0.005, 0.01);
        group.add(sub);
    }

    if (ipa) {
        const ipaText = makeText(ipa, 0.022, 0.03);
        ipaText.color = 0xc7d2fe;
        ipaText.position.set(0, -0.035, 0.01);
        group.add(ipaText);
    }

    if (example) {
        const ex = makeText(example, 0.02, 0.028);
        ex.color = 0xe5e7eb;
        ex.position.set(0, -0.08, 0.01);
        group.add(ex);
    }

    return group;
}

function makeText(content: string, fontSize: number, maxWidth: number) {
    const text = new Text();
    text.text = content;
    text.fontSize = fontSize;
    text.maxWidth = maxWidth;
    text.anchorX = "center";
    text.anchorY = "middle";
    text.color = 0xffffff;
    text.sync();
    return text;
}
