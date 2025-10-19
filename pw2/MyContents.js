import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MySubmarine } from './objects/MySubmarine.js';
import { MyRock } from './objects/MyRock.js';
import { MyTerrainSegment } from './objects/MyTerrainSegment.js';
import { MyCoral } from './objects/MyCoral.js';
import { MyBubble } from './objects/MyBubble.js';
import { MyFish } from './objects/MyFish.js';
import { MyBasicFish } from './objects/MyFish.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null
        
        // Terrain related attributes       
        this.terrainGroup = new THREE.Group()
        this.terrainGroup.translateY(0.1)

        this.segmentsConfig = [
            {
                position: new THREE.Vector3(0, 0, 0),
                scale: new THREE.Vector3(5, 5, 5),
                rotation: new THREE.Euler(0, 0, 0),
            },
            {
                position: new THREE.Vector3(2.5, 1, 0),
                scale: new THREE.Vector3(2, 2, 2),
                rotation: new THREE.Euler(0, 0, 0),
            },
        ]
        this.segmentsConstructors = [() => new MyTerrainSegment()]

        this.rocksConfig = [
            {
                position: new THREE.Vector3(-1.5, 0.5, -1),
                scale: new THREE.Vector3(1, 1, 1.5),
                rotation: new THREE.Euler(0, 0, 0),
            },
            {
                position: new THREE.Vector3(1.5, 1, -2),
                scale: new THREE.Vector3(1, 2, 1),
                rotation: new THREE.Euler(0, 0, 0),
            },
        ]
        this.rocksConstructors = [() => new MyRock()]

        // Corals related attributes
        this.coralsGroup = new THREE.Group();
        this.coralsGroup.translateX(-2);
        this.coralsGroup.translateY(0.5);
        this.coralsGroup.translateZ(2);

        this.coralsConfig = [
            {
                position: new THREE.Vector3(0, 0, 0),
                scale: new THREE.Vector3(0.1, 1, 0.1),
                rotation: new THREE.Euler(0, 0, 0),
            },
            {
                position: new THREE.Vector3(0.2, 0, 0),
                scale: new THREE.Vector3(0.1, 1, 0.1),
                rotation: new THREE.Euler(0, 0, -Math.PI / 180 * 20),
            },
        ]
        this.coralsConstructors = [() => new MyCoral()]

        // Bubbles related attributes
        this.bubblesGroup = new THREE.Group();
        this.bubblesGroup.translateX(-2);
        this.bubblesGroup.translateY(1.5);
        this.bubblesGroup.translateZ(2);
        this.bubblesConfigs = [
            {
                position: new THREE.Vector3(0, 0, 0),
                scale: new THREE.Vector3(0.1, 0.1, 0.1),
                rotation: new THREE.Euler(0, 0, 0),
            },
            {
                position: new THREE.Vector3(0.3, 0.3, 0),
                scale: new THREE.Vector3(0.1, 0.1, 0.1),
                rotation: new THREE.Euler(0, 0, 0),
            }
        ]
        this.bubblesConstructors = [() => new MyBubble()]
        
        // Fishes related attributes
        this.fishesGroup = new THREE.Group();
        this.fishesGroup.translateY(1.5);
        this.fishesConfigs = [
            {
              position: new THREE.Vector3(0, 0, 0),
              scale: new THREE.Vector3(0.3, 0.3, 0.3),
              rotation: new THREE.Euler(0, 0, 0),
            },
            {
              position: new THREE.Vector3(0.5, 0.5, 0.5),
              scale: new THREE.Vector3(0.3, 0.3, 0.3),
              rotation: new THREE.Euler(0, 0, 0),
            },
          ];  
        this.fishContructors = [() => new MyFish(), () => new MyBasicFish]

        // Plane related attributes
        this.planeMaterial = new THREE.MeshPhongMaterial({
            color: "#0000ff", specular: "#000000", emissive: "#000000", shininess: 90
        })

        // Submarine related attributes
        this.submarineMaterial = new THREE.MeshPhongMaterial({
            color: "#ffff00", specular: "#000000", emissive: "#000000", shininess: 90
        })
        this.submarine = new MySubmarine(1, new THREE.Vector3(0, 0, 0), this.submarineMaterial)

    }

    /**
     * initializes the contents
     */
    init() {
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555 );
        ambientLight.intensity = 50;
        this.app.scene.add( ambientLight );
        
        // Create a Plane Mesh with basic material
        let plane = new THREE.PlaneGeometry( 10, 10 );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add( this.planeMesh );

        // add submarine
        this.app.scene.add(this.submarine)
        
        // add terrain
        this.createLODs(this.segmentsConfig, this.segmentsConstructors, [0], this.terrainGroup)
        this.createLODs(this.rocksConfig, this.rocksConstructors, [0], this.terrainGroup)
        this.app.scene.add(this.terrainGroup);

        // add corals
        this.createLODs(this.coralsConfig, this.coralsConstructors, [0], this.coralsGroup)
        this.app.scene.add(this.coralsGroup);

        // add bubble
        this.createLODs(this.bubblesConfigs, this.bubblesConstructors, [0], this.bubblesGroup)
        this.app.scene.add(this.bubblesGroup);

        // add fishes
        this.createLODs(this.fishesConfigs, this.fishContructors, [0, 20], this.fishesGroup)
        this.app.scene.add(this.fishesGroup);
    }


    /**
     * Creates LOD objects from configs and adds them to a group.
     * 
     * @param {Array<Object>} configs - Each with position, scale, rotation (Vector3, Vector3, Euler)
     * @param {Array<Function>} constructors - Functions returning mesh per LOD level
     * @param {Array<number>} distances - Distances for each LOD level
     * @param {THREE.Object3D} targetParent - Object3D to add the LODs to
     */
    createLODs(configs, constructors, distances, targetParent) {
        for (const cfg of configs) {
          const lod = new THREE.LOD();
      
          for (let i = 0; i < constructors.length; i++) {
            const obj = constructors[i]();
            obj.scale.copy(cfg.scale);
            obj.rotation.copy(cfg.rotation);
            lod.addLevel(obj, distances[i]);
          }
      
          lod.position.copy(cfg.position);
          targetParent.add(lod);
        }
      }
      
    /**
     * Updates the camera's position and target to follow the submarine while maintaining a constant offset
     */
    updateSubmarineCamera() {
        const camera = this.app.activeCamera;
        const controls = this.app.controls;
        
        const offset = camera.position.clone().sub(controls.target);
        controls.target.copy(this.submarine.position);
        camera.position.copy(this.submarine.position.clone().add(offset));
        
        controls.update();
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        this.submarine.update();
        if (this.app.activeCameraName === 'Submarine') this.updateSubmarineCamera();
    }
}

export { MyContents };
