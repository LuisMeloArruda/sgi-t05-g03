import * as THREE from "three";
/**
 * A plane with a picture inside, made of:
 * - An outer rectagle painted brown (by default);
 * - An inner rectagle with the texture (painted white by default).
 */
class MyPainting extends THREE.Object3D {
    /**
     * 
     * @param {THREE.Material} picture_material 
     * @param {number} width 
     * @param {number} height 
     * @param {number} margin 
     * @param {THREE.Material} border_material 
     */
    constructor(
        picture_material = new THREE.MeshPhongMaterial({ color: "#FFFFFF" }),
        width = 3,
        height = 4,
        margin = 0.5,
        border_material = new THREE.MeshPhongMaterial({ color: "#A47449" }),
    ) {
        super();
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.picture_material = picture_material;
        this.border_material = border_material;
        this.build();
    }

    build() {
        const outer_geometry = new THREE.PlaneGeometry(
            this.width + this.margin,
            this.height + this.margin,
        );
        const outer = new THREE.Mesh(outer_geometry, this.border_material);
        const inner_geometry = new THREE.PlaneGeometry(this.width, this.height);
        const inner = new THREE.Mesh(inner_geometry, this.picture_material);
        inner.position.set(0, 0, 0.001);
        this.add(outer, inner);
    }
}

export { MyPainting };

