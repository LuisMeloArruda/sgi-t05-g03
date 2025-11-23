import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
        this.debug = {
            showBVHHelper: false,
            showCapsuleHelper: false
        };
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'FreeFly', '3PersonSubmarine', 'Fixed', '1PersonSubmarine'] ).name("active camera");
        cameraFolder.add(this.app, 'polygonalMode', ['Fill', 'Wireframe']).name('polygonal mode');
        // note that we are using a property from the app 
        cameraFolder.open()
        
        const boidFolder = this.datgui.addFolder('Boid')
        boidFolder.add(this.app.contents.boid, 'useBVH')
            .name('BVH Acceleration')
            .listen();

            boidFolder.add(this.app.contents.boid, 'cohesion',    0, 3, 0.2).listen();
            boidFolder.add(this.app.contents.boid, 'separation',  0, 3, 0.2).listen();
            boidFolder.add(this.app.contents.boid, 'alignment',   0, 3, 0.2).listen();
            boidFolder.add(this.app.contents.boid, 'moveSpeed',   0.1, 10, 0.5).listen();
            boidFolder.add(this.app.contents.boid, 'awareness',   1, 100, 0.1).listen();
        boidFolder.open()

        // BVH Helpers 
        const bvhFolder = this.datgui.addFolder('BVH Helpers');

        bvhFolder.add(this.debug, 'showBVHHelper')
            .name('Terrain BVH Helper')
            .onChange(v => this.contents.terrainBVHHelper.visible = v);

        bvhFolder.add(this.debug, 'showCapsuleHelper')
            .name('Submarine Hitbox Helper')
            .onChange(v => this.contents.submarineBVHHelper.visible = v);

        bvhFolder.open();
    }
}

export { MyGuiInterface };
