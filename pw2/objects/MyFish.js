import * as THREE from "three";

// TODO: This is only a placeholder
class MyFish extends THREE.Object3D {

    constructor(
        // TODO
        material = new THREE.MeshBasicMaterial({color: 0x1e66f5, side: THREE.DoubleSide})
    ) {
        super();
        // TODO
        this.material = material;
        this.build();
    }

    build() {
        // TODO
        const geometry = new THREE.SphereGeometry(0.5);
        let mesh = new THREE.Mesh(geometry, this.material);
        mesh.scale.set(2, 1, 1);
        this.add(mesh);
    }
}

export { MyFish };
