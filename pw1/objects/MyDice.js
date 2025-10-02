import * as THREE from "three";

/**
 * A 20 side dice made of a icosahedron (i.e. a polyhedron with 20 sides);
 */
class MyDice extends THREE.Object3D {
    /**
     *
     * @param {number} radius The radius of the dice.
     * @param {THREE.Material} material The material applied to the icosahedron. By default, it is a shiny purple.
     */
    constructor(
        radius = 0.2,
        material = new THREE.MeshPhongMaterial({
            color: "#7287fd",
            specular: "#ffffff",
            shininess: 20,
            flatShading: true,
        }),
    ) {
        super();
        this.dice_radius = radius;
        this.dice_material = material;
        this.build();
    }

    build() {
        const dice_geometry = new THREE.IcosahedronGeometry(
            this.dice_radius,
            0,
        );
        const dice = new THREE.Mesh(dice_geometry, this.dice_material);

        this.add(dice);
    }
}

export { MyDice };
