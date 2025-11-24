/* Inspired from three.js manual @ https://threejs.org/manual/#en/picking */

import * as THREE from "three";

class PickHelper {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickPosition = { x: NaN, y: NaN };
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
    }

    pick(event, scene, camera) {
        this.setPickPosition(event.clientX, event.clientY);
        
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

    setPickPosition(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const pos = {
            x: ((clientX - rect.left) * canvas.clientWidth) / rect.width,
            y: ((clientY - rect.top) * canvas.clientHeight) / rect.height,
        };
        this.pickPosition.x = (pos.x / canvas.clientWidth) * 2 - 1;
        this.pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1; // note we flip Y        
    }

    clearPickPosition() {
        this.pickPosition = { x: NaN, y: NaN };
    }
}

export { PickHelper };
