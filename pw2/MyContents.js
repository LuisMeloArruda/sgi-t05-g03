import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MySubmarineControler, MyMidSubmarine, MyBasicSubmarine} from './objects/MySubmarine.js';
import { MyRock } from './objects/MyRock.js';
import { MyTerrainSegment } from './objects/MyTerrainSegment.js';
import { MyBasicCoral, MyCoral } from './objects/MyCoral.js';
import { MyBubble } from './objects/MyBubble.js';
import { MyFish } from './objects/MyFish.js';
import { MyBasicFish } from './objects/MyFish.js';
import { KeyframeObjectAnimator } from './System/KeyframeObjectAnimator.js'
import { MyBasicChest, MyChest } from './objects/MyChest.js';

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
        this.coralsGroup.translateY(0.1);
        this.coralsGroup.translateZ(2);

        this.coralsConfig = [
            {
                position: new THREE.Vector3(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
                rotation: new THREE.Euler(0, 0, 0),
            },
        ]
        this.coralsConstructors = [() => new MyCoral(), () => new MyBasicCoral()]

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
        this.fishesConfigs = []
        this.fishQuantity = 50
        
        this.minX = -10, this.maxX = 10;
        this.minY = 0,  this.maxY = 10;
        this.minZ = -10, this.maxZ = 10;
        for (let n = 0; n < this.fishQuantity; n++) {
            this.fishesConfigs.push({
                position: new THREE.Vector3(
                    Math.random() * (this.maxX - this.minX) + this.minX,
                    Math.random() * (this.maxY - this.minY) + this.minY,
                    Math.random() * (this.maxZ - this.minZ) + this.minZ
                  ),
                scale: new THREE.Vector3(0.3, 0.3, 0.3),
                rotation: new THREE.Euler(0, Math.PI / 2, 0),
              })
        }
 
        this.fishContructors = [() => new MyFish(), () => new MyBasicFish]
        this.fishAnimators = []

        // Plane related attributes
        this.planeMaterial = new THREE.MeshPhongMaterial({
            color: "#0000ff", specular: "#000000", emissive: "#000000", shininess: 90
        })

        // Submarine related attributes
        this.submarineMaterial = new THREE.MeshPhongMaterial({
            color: "#ffff00", specular: "#000000", emissive: "#000000", shininess: 90
        })

        const submarinePosition = new THREE.Vector3(2, 2, 0)
        const submarineRotation = new THREE.Euler(0, Math.PI / 4, 0)
        const submarineScale = new THREE.Vector3(0.8, 0.8, 0.8)
        this.submarineControler = new MySubmarineControler()
        this.submarineControler.position.copy(submarinePosition)
        this.submarineControler.rotation.copy(submarineRotation)
        this.submarineControler.scale.copy(submarineScale)

        this.submarineLODConfigs = [
            {
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
            },
        ];
          
          this.submarineConstructors = [
            () => new MyBasicSubmarine(this.submarineMaterial),
            () => new MyMidSubmarine(this.submarineMaterial),
          ];

          // Chest related attributes 
          this.chestsGroup = new THREE.Group()
          this.chestsConfigs = [
            {
                position: new THREE.Vector3(6, 1, 0),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
            },
        ];
          this.chestsConstructors = [() => new MyChest(), () => new MyBasicChest()]

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
        ambientLight.intensity = 1;
        this.app.scene.add( ambientLight );

        const pointlight = new THREE.PointLight( 0xffffff )
        pointlight.intensity = 25
        pointlight.position.set(0, 5, 2)
        this.app.scene.add( pointlight )
        
        // Create a Plane Mesh with basic material
        let plane = new THREE.PlaneGeometry( 20, 20 );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add( this.planeMesh );

        // add chest
        this.createLODs(this.chestsConfigs, this.chestsConstructors, [0, 20], this.chestsGroup)
        this.app.scene.add(this.chestsGroup)

        // add submarine
        this.createLODs(this.submarineLODConfigs, this.submarineConstructors, [0, 20], this.submarineControler);
        this.app.scene.add(this.submarineControler);
        
        // add terrain
        this.createLODs(this.segmentsConfig, this.segmentsConstructors, [0], this.terrainGroup)
        this.createLODs(this.rocksConfig, this.rocksConstructors, [0], this.terrainGroup)
        this.app.scene.add(this.terrainGroup);

        // add corals
        this.createLODs(this.coralsConfig, this.coralsConstructors, [0, 20], this.coralsGroup)
        this.app.scene.add(this.coralsGroup);

        // add bubble
        this.createLODs(this.bubblesConfigs, this.bubblesConstructors, [0], this.bubblesGroup)
        this.app.scene.add(this.bubblesGroup);

        // add fishes
        this.createLODs(this.fishesConfigs, this.fishContructors, [0, 20], this.fishesGroup)
        this.app.scene.add(this.fishesGroup);

        for (const lod of this.fishesGroup.children) {
            const animator = new KeyframeObjectAnimator(lod, 120, 1000, 
                this.minX, this.maxX, this.minY, 
                this.maxY, this.minZ, this.maxZ)
            this.fishAnimators.push(animator);
        }
    }


    /**
     * Creates LOD objects from configs and adds them to a group.
     * 
     * @param {Array<Object>} configs - Each with position, scale, rotation (Vector3, Vector3, Euler)
     * @param {Array<Function>} constructors - Functions returning mesh per LOD level
     * @param {Array<number>} distances - Distances for each LOD level
     * @param {THREE.Group} targetParent - Group to add the LODs to
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
    update3PersonSubmarine() {
        const camera = this.app.activeCamera;
        const controls = this.app.controls;
        
        const offset = camera.position.clone().sub(controls.target);
        controls.target.copy(this.submarineControler.position);
        camera.position.copy(this.submarineControler.position.clone().add(offset));
        
        controls.update();
    }

    /**
     * Updates the camera's position and view to follow the submarine in first person
     */
    update1PersonSubmarine() {
        const camera = this.app.activeCamera
        const controls = this.app.controls
        const submarine = this.submarineControler

        // look foward
        const forwardPoint = new THREE.Vector3(0, 0, -5);
        const worldForward = forwardPoint.clone();
        submarine.localToWorld(worldForward);
        controls.target.copy(worldForward);
        
        // camera position
        const box = new THREE.Box3().setFromObject(submarine);
        const size = new THREE.Vector3();
        box.getSize(size); 

        const center = new THREE.Vector3();
        box.getCenter(center);

        const localFront = new THREE.Vector3(0, 0, -size.z / 2);

        const worldFront = localFront.clone();
        submarine.localToWorld(worldFront);

        camera.position.copy(worldFront);
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     */
    update() {

        /**
         * Update all fish animations (positions + lookAt direction)
         */
        for (const animator of this.fishAnimators) {
            animator.update();
          }

        /**
         * If the active camera is the 3PersonSubmarine
         * Sync camera position/orientation with submarine
         * Handle submarine input/movement
         */
        if (this.app.activeCameraName === '3PersonSubmarine') this.update3PersonSubmarine();


        /**
         * If the active camera is the 1PersonSubmarine
         * Sync camera position/orientation with submarine
         */
        if (this.app.activeCameraName === '1PersonSubmarine') this.update1PersonSubmarine()

        /**
         * Update Submarine position with keyboard
         */
        if (this.app.activeCameraName === 'Fixed' || 
            this.app.activeCameraName === '1PersonSubmarine' ||
            this.app.activeCameraName === '3PersonSubmarine') 
            this.submarineControler.update();
    }
}

export { MyContents };
