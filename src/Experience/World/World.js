import Experience from '../Experience.js';
import Particles from './Particles.js';

export default class World {
  constructor() {
    this.experience = new Experience();
    this.resources = this.experience.resources;

    this.resources.on('ready', () => {
      this.particles = new Particles();
    });
  }

  resize() {
    if (this.particles) {
      this.particles.resize();
    }
  }

  update() {
    if (this.particles) {
      this.particles.update();
    }
  }
}
