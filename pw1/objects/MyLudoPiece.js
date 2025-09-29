import * as THREE from "three";

/**
 * A Ludo Piece made of:
 * - A cone with the base facing the floor;
 * - A sphere with its center on the cone vertex.
 */
class MyLudoPiece extends THREE.Object3D {
    /**
     *
     * @param {number} height The height of the cone (it does not include the height of the sphere)
     * @param {number} radius The radius of the cone base and the sphere.
     * @param {THREE.Material} material The material applied. By default, it is glossy green.
     */
    constructor(
        height = 0.5,
        radius = 0.2,
        material = new THREE.MeshPhongMaterial({
            color: "#40a02b",
            diffuse: "#000000",
            specular: "#ffffff",
        }),
    ) {
        super();
        this.height = height;
        this.radius = radius;
        this.material = material;
        this.build();
    }

    build() {
        const cone_geometry = new THREE.ConeGeometry(this.radius, this.height);
        const cone = new THREE.Mesh(cone_geometry, this.material);

        const sphere_geometry = new THREE.SphereGeometry(this.radius);
        const sphere = new THREE.Mesh(sphere_geometry, this.material);
        sphere.translateY(this.height / 2);
        this.add(cone, sphere);
    }
}

export { MyLudoPiece };
