import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

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

    this.resScale = 1;
    this.composer.setSize(window.innerWidth * this.resScale, window.innerHeight * this.resScale);


    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    this.params = {
        focus: 5,
        aperture: 0.00025,
        maxblur: 0.01
    };

    this.bokehPass = new BokehPass(scene, camera, {
        focus: this.params.focus,
        aperture: this.params.aperture,
        maxblur: this.params.maxblur,
    });

    this.composer.addPass(this.bokehPass);

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
    }

    update() {
        const u = this.bokehPass.uniforms;
        u.focus.value = this.params.focus;
        u.aperture.value = this.params.aperture;
        u.maxblur.value = this.params.maxblur;
    }

    setCamera(camera) {
        this.camera = camera;
        this.renderPass.camera = camera;
        this.bokehPass.camera = camera;
    }

    resize(width, height) {
        this.composer.setSize(width * this.resScale, height * this.resScale);
    }

    render() {
        this.composer.render();
    }
}

export { MyPostProcessing };
