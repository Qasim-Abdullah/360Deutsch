import * as THREE from "three";

export function createDynamicEdge(
  scene: THREE.Scene,
  from: THREE.Object3D,
  to: THREE.Object3D,
  color: number = 0x5a47c7
) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(6);

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    depthTest: true,
    depthWrite: false,
  });

  const line = new THREE.Line(geometry, material);
  line.renderOrder = 0;
  line.position.y += 1.5;

  line.userData.update = () => {
    const p1 = new THREE.Vector3();
    const p2 = new THREE.Vector3();

    from.getWorldPosition(p1);
    to.getWorldPosition(p2);

    positions[0] = p1.x;
    positions[1] = p1.y;
    positions[2] = p1.z;

    positions[3] = p2.x;
    positions[4] = p2.y;
    positions[5] = p2.z;

    geometry.attributes.position.needsUpdate = true;
  };

  scene.add(line);

  return line;
}
