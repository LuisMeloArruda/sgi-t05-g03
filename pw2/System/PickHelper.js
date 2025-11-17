/* Inspired from three.js manual @ https://threejs.org/manual/#en/picking */

import * as THREE from "three";

class PickHelper {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickPosition = { x: -100000, y: -100000 };
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
    }

    pick(scene, camera) {
        // restore the color if there is a picked object
        if (this.pickedObject) {
            this.pickedObject.material.emissive.setHex(
                this.pickedObjectSavedColor,
            );
            this.pickedObject = undefined;
        }

        // cast a ray through the frustum
        this.raycaster.setFromCamera(this.pickPosition, camera);
        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(
            scene.children,
        );
        if (intersectedObjects.length) {
            // pick the first object. It's the closest one
            this.pickedObject = intersectedObjects[0].object;
            console.log("Picked object: ", this.pickedObject);
            // save its color
            this.pickedObjectSavedColor =
                this.pickedObject.material.emissive.getHex();
            // set its emissive color to white
            this.pickedObject.material.emissive.setHex(0xffffff);
        }
    }

    setPickPosition(event) {
        const rect = canvas.getBoundingClientRect();
        const pos = {
            x: ((event.clientX - rect.left) * canvas.width) / rect.width,
            y: ((event.clientY - rect.top) * canvas.height) / rect.height,
        };
        this.pickPosition.x = (pos.x / canvas.width) * 2 - 1;
        this.pickPosition.y = (pos.y / canvas.height) * -2 + 1; // note we flip Y
    }

    clearPickPosition() {
        this.pickPosition = { x: -100000, y: -100000 };
    }
}

export { PickHelper };
