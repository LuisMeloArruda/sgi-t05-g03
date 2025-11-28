
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { MyContents } from './MyContents.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import { PickHelper } from './System/PickHelper.js';
import Stats from 'three/addons/libs/stats.module.js'


/**
 * Traverse Children of an Object3d and update their wireframe
 */
function traverseChildrenWireframe(listOfChildren, isWireframe) {
    for (let child of listOfChildren) {
        traverseChildrenWireframe(child.children, isWireframe);
        if (child.isMesh) {
            child.material.wireframe = isWireframe;
        }
    }
}

/**
 * This class contains the application object
 */
class MyApp  {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null
        this.stats = null

        // camera related attributes
        this.activeCamera = null
        this.activeCameraName = null
        this.lastCameraName = null
        this.cameras = []
        this.frustumSize = 20
        this.clock = new THREE.Clock();

        // polygonal mode stuff
        this.polygonalMode = null
        this.previousPolygonalMode = null

        // other attributes
        this.renderer = null
        this.controls = null
        this.gui = null
        this.axis = null
        this.contents == null

        // Listener for mouse lock down
        this._onCanvasClick = () => {this.renderer.domElement.requestPointerLock()}
    }
    /**
     * initializes the application
     */
    init() {
                
        // Create an empty scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x10212a );

        this.stats = new Stats()
        this.stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)

        this.initCameras();
        this.setActiveCamera('3PersonSubmarine')

        this.initPolygonalMode();

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor("#000000");

        // Configure renderer size
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        // Append Renderer to DOM
        document.getElementById("canvas").appendChild( this.renderer.domElement );

        // manage window resizes
        window.addEventListener('resize', this.onResize.bind(this), false );
        
        // Clock used for animations
        this.timer = new THREE.Timer();
        this.timer.connect(document);

        // Pick Helper
        // this.pickHelper = new PickHelper();
        // window.addEventListener('mouseout', this.pickHelper.clearPickPosition);
        // window.addEventListener('mouseleave', this.pickHelper.clearPickPosition);
        // window.addEventListener('click', (event) => this.pickHelper.pick(event, this.scene, this.activeCamera));

        // Shadows
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    /**
     * initializes all the cameras
     */
    initCameras() {
        const aspect = window.innerWidth / window.innerHeight;

        // Create a free fly perspective camera Q and E roll. WASD for movement. Mouse to look around
        const freeFly = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 )
        freeFly.position.set(0,5,10)
        this.cameras['FreeFly'] = freeFly

        // Create a 3 person submarine perspective camera
        let thirdPersonView = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000)
        thirdPersonView.position.set(0,5,10)
        this.cameras['3PersonSubmarine'] = thirdPersonView

        // Create a fixed perspective camera
        let fixedCamera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000)
        fixedCamera.position.set(0,10,15)
        this.cameras['Fixed'] = fixedCamera

        // Create a 1 person submarine perspective camera
        let firstPersonView = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000)
        this.cameras['1PersonSubmarine'] = firstPersonView
    }

    /**
     * sets the active camera by name
     * @param {String} cameraName 
     */
    setActiveCamera(cameraName) {   
        this.activeCameraName = cameraName
        this.activeCamera = this.cameras[this.activeCameraName]
    }

    /**
     * updates the active camera if required
     * this function is called in the render loop
     * when the active camera name changes
     * it updates the active camera and the controls
     */
    updateCameraIfRequired() {

        // camera changed?
        if (this.lastCameraName !== this.activeCameraName) {
            if (this.controls) {
                if (this.controls.dispose) {
                    this.controls.dispose();
                }
                this.controls = null;
                this.renderer.domElement.removeEventListener('click', this._onCanvasClick);
                this.contents.submarineController.dispose();
            }
            

            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName]
            document.getElementById("camera").innerHTML = this.activeCameraName
           
            // call on resize to update the camera aspect ratio
            // among other things
            this.onResize()

            switch (this.activeCameraName) {
                case 'FreeFly':
                    // Fly controls allow the camera to fly in scene
                    this.controls = new FlyControls(this.activeCamera, this.renderer.domElement)
                    this.controls.autoForward = false
                    this.controls.movementSpeed = 20
                    this.controls.dragToLook = false
                    this.controls.rollSpeed = 1
                    // Mouse lock down
                    this.renderer.domElement.addEventListener('click', this._onCanvasClick);
                    break;
                case '3PersonSubmarine':
                    // Orbit controls allow the camera to orbit around a target.
                    this.controls = new OrbitControls( this.activeCamera, this.renderer.domElement );
                    this.controls.enableZoom = true
                    // for soft camera rotation while in submarine mode
                    this.contents.submarineController.setupListeners()
                    break;
                case 'Fixed':
                case '1PersonSubmarine':
                    this.controls = new OrbitControls( this.activeCamera, this.renderer.domElement );
                    this.controls.enableZoom = false
                    this.controls.enableRotate = false
                    this.controls.enabled = false
                    this.contents.submarineController.setupListeners()
                    break;
                default:
                    this.controls.object = this.activeCamera
            }
        }
    }

    initPolygonalMode() {
        this.previousPolygonalMode = 'Fill';
        this.polygonalMode = 'Fill';
    }

    syncPolygonalMode() {
        this.previousPolygonalMode = this.polygonalMode;
    }

    detectPolygonalModeChange() {
        return this.polygonalMode !== this.previousPolygonalMode;
    }
        
    updatePolygonalMode() {
        if (this.detectPolygonalModeChange()) {
            this.syncPolygonalMode();
            switch (this.polygonalMode) {
                case 'Fill':
                    traverseChildrenWireframe(this.scene.children, false);
                break;
                case 'Wireframe':
                    traverseChildrenWireframe(this.scene.children, true);
                break;
            }
        }
    }

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }
    }
    /**
     * 
     * @param {MyContents} contents the contents object 
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * @param {MyGuiInterface} contents the gui interface object
     */
    setGui(gui) {   
        this.gui = gui
    }

    /**
    * the main render function. Called in a requestAnimationFrame loop
    */
    render () {
        this.stats.begin()
        this.updateCameraIfRequired()

        this.updatePolygonalMode();

        // update the animation if contents were provided
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.contents.update()
        }

        // required if controls.enableDamping or controls.autoRotate are set to true 
        if (this.activeCameraName === 'FreeFly') {
            const delta = this.clock.getDelta()
            this.controls.update(delta);
        }
        else {
            this.controls.update();
        }

        // render the scene
        this.renderer.render(this.scene, this.activeCamera);

        // subsequent async calls to the render loop
        requestAnimationFrame( this.render.bind(this) );

        this.lastCameraName = this.activeCameraName
        this.stats.end()
    }
}


export { MyApp };
