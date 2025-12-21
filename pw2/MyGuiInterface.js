import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui = new GUI();
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
            showCapsuleHelper: false,
        };
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', ['FreeFly', '3PersonSubmarine', 'Fixed', '1PersonSubmarine']).name("active camera");
        cameraFolder.add(this.app, 'polygonalMode', ['Fill', 'Wireframe']).name('polygonal mode');
        // note that we are using a property from the app 

        cameraFolder.add( this.app.postprocessing.params, 'focus', 1, 50, 1).onChange( () => this.app.postprocessing.update() );
        cameraFolder.add( this.app.postprocessing.params, 'aperture', 0.00001, 0.001, 0.00001).onChange( () => this.app.postprocessing.update() );
        cameraFolder.add( this.app.postprocessing.params, 'maxblur', 0.0, 0.01, 0.001).onChange( () => this.app.postprocessing.update() );
        
        cameraFolder.close()

        const boidFolder = this.datgui.addFolder('Boid')
        boidFolder.add(this.app.contents.boid, 'useBVH')
            .name('BVH Acceleration')
            .listen();

        boidFolder.add({ mode: "neutral" }, "mode", ["separate", "neutral", "join"])
            .name("Behavior")
            .onChange(mode => {
                const boid = this.app.contents.boid;

                if (mode === "separate") {
                    boid.separation = 2;
                    boid.cohesion = 1.5;
                }
                else if (mode === "neutral") {
                    boid.separation = 1.5;
                    boid.cohesion = 1.5;
                }
                else if (mode === "join") {
                    boid.separation = 1.5;
                    boid.cohesion = 2;
                }
            });

        boidFolder.add(this.app.contents.boid, 'alignment', 0, 1, 0.1).listen();
        boidFolder.add(this.app.contents.boid, 'moveSpeed', 0.1, 10, 0.5).listen();
        boidFolder.add(this.app.contents.boid, 'awareness', 0.1, 25, 0.1).listen();
        boidFolder.close()

        // BVH Helpers 
        const bvhFolder = this.datgui.addFolder('BVH Helpers');

        bvhFolder.add(this.debug, 'showBVHHelper')
            .name('Terrain BVH Helper')
            .onChange(v => this.contents.terrainBVHHelper.visible = v);

        bvhFolder.add(this.debug, 'showCapsuleHelper')
            .name('Submarine Hitbox Helper')
            .onChange(v => this.contents.submarineBVHHelper.visible = v);

        bvhFolder.close();

        // Submarine
        const submarineFolder = this.datgui.addFolder('Submarine')
        submarineFolder.close()

        // Submarine Shield
        const shieldFolder = submarineFolder.addFolder('Submarine Shield')
        shieldFolder.open()

        const shieldParams = this.contents.shieldParams
        shieldFolder.add(shieldParams, 'c', 0, 1.5, 0.1).onChange(v => this.contents.shield.setIntensity(v, shieldParams.p))
        shieldFolder.add(shieldParams, 'p', 0, 8, 1).onChange(v => this.contents.shield.setIntensity(shieldParams.c, v))
        shieldFolder.addColor(shieldParams, 'color').onChange(v => this.contents.shield.setColor(v))
        shieldFolder.add(shieldParams, 'visible').onChange(v => this.contents.shield.visible = v)
        
        // Submarine Light
        const lightsFolder = submarineFolder.addFolder('Submarine Lights');
        lightsFolder.open()

        lightsFolder.add(this.contents.submarineController.frontLightHelper, 'visible')
            .name('Show Front Light Helper');

        lightsFolder.add(this.contents.submarineController.warningLightHelper, 'visible')
            .name('Show Warning Helper');

        const frontFolder = lightsFolder.addFolder('Front Light (Spot)');

        const fl = this.contents.submarineController.frontLight;

        frontFolder.addColor({ color: `#${fl.color.getHexString()}` }, 'color')
            .name("Color")
            .onChange(v => {
                fl.color.set(v);
            });

        frontFolder.add(fl, 'intensity', 0, 200, 1).name('Intensity');
        frontFolder.add(fl, 'distance', 0, 200, 1).name('Distance');
        frontFolder.add(fl, 'angle', 0.1, 1, 0.01).name('Angle');
        frontFolder.add(fl, 'penumbra', 0, 1, 0.01).name('Penumbra');
        frontFolder.add(fl, 'decay', 0, 4, 0.1).name('Decay');

        const warnFolder = lightsFolder.addFolder('Warning Light (Point)');

        const wl = this.contents.submarineController.warningLight;

        warnFolder.addColor({ color: `#${wl.color.getHexString()}` }, 'color')
            .name("Color")
            .onChange(v => {
                fl.color.set(v);
            });


        warnFolder.add(wl, 'intensity', 0, 200, 1).name('Intensity (max)');
        warnFolder.add(wl, 'distance', 0, 200, 1).name('Distance');
        warnFolder.add(wl, 'decay', 0, 4, 0.1).name('Decay');

        // Warning pulso (freq)
        warnFolder.add(this.contents.submarineController, 'warningLightFrequency', 0.1, 5, 0.1)
            .name('Pulse Frequency');

    }
}

export { MyGuiInterface };
