import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MySubmarineControler, MyMidSubmarine, MyBasicSubmarine} from './objects/MySubmarine.js';
import { MyBasicRock, MyRock} from './objects/MyRock.js';
import { MyTerrainSegment } from './objects/MyTerrainSegment.js';
import { MyBasicCoral, MyCoral } from './objects/MyCoral.js';
import { MyBasicSeaweed, MySeaweed } from './objects/MySeaWeed.js';
import { MyBubble } from './objects/MyBubble.js';
import { MyFish } from './objects/MyFish.js';
import { MyBasicFish } from './objects/MyFish.js';
import { KeyframeObjectAnimator } from './System/KeyframeObjectAnimator.js'
import { MyBasicChest, MyChest } from './objects/MyChest.js';
import { SpaceManager } from './System/SpaceManager.js'
import { MyBoid } from './objects/MyBoid.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { staticBVH } from './System/StaticBVH.js'
import { createGodray } from './System/FakeGodray.js';


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

        // BVH related attributes
        THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
        THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
        THREE.Mesh.prototype.raycast = acceleratedRaycast

        this.staticBVH = new staticBVH()
        this.terrainBVHHelper = null
        this.submarineBVHHelper = null

        // Terrain related attributes       
        this.terrainGroup = new THREE.Group()
        this.terrain = new MyTerrainSegment()

        // Detect colision
        this.space = new SpaceManager(this.terrain.width, this.terrain.height);

        // Corals related attributes
        this.coralsGroup = new THREE.Group();
        // this.coralsGroup.translateX(-2);
        // this.coralsGroup.translateY(0.1);
        // this.coralsGroup.translateZ(2);
        
        this.coralsConfig = [];
        const coralQuantity = 300;
        for (let i = 0; i < coralQuantity; i++) {
            let x, z, y
            let valid = false
            let tries = 0

            while (!valid && tries < 50) {
                x = (Math.random() - 0.5) * (this.terrain.width)
                z = (Math.random() - 0.5) * (this.terrain.height)
                y = this.terrain.getHeightAt(x, z)
                tries++

                valid = this.space.isFree(x, z, 0.1)
            }

            if (!valid) continue;

            this.space.occupy(x, z, 0.1, "coral");
            const scaleFact = 
                THREE.MathUtils.randFloat(0.1, 0.75);

            const scale = new THREE.Vector3(
                scaleFact,scaleFact,scaleFact
            );

            const rotation = new THREE.Euler(
                0,
                THREE.MathUtils.randFloat(0, Math.PI * 2),
                0
            );

            this.coralsConfig.push({
                position: new THREE.Vector3(x, y, z),
                scale: scale,
                rotation: rotation,
            });
        }
        this.coralsConstructors = [() => new MyCoral(), () => new MyBasicCoral()]


        // Seaweed related attributes
        this.seaweedGroup = new THREE.Group();
        this.seaweedConfig = [];
        const seaweedQuantity = 100;
        for (let i = 0; i < seaweedQuantity; i++) {
            let x, z, y
            let valid = false
            let tries = 0

            while (!valid && tries < 50) {
                x = (Math.random() - 0.5) * (this.terrain.width)
                z = (Math.random() - 0.5) * (this.terrain.height)
                y = this.terrain.getHeightAt(x, z)
                tries++

                valid = this.space.isFree(x, z, 0.1)
            }

            if (!valid) continue;

            this.space.occupy(x, z, 0.1, "seaweed");
            const scaleFact = 
                THREE.MathUtils.randFloat(0.1, 0.75);

            const scale = new THREE.Vector3(
                scaleFact,scaleFact,scaleFact
            );

            const rotation = new THREE.Euler(
                0,
                THREE.MathUtils.randFloat(0, Math.PI * 2),
                0
            );

            this.seaweedConfig.push({
                position: new THREE.Vector3(x, y, z),
                scale: scale,
                rotation: rotation,
            });
        }
        this.seaweedConstructors = [() => new MySeaweed(), () => new MyBasicSeaweed()]

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
        this.fishQuantity = 500
        
        this.minX = -50, this.maxX = 50;
        this.minY = 0,  this.maxY = 50;
        this.minZ = -50, this.maxZ = 50;
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
 
        this.fishContructors = [
            () =>
                new MyFish(
                    1,
                    0.2,
                    0.1,
                    0.3,
                    0.4,
                    7,
                    new THREE.MeshPhongMaterial({color: 0x8839EF}),
                ),
            () => new MyBasicFish(),
        ]
        this.fishAnimators = []

        // Submarine related attributes
        this.submarineMaterial = new THREE.MeshPhongMaterial({
            color: "#ffff00", specular: "#000000", emissive: "#000000", shininess: 90
        })

        const submarinePosition = new THREE.Vector3(2, 7, 0)
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
        const chestX = 10
        const chestZ = 0
        this.chestHeight = this.terrain.getHeightAt(chestX, chestZ)
        this.chestsConfigs = [
            {
                position: new THREE.Vector3(chestX, this.chestHeight + 1, chestZ),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(1, 1, 1),
            },
        ];
        for (const config of this.chestsConfigs) {
            this.space.occupy(config.position.x, config.position.z, 2, "chest")
        }
        this.chestsConstructors = [() => new MyChest(), () => new MyBasicChest()]

        // Rocks related attributes
        const video = document.createElement('video');
        video.src = './objects/assets/rock/crabs.mp4';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = true;

        const texture = new THREE.VideoTexture(video);
        texture.colorSpace = THREE.SRGBColorSpace;

        const rockCrabMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        this.rocksCrabConstructors = [()=> new MyRock(rockCrabMaterial), () => new MyBasicRock(rockCrabMaterial)]

        this.rockCrabConfig = [
            {
                position: new THREE.Vector3(0, this.terrain.getHeightAt(0, 5), 10),
                rotation: new THREE.Euler(0, 0, 0),
                scale: new THREE.Vector3(2, 2, 2),
            },
        ];

        const video2 = document.createElement('video');
        video2.src = './objects/assets/rock/rockcrab2.mp4';
        video2.muted = true;
        video2.loop = true;
        video2.playsInline = true;
        video2.autoplay = true;

        const texture2 = new THREE.VideoTexture(video2);
        texture2.colorSpace = THREE.SRGBColorSpace;

        const rockCrabMaterial2 = new THREE.MeshPhongMaterial({
            map: texture2,
            side: THREE.DoubleSide
        });
        this.rocksCrabConstructors2 = [()=> new MyRock(rockCrabMaterial2), () => new MyBasicRock(rockCrabMaterial2)]

        this.rockCrabConfig2 = [
            {
                position: new THREE.Vector3(-15, this.terrain.getHeightAt(-15, 0), 0),
                rotation: new THREE.Euler(0, Math.PI, 0),
                scale: new THREE.Vector3(1, 3, 3),
            },
        ];
        this.space.occupy(0, 10, 2, "rockCrab")
        this.space.occupy(-15, 0, 2, "rockCrab2")

        this.rocksConfig = []
        const rocksQuantity = 100
        for (let i = 0; i < rocksQuantity; i++) {
            let x, z, y
            let valid = false
            let tries = 0
        
            while (!valid && tries < 50) {
                x = (Math.random() - 0.5) * this.terrain.width
                z = (Math.random() - 0.5) * this.terrain.height
                y = this.terrain.getHeightAt(x, z)
                tries++
        
                valid = this.space.isFree(x, z, 2)
            }
        
            if (!valid) continue;
        
            this.space.occupy(x, z, 2, "rock");
        
            const scale = new THREE.Vector3(
                THREE.MathUtils.randFloat(0.5, 5),
                THREE.MathUtils.randFloat(0.5, 3),
                THREE.MathUtils.randFloat(0.5, 5)
            );
        
            const rotation = new THREE.Euler(
                0,
                THREE.MathUtils.randFloat(0, Math.PI * 2),
                0
            );
        
            this.rocksConfig.push({
                position: new THREE.Vector3(x, y, z),
                scale,
                rotation
            });
        }
        this.rocksConstructors = [()=> new MyRock(), () => new MyBasicRock()]

        // Boid related attributes
        this.boid = new MyBoid([this.submarineControler], this.staticBVH,() => {
            const group = new THREE.Group();
            group.update = () => {
                group.children[0].children.forEach((fish) => {
                    fish.update();
                })
            };
            const lod = new THREE.LOD();
            lod.addLevel(new MyFish(), 0);
            lod.addLevel(new MyBasicFish(), 20);
            group.add(lod);
            return group;
        }
        );
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

        // add a point light
        const pointlight = new THREE.PointLight( 0xffffff )
        pointlight.intensity = 1000
        pointlight.position.set(0, 50, 0)
        this.app.scene.add( pointlight )

        // add fog
        this.app.scene.fog = new THREE.FogExp2(0x081A23, 0.03);
        this.app.renderer.setClearColor(0x004466); 

        // Godrays
        this.godray = this.initFakeGodrays()
        this.app.scene.add(this.godray)

        // add terrain
        this.createLODs(this.rockCrabConfig2, this.rocksCrabConstructors2, [0, 40], this.terrainGroup)
        this.createLODs(this.rockCrabConfig, this.rocksCrabConstructors, [0, 40], this.terrainGroup)
        // this.createLODs(this.rocksConfig, this.rocksConstructors, [0, 40], this.terrainGroup)
        this.terrainGroup.add(this.terrain)
        this.app.scene.add(this.terrainGroup);

        // add chest
        this.createLODs(this.chestsConfigs, this.chestsConstructors, [0, 20], this.chestsGroup)
        this.app.scene.add(this.chestsGroup)

        // add submarine
        this.createLODs(this.submarineLODConfigs, this.submarineConstructors, [0, 20], this.submarineControler);
        this.app.scene.add(this.submarineControler);
        
        // add corals
        // this.createLODs(this.coralsConfig, this.coralsConstructors, [0, 20], this.coralsGroup)
        this.app.scene.add(this.coralsGroup);

        // add seaweed
        // this.createLODs(this.seaweedConfig, this.seaweedConstructors, [0, 20], this.seaweedGroup)
        this.app.scene.add(this.seaweedGroup);

        // add bubble
        this.createLODs(this.bubblesConfigs, this.bubblesConstructors, [0], this.bubblesGroup)
        this.app.scene.add(this.bubblesGroup);

        // add fishes
        // this.createLODs(this.fishesConfigs, this.fishContructors, [0, 20], this.fishesGroup)
        this.app.scene.add(this.fishesGroup);

        // fishesGroup keyframe
        for (const lod of this.fishesGroup.children) {
            const animator = new KeyframeObjectAnimator(lod, 120, 5000, 
                this.minX, this.maxX, this.minY, 
                this.maxY, this.minZ, this.maxZ)
            this.fishAnimators.push(animator);
        }
        
        // // fishesGroup boid
        // this.app.scene.add(this.boid);

        // BVH
        this.staticBVH.buildMesh([this.terrainGroup])

        this.submarineControler.setBVHCapsuleInfo()
        this.submarineControler.staticBVH = this.staticBVH

        // BVH Debug
        this.terrainBVHHelper = this.staticBVH.createHelper(this.staticBVH.mesh)
        this.submarineBVHHelper = this.submarineControler.createCapsuleHelper()

        this.terrainBVHHelper.visible = false
        this.submarineBVHHelper.visible = false

        this.submarineControler.add(this.submarineBVHHelper)
        this.app.scene.add(this.terrainBVHHelper)
    }

    initFakeGodrays({
        count = 50,
        spread = 75,
        position = [0, 100, 0]
      } = {}) {
      
        const group = new THREE.Group();
        group.position.fromArray(position);
      
        const degToRad = (deg) => deg * Math.PI / 180;
      
        for (let i = 0; i < count; i++) {
          const tiltX = degToRad(THREE.MathUtils.randFloatSpread(spread));
          const tiltZ = degToRad(THREE.MathUtils.randFloatSpread(spread));
    
          const godray = createGodray({
            position: [0, 0, 0],
            rotation: [
              tiltX,
              0,
              tiltZ
            ],
            color: '#ADD8E6',
            topRadius: 0.1,
            bottomRadius: 2,
            height: 150,
            timeSpeed: 0.5,
            noiseScale: 1,
            smoothBottom: 1,
            smoothTop: 0.1,
            fresnelPower: 10
          });
      
          group.add(godray);
        }
      
        return group;
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
        this.fishesGroup.children.forEach((lod) => {
            lod.children.forEach((fish) => fish.update());
        });
        
        this.boid.update();

        for (let child of this.coralsGroup.children) {
            if (child.type === "LOD") {
                for (let grand of child.children) {
                    grand.update();
                }
            }
        }
        for (let child of this.seaweedGroup.children) {
            if (child.type === "LOD") {
                for (let grand of child.children) {
                    grand.update();
                }
            }
        }

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
    
        // Fake Godrays tick
        const dt = this.app.clock.getDelta();
        for (let i = 0; i < this.godray.children.length; i++) {
            const element = this.godray.children[i];
            if (element.tick) element.tick(dt);
        }
    }
}

export { MyContents };
