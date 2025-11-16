import * as THREE from 'three';
import { MeshBVHHelper } from 'three-mesh-bvh';

class BVH {

    constructor() {
        this.groups = []
        this.bvhHelpers = []
    }

    addGroup(group) {
        this.groups.push(group)
    }

    buildBVHForGroup(group) {
        group.traverse(obj => {
            if (obj.isMesh && obj.geometry) {
                obj.geometry.computeBoundsTree();
            }
        });
    }

    disposeBVHForGroup(group) {
        group.traverse(obj => {
            if (obj.isMesh && obj.geometry) {
                obj.geometry.disposeBoundsTree();
            }
        });
    }

    addBVHHelpersForGroup(group) {
        group.traverse(obj => {
            if (obj.isMesh && obj.geometry?.boundsTree) {

                const helper = new MeshBVHHelper(obj, 10);
            
                helper.color.set(0x0000ff);
                helper.opacity = 1;
                helper.displayEdges = true;
                helper.displayParents = false;

                this.bvhHelpers.push(helper);
            }
        });
    }

    removeBVHHelpersForObject(object) {
        this.bvhHelpers.pop(object)
    }

    checkSphereCollision(collider) {
        const center = collider.getCenter()
        const radius = collider.radius
    
        const sphere = new THREE.Sphere(center.clone(), radius)
        const inv = new THREE.Matrix4()
    
        for (const group of this.groups) {
            if (!group) continue
    
            let hit = false
    
            group.traverse(obj => {
                if (hit) return
    
                if (obj.isMesh && obj.geometry?.boundsTree) {
    
                    inv.copy(obj.matrixWorld).invert()
                    const sphereLocal = sphere.clone().applyMatrix4(inv)
    
                    if (obj.geometry.boundsTree.intersectsSphere(sphereLocal)) {
                        hit = true
                    }
                }
            });
    
            if (hit) return true
        }
    
        return false
    }
}

class SphereCollider {
    constructor(parent, radius, helper = false, color = 0xff0000) {
        this.parent = parent
        this.radius = radius
        this.helper = helper
        this.color = color

        if (helper) {
            const geo = new THREE.SphereGeometry(radius, 16, 16)
            const mat = new THREE.MeshBasicMaterial({
                color,
                wireframe: true
            });
            this.helper = new THREE.Mesh(geo, mat)

            parent.add(this.helper)
        }
    }

    getCenter() {
        return this.parent.getWorldPosition(new THREE.Vector3())
    }
}


export {BVH, SphereCollider};