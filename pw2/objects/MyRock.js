import * as THREE from "three";

// TODO: This is only a placeholder
class MyRock extends THREE.Object3D {

    constructor(
        // TODO
        material = new THREE.MeshBasicMaterial({color: 0x4c4f69, side: THREE.DoubleSide})
    ) {
        super();
        // TODO
        this.material = material;
        this.build();
    }

    build() {
        // TODO
        const geometry = new THREE.BoxGeometry();
        let mesh = new THREE.Mesh(geometry, this.material);
        this.add(mesh);
    }
}

export { MyRock };
