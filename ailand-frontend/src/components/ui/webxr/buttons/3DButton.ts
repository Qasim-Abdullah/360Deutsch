import * as THREE from "three";

type IconButtonProps = {
    iconUrl: string;
    size?: number;
    position?: THREE.Vector3;
    onClick?: () => void;
};

export function createIconButton({
    iconUrl,
    size = 0.18,
    position = new THREE.Vector3(0.23, 0.33, 0.01),
    onClick,
}: IconButtonProps) {
    const group = new THREE.Group();

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    let iconImg: HTMLImageElement | null = null;

    function draw() {
        ctx.clearRect(0, 0, 512, 512);

        if (!iconImg) return;

        const iw = iconImg.naturalWidth || iconImg.width;
        const ih = iconImg.naturalHeight || iconImg.height;

        const scale = Math.min(512 / iw, 512 / ih);

        const sw = iw * scale;
        const sh = ih * scale;

        const dx = (512 - sw) / 2;
        const dy = (512 - sh) / 2;

        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(iconImg, dx, dy, sw, sh);
        ctx.restore();

        texture.needsUpdate = true;
    }


    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = iconUrl;
    img.onload = () => {
        iconImg = img;
        draw();
    };

    const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
    });

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        mat
    );
    plane.position.copy(position);
    plane.renderOrder = 5;

    group.add(plane);


    const hit = new THREE.Mesh(
        new THREE.PlaneGeometry(size * 1.2, size * 1.2),
        new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 1,
            depthWrite: false,
            
        })
    );

    hit.position.copy(position);
    hit.name = "icon";
    hit.userData.onClick = onClick;

    group.add(hit);

    return group;
}
