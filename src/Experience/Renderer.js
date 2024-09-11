import * as THREE from 'three';
import Experience from './Experience.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.canvas = this.experience.canvas;
    this.debug = this.experience.debug;

    // Debug panel
    if (this.debug.active) {
      this.rendererTweaks = this.debug.ui.addFolder({
        title: 'Renderer Tweaks',
      });
    }
    this.debugObject = {};

    this.setIntance();
  }

  setIntance() {
    // Debug items
    this.debugObject.clearColor = '#24262c';

    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.instance.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setClearColor(this.debugObject.clearColor);
    this.instance.setPixelRatio(this.sizes.pixelRatio);

    // Debug
    if (this.debug.active) {
      this.rendererTweaks
        .addBinding(this.debugObject, 'clearColor')
        .on('change', () => {
          this.instance.setClearColor(this.debugObject.clearColor);
        });
    }

    // Post processing
    this.composer = new EffectComposer(this.instance);

    this.renderPass = new RenderPass(this.scene, this.camera.instance);
    this.composer.addPass(this.renderPass);

    this.glitchPass = new FilmPass(8, false);
    this.composer.addPass(this.glitchPass);

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    // this.instance.render(this.scene, this.camera.instance);

    this.composer.render();
  }
}
