import * as THREE from "three";
import { MeshBVH, MeshBVHHelper } from "three-mesh-bvh";
import { StaticGeometryGenerator } from "three-mesh-bvh";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Builds a BVH-optimized mesh from multiple static scene meshes by merging and
 * baking their geometries into a single world-transformed BufferGeometry.
 * Used for fast collision and proximity queries on static objects.
 *
 * @class staticBVH
 *
 * @param {THREE.Mesh|null} mesh - The final merged BVH-enabled mesh.
 */
class staticBVH {

    constructor() {
        this.mesh = null;
    }

    buildMesh(groups, material = null) {
        const geometries = []

        for (const group of groups) {
            group.updateMatrixWorld(true)

            group.traverse(obj => {
                if (obj.isMesh && obj.geometry) {
                    const geom = obj.geometry.clone()
                    geom.applyMatrix4(obj.matrixWorld)
                    geom.deleteAttribute("uv")
                    geometries.push(geom)
                }
            })
        }

        const mergedGeom = BufferGeometryUtils.mergeGeometries(geometries)

        const tempGroup = new THREE.Group()
        tempGroup.add(new THREE.Mesh(mergedGeom))

        const gen = new StaticGeometryGenerator(tempGroup)
        gen.attributes = ["position"]

        const finalGeom = gen.generate()

        finalGeom.boundsTree = new MeshBVH(finalGeom)

        const mat =
            material ??
            new THREE.MeshBasicMaterial({
                wireframe: true,
                transparent: true,
                opacity: 0.1
            });

        this.mesh = new THREE.Mesh(finalGeom, mat)

        return this.mesh
    }

    createHelper(mesh, depth = 40) {
        const helper = new MeshBVHHelper(mesh, depth)
        helper.visible = true

        return helper
    }
}

export { staticBVH };
