/* Inspired from three.js manual @ https://threejs.org/manual/#en/picking */

import * as THREE from "three";

class PickHelper {
    constructor(active = true, color = 0xFFFFFF) {
        this.raycaster = new THREE.Raycaster();
        this.object = undefined;
        this.material = undefined;
        this.active = active;
        this.color = color;
    }

    pick(event, scene, camera) {
        if (!this.active) return;
        this.restore();
        const pickPosition = this._getPickPosition(event.clientX, event.clientY);
        this.raycaster.setFromCamera(pickPosition, camera);
        const intersectedObjects = this.raycaster.intersectObjects(
            scene.children,
        );
                
        if (intersectedObjects.length) {
            this.object = intersectedObjects[0].object;
            this.material = this.object.material;
            this.object.material = new THREE.MeshBasicMaterial({ color: this.color, side: THREE.DoubleSide });
        }
    }

    _getPickPosition(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const pos = {
            x: ((clientX - rect.left) * canvas.clientWidth) / rect.width,
            y: ((clientY - rect.top) * canvas.clientHeight) / rect.height,
        };
        const x = (pos.x / canvas.clientWidth) * 2 - 1;
        const y = (pos.y / canvas.clientHeight) * -2 + 1; // note we flip Y  
        return { x, y };
    }

    restore() {
        if (this.object) {
            this.object.material = this.material;
            this.object = undefined;
        }
    }
}

export { PickHelper };
