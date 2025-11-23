import * as THREE from "three";

/**
 * Manages 2D spatial occupancy for placing objects without overlap.
 * Operates on the XZ plane using circular bounds.
 *
 * @class SpaceManager
 * @param {number} width - Total width of the managed area.
 * @param {number} height - Total height of the managed area.
 * @param {Array<Object>} objects - List of occupied spots (position + radius).
 *
 * @method isFree
 * @description Checks if a position is within bounds and not overlapping any existing object.
 *
 * @method occupy
 * @description Registers a new occupied position with its radius and optional type.
 *
 * @method clear
 * @description Removes all stored occupancy data.
 */
class SpaceManager {
    constructor(width, height) {
        this.width = width
        this.height = height
        this.objects = []
    }

    isFree(x, z, radius) {
        if (x < -this.width / 2 || x > this.width / 2) return false
        if (z < -this.height / 2 || z > this.height / 2) return false

        for (const obj of this.objects) {
            const dx = x - obj.position.x
            const dz = z - obj.position.y
            const distSq = dx * dx + dz * dz
            const minDist = radius + obj.radius
            if (distSq < minDist * minDist) return false
        }

        return true;
    }

    occupy(x, z, radius, type = "generic") {
        this.objects.push({
            position: new THREE.Vector2(x, z),
            radius,
            type
        });
    }

    clear() {
        this.objects = []
    }
}

export { SpaceManager };