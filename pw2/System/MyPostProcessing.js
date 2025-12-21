import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { TintEffect } from './TintEffect.js';
import { ScratchesEffect } from './ScratchesEffect.js';

/**
 * @param {number} leafSize
 * @param {number} leafSize
 * @param {number} leafSize
 */
class MyPostProcessing {
    constructor (
        renderer,
        scene,
        activeCamera,
    ) {
    this.renderer = renderer
    this.scene = scene
    this.activeCamera = activeCamera

    this.composer = new EffectComposer(renderer);

    this.resScale = 0.5;
    this.composer.setSize(window.innerWidth * this.resScale, window.innerHeight * this.resScale);


    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    this.params = {
        focus: 5,
        aperture: 0.00025,
        maxblur: 0.01
    };

    // DoF effect
    this.bokehPass = new BokehPass(scene, camera, {
        focus: this.params.focus,
        aperture: this.params.aperture,
        maxblur: this.params.maxblur,
    });

    this.bokehPass.enabled = false
    this.composer.addPass(this.bokehPass);

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    // Tint effect
    this.tintEffect = new TintEffect({
        tintColor: new THREE.Vector3(1.1, 1.2, 0.9),
        strength: 0.8
    })
    this.composer.addPass(this.tintEffect.pass)

    // Scratches effect
    const loader = new THREE.TextureLoader()
    const scratchesTex = loader.load('objects/assets/periscope/scratches.jpeg')
    this.scratchesEffect = new ScratchesEffect(scratchesTex, 0.2)
    this.composer.addPass(this.scratchesEffect.pass)

    }

    update() {
        if (this.bokehPass.enabled) {
            const u = this.bokehPass.uniforms;
            u.focus.value = this.params.focus;
            u.aperture.value = this.params.aperture;
            u.maxblur.value = this.params.maxblur;
        }
    }

    setCamera(camera) {
        this.camera = camera;
        this.renderPass.camera = camera;
        this.bokehPass.camera = camera;

        this.bokehPass.enabled = !!camera.userData.useDOF;
        this.tintEffect.pass.enabled = !!camera.userData.useTint;
        this.scratchesEffect.pass.enabled = !!camera.userData.useScratches;
        
    }

    resize(width, height) {
        this.composer.setSize(width * this.resScale, height * this.resScale);
    }

    render() {
        this.composer.render();
    }
}

export { MyPostProcessing };