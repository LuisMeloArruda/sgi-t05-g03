import * as THREE from "three";

/**
 * A lightweight dynamic BVH structure used to accelerate proximity queries
 * for moving 3D objects.
 *
 *
 * @class DynamicBVH
 *
 * @param {number} leafSize
 *    Maximum number of objects allowed inside a leaf node.
 *
 * @param {Object|null} root
 *    Root node of the BVH hierarchy.
 *
 * @param {Object[]|null} objects
 *    Array of references to the original scene objects. Their positions are
 *    accessed dynamically during queries.
 */
class DynamicBVH {
    constructor({ leafSize = 8 } = {}) {
        this.leafSize = leafSize;
        this.root = null;
        this.objects = null; // <<--- guardamos os objetos diretamente
    }

    build(objects) {
        this.objects = objects;

        const indices = objects.map((_, i) => i);
        this.root = this._buildRecursive(indices);
    }

    _buildRecursive(indices) {
        const node = {};
        const box = new THREE.Box3();

        // usa a posição do objeto diretamente
        for (const i of indices) {
            box.expandByPoint(this.objects[i].position);
        }
        node.box = box;

        if (indices.length <= this.leafSize) {
            node.isLeaf = true;
            node.indices = indices.slice();
            node.left = node.right = null;
            return node;
        }

        const size = new THREE.Vector3();
        box.getSize(size);

        let axis = size.x >= size.y && size.x >= size.z ? 0 :
                   size.y >= size.z ? 1 : 2;

        indices.sort((a, b) =>
            this.objects[a].position.getComponent(axis) -
            this.objects[b].position.getComponent(axis)
        );

        const mid = Math.floor(indices.length / 2);
        const leftIdx = indices.slice(0, mid);
        const rightIdx = indices.slice(mid);

        node.isLeaf = false;
        node.indices = null;

        node.left = this._buildRecursive(leftIdx);
        node.right = this._buildRecursive(rightIdx);
        return node;
    }

    querySphere(pos, radius, out = []) {
        if (!this.root) return out;
        const sphere = new THREE.Sphere(pos, radius);
        this._queryNode(this.root, sphere, out);
        return out;
    }

    _queryNode(node, sphere, out) {
        if (!node.box.intersectsSphere(sphere)) return;

        if (node.isLeaf) {
            for (const i of node.indices) {
                const p = this.objects[i].position;
                if (p.distanceTo(sphere.center) <= sphere.radius) {
                    out.push(this.objects[i]);
                }
            }
            return;
        }

        if (node.left) this._queryNode(node.left, sphere, out);
        if (node.right) this._queryNode(node.right, sphere, out);
    }

    dispose() {
        this.root = null;
        this.objects = null;
    }
}

export { DynamicBVH };
