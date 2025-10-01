import * as THREE from "three";

/**
 * A 20 side dice on top of a support:
 * - A icosahedron (i.e. a polyhedron with 20 sides);
 * - A cylinder with open ends, and a bigger top base.
 */
class MyDiceWithSupport extends THREE.Object3D {
    /**
     *
     * @param {number} dice_radius The radius of the dice. It also affects the radius of the cylinder.
     * @param {number} support_height The height of the cylinder.
     * @param {THREE.Material} dice_material The material applied to the icosahedron. By default, it is a shiny purple.
     * @param {THREE.Material} support_material The material applied to the cylinder. By default, it is a simple black.
     */
    constructor(
        dice_radius = 0.2,
        support_height = 0.2,
        dice_material = new THREE.MeshPhongMaterial({color: "#7287fd", specular: "#ffffff", shininess: 20}),
        support_material = new THREE.MeshPhongMaterial({color: "#4c4f69"}),
    ) {
        super();
        this.dice_radius = dice_radius;
        this.support_top_radius = dice_radius * 0.7;
        this.support_bottom_radius = this.support_top_radius * 0.7;
        this.support_height = support_height;
        this.dice_material = dice_material;
        this.support_material = support_material;
        this.build();
    }

    build() {
        const y_displacement = 0.5 * this.dice_radius;

        const dice_geometry = new THREE.IcosahedronGeometry(
            this.dice_radius,
            1,
        );
        const dice = new THREE.Mesh(dice_geometry, this.dice_material);
        dice.translateY(y_displacement);

        const support_geometry = new THREE.CylinderGeometry(
            this.support_top_radius,
            this.support_bottom_radius,
            this.support_height,
            32,
            1,
            true,
        );
        const support = new THREE.Mesh(support_geometry, this.support_material);
        support.translateY(-y_displacement);

        this.add(dice, support);
    }
}

export { MyDiceWithSupport };
