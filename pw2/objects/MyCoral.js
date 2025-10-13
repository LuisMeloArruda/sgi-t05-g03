import * as THREE from "three";

// TODO: This is only a placeholder
class MyCoral extends THREE.Object3D {

    constructor(
        // TODO
        material = new THREE.MeshBasicMaterial({color: 0xea76cb, side: THREE.DoubleSide})
    ) {
        super();
        // TODO
        this.material = material;
        this.build();
    }

    build() {
        // TODO
        const geometry = new THREE.CylinderGeometry();
        let mesh = new THREE.Mesh(geometry, this.material);
        this.add(mesh);
    }
}

export { MyCoral };
