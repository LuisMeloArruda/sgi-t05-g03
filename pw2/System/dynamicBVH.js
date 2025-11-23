import * as THREE from "three";

/**
 * A lightweight BVH structure used to accelerate proximity queries for moving objects.
 * Operates only on object center positions for fast tree build and traversal.
 *
 * @class DynamicBVH
 *
 * @property {number} leafSize - Maximum number of items allowed in a leaf node.
 * @property {Object|null} root - Root node of the BVH hierarchy.
 * @property {THREE.Vector3[]} centers - Array of references to object center positions.
 *
 * @method build
 * @description Rebuilds the BVH tree using the provided array of center positions.
 *
 * @method querySphere
 * @description Returns indices of all objects within the given spherical radius.
 *
 * @method dispose
 * @description Clears all BVH data and resets the structure.
 */
class DynamicBVH {
    constructor({ leafSize = 8 } = {}) {
        this.leafSize = leafSize;
        this.root = null;
        this.centers = null;
        this._boxes = null;
    }

    build(centers) {
        this.centers = centers;
        this._boxes = centers.map(c => {
            const b = new THREE.Box3();
            b.min.copy(c);
            b.max.copy(c);
            return b;
        });

        const indices = centers.map((_, i) => i);
        this.root = this._buildRecursive(indices);
    }

    _buildRecursive(indices) {
        const node = {};
        const box = new THREE.Box3();
        for (const i of indices) box.expandByPoint(this.centers[i]);
        node.box = box;

        if (indices.length <= this.leafSize) {
            node.isLeaf = true;
            node.indices = indices.slice();
            node.left = node.right = null;
            return node;
        }

        const size = new THREE.Vector3();
        box.getSize(size);
        let axis = 0;
        if (size.y > size.x && size.y >= size.z) axis = 1;
        else if (size.z > size.x && size.z > size.y) axis = 2;

        indices.sort((a, b) => this.centers[a].getComponent(axis) - this.centers[b].getComponent(axis));
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
                if (this.centers[i].distanceTo(sphere.center) <= sphere.radius) out.push(i);
            }
            return;
        }
        if (node.left) this._queryNode(node.left, sphere, out);
        if (node.right) this._queryNode(node.right, sphere, out);
    }

    dispose() {
        this.root = null;
        this.centers = null;
        this._boxes = null;
    }
}

export { DynamicBVH };