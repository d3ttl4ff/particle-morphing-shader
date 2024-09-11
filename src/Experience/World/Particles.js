import * as THREE from 'three';
import gsap from 'gsap';
import Experience from '../Experience';
import particlesVertexShader from '../../shaders/particles/vertex.glsl';
import particlesFragmentShader from '../../shaders/particles/fragment.glsl';

export default class Particles {
  constructor() {
    this.experience = new Experience();
    this.time = this.experience.time;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    // Options
    this.models = this.resources.items.swmodels;

    if (this.debug.active) {
      this.tweaks = this.debug.ui.addFolder({ title: 'Particle Tweaks' });
    }

    this.setPositions();
    this.setParticlesGeometry();
    this.setParticlesMaterial();
    this.setParticles();
  }

  setPositions() {
    this.particlesObject = {};
    this.particlesObject.index = 4;

    const positions = this.models.scene.children.map(
      (child) => child.geometry.attributes.position
    );

    this.particlesObject.maxCount = 0;
    for (const position of positions) {
      if (position.count > this.particlesObject.maxCount) {
        this.particlesObject.maxCount = position.count;
      }
    }

    this.particlesObject.positions = [];
    for (const position of positions) {
      const originalArray = position.array;
      const newArray = new Float32Array(this.particlesObject.maxCount * 3);

      for (let i = 0; i < this.particlesObject.maxCount; i++) {
        const i3 = i * 3;

        if (i3 < originalArray.length) {
          newArray[i3] = originalArray[i3];
          newArray[i3 + 1] = originalArray[i3 + 1];
          newArray[i3 + 2] = originalArray[i3 + 2];
        } else {
          const randomIndex = Math.floor(position.count * Math.random()) * 3;
          newArray[i3] = originalArray[randomIndex + 0];
          newArray[i3 + 1] = originalArray[randomIndex + 1];
          newArray[i3 + 2] = originalArray[randomIndex + 2];
        }
      }

      this.particlesObject.positions.push(
        new THREE.Float32BufferAttribute(newArray, 3)
      );
    }
  }

  setParticlesGeometry() {
    const sizesArray = new Float32Array(this.particlesObject.maxCount);

    for (let i = 0; i < this.particlesObject.maxCount; i++) {
      sizesArray[i] = Math.random();
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      'position',
      this.particlesObject.positions[this.particlesObject.index]
    );
    this.geometry.setAttribute(
      'aPositionTarget',
      this.particlesObject.positions[3]
    );
    this.geometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(sizesArray, 1)
    );
  }

  setParticlesMaterial() {
    this.materialParameters = {};
    this.materialParameters.color0 = '#0044ff';
    this.materialParameters.color1 = '#6a00ff';

    this.material = new THREE.ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uSize: new THREE.Uniform(0.06),
        uResolution: new THREE.Uniform(
          new THREE.Vector2(
            this.sizes.width * this.sizes.pixelRatio,
            this.sizes.height * this.sizes.pixelRatio
          )
        ),
        uProgress: new THREE.Uniform(0),
        uColor0: new THREE.Uniform(
          new THREE.Color(this.materialParameters.color0)
        ),
        uColor1: new THREE.Uniform(
          new THREE.Color(this.materialParameters.color1)
        ),
      },
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Methods
    this.particlesObject.morph = (index) => {
      const innerElement = document.querySelector('.inner');

      // Glitch effect for opacity
      const glitchEffect = () => {
        const glitchTimeline = gsap.timeline({ repeat: 4, yoyo: true });
        glitchTimeline.to(innerElement, {
          opacity: Math.random() * 0.5 + 0.3,
          duration: 0.1,
          ease: 'linear',
        });
      };

      // Slide and fade out previous name
      gsap.to(innerElement, {
        x: -100,
        opacity: 0,
        duration: 1.5,
        ease: 'power2.in',
        onComplete: () => {
          if (index === 0) {
            innerElement.innerHTML = 'DARTH VADER';
            innerElement.style.color = '#ff0000';
          } else if (index === 1) {
            innerElement.innerHTML = 'TIE PILOT';
            innerElement.style.color = '#21ffa3';
          } else if (index === 2) {
            innerElement.innerHTML = 'STORM TROOPER';
            innerElement.style.color = '#ffd901';
          } else if (index === 3) {
            innerElement.innerHTML = 'BOBA FETT';
            innerElement.style.color = '#00ff06';
          } else if (index === 4) {
            innerElement.innerHTML = 'THREE JS';
            innerElement.style.color = '#9246ff';
          }
          gsap.fromTo(
            innerElement,
            { x: 100, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              onStart: () => {
                glitchEffect();
              },
            }
          );
        },
      });

      // Update attributes
      this.geometry.attributes.position =
        this.particlesObject.positions[this.particlesObject.index];
      this.geometry.attributes.aPositionTarget =
        this.particlesObject.positions[index];

      // Animate uProgress
      gsap.fromTo(
        this.material.uniforms.uProgress,
        { value: 0 },
        {
          value: 1,
          duration: 3,
          ease: 'linear',
          onUpdate: () => {
            this.tweaks.refresh();

            if (index === 0) {
              gsap.to(this.material.uniforms.uColor0.value, {
                r: new THREE.Color('#2066ff').r,
                g: new THREE.Color('#2066ff').g,
                b: new THREE.Color('#2066ff').b,
                delay: 1,
                duration: 0.5,
                ease: 'linear',
                onUpdate: () => {
                  this.materialParameters.color0 = '#2066ff';
                },
              });
              gsap.to(this.material.uniforms.uColor1.value, {
                r: new THREE.Color('#ff0000').r,
                g: new THREE.Color('#ff0000').g,
                b: new THREE.Color('#ff0000').b,
                delay: 1,
                duration: 0.5,
                ease: 'linear',
                onUpdate: () => {
                  this.materialParameters.color1 = '#ff0000';
                },
              });
            } else if (index === 1) {
              gsap.to(this.material.uniforms.uColor0.value, {
                r: new THREE.Color('#21ffa3').r,
                g: new THREE.Color('#21ffa3').g,
                b: new THREE.Color('#21ffa3').b,
                delay: 1,
                duration: 0.5,
                ease: 'linear',
                onUpdate: () => {
                  this.materialParameters.color0 = '#21ffa3';
                },
              });
              gsap.to(this.material.uniforms.uColor1.value, {
                r: new THREE.Color('#0022ff').r,
                g: new THREE.Color('#0022ff').g,
                b: new THREE.Color('#0022ff').b,
                delay: 1,
                duration: 0.5,
                ease: 'linear',
                onUpdate: () => {
                  this.materialParameters.color1 = '#0022ff';
                },
              });
            } else if (index === 2) {
              gsap.to(this.material.uniforms.uColor0.value, {
                r: new THREE.Color('#ffd901').r,
                g: new THREE.Color('#ffd901').g,
                b: new THREE.Color('#ffd901').b,
                delay: 1,
                duration: 0.5,
                ease: 'linear',
                onUpdate: () => {
                  this.materialParameters.color0 = '#ffd901';
                },
              });
              gsap.to(this.material.uniforms.uColor1.value, {
                r: new THREE.Color('#01ff98').r,
                g: new THREE.Color('#01ff98').g,
                b: new THREE.Color('#01ff98').b,
                delay: 1,
                duration: 0.5,
                ease: 'linear',
                onUpdate: () => {
                  this.materialParameters.color1 = '#01ff98';
                },
              });
            } else if (index === 3) {
              gsap.to(this.material.uniforms.uColor0.value, {
                r: new THREE.Color('#740000').r,
                g: new THREE.Color('#740000').g,
                b: new THREE.Color('#740000').b,
                delay: 1,
                duration: 0.5,
                ease: 'linear',
                onUpdate: () => {
                  this.materialParameters.color0 = '#740000';
                },
              });
              gsap.to(this.material.uniforms.uColor1.value, {
                r: new THREE.Color('#00ff06').r,
                g: new THREE.Color('#00ff06').g,
                b: new THREE.Color('#00ff06').b,
                delay: 1,
                duration: 0.5,
                ease: 'linear',
                onUpdate: () => {
                  this.materialParameters.color1 = '#00ff06';
                },
              });
            } else if (index === 4) {
              gsap.to(this.material.uniforms.uColor0.value, {
                r: new THREE.Color('#0044ff').r,
                g: new THREE.Color('#0044ff').g,
                b: new THREE.Color('#0044ff').b,
                delay: 1,
                duration: 0.5,
                ease: 'linear',
                onUpdate: () => {
                  this.materialParameters.color0 = '#0044ff';
                },
              });
              gsap.to(this.material.uniforms.uColor1.value, {
                r: new THREE.Color('#6a00ff').r,
                g: new THREE.Color('#6a00ff').g,
                b: new THREE.Color('#6a00ff').b,
                delay: 1,
                duration: 0.5,
                ease: 'linear',
                onUpdate: () => {
                  this.materialParameters.color1 = '#6a00ff';
                },
              });
            }
          },
        }
      );

      // Aniamte camera
      if (index === 4) {
        const radius = 10;
        const targetY = 5;

        gsap.to(this.camera.instance.position, {
          x: 0,
          y: targetY + radius * Math.cos(Math.PI * 2),
          duration: 1,
          ease: 'linear',
          onUpdate: () => {
            this.camera.instance.lookAt(new THREE.Vector3(0, 0, 0));
            this.camera.instance.updateProjectionMatrix();
          },
        });
      } else {
        gsap.to(this.camera.instance.position, {
          x: 0,
          y: 0,
          duration: 1,
          ease: 'linear',
          onUpdate: () => {
            this.camera.instance.lookAt(new THREE.Vector3(0, 0, 0));
            this.camera.instance.updateProjectionMatrix();
          },
        });
      }

      // Save index
      this.particlesObject.index = index;
    };

    const objectCount = this.models.scene.children;
    for (let i = 0; i < objectCount.length; i++) {
      this.particlesObject[`morph${i}`] = () => {
        this.particlesObject.morph(i);
      };
    }

    // Tweaks
    if (this.debug.active) {
      this.tweaks
        .addBinding(this.materialParameters, 'color0', {
          label: 'uColor0',
        })
        .on('change', () => {
          this.material.uniforms.uColor0.value.set(
            this.materialParameters.color0
          );
        });
      this.tweaks
        .addBinding(this.materialParameters, 'color1', {
          label: 'uColor1',
        })
        .on('change', () => {
          this.material.uniforms.uColor1.value.set(
            this.materialParameters.color1
          );
        });

      this.tweaks.addBinding(this.material.uniforms.uProgress, 'value', {
        label: 'uProgress',
        min: 0,
        max: 1,
        step: 0.001,
      });

      this.morphParams = { auto: false };
      this.tweaks
        .addBinding(this.morphParams, 'auto', {
          label: 'autoMorph',
        })
        .on('change', (ev) => {
          if (ev.value === true) {
            this.particlesObject.morph(Math.floor(Math.random() * 4));
            this.autoMorphInterval = setInterval(() => {
              this.particlesObject.morph(Math.floor(Math.random() * 5));
            }, 3500);
          } else {
            clearInterval(this.autoMorphInterval);
            this.autoMorphInterval = null;
          }
        });

      objectCount.forEach((mesh, index) => {
        const morphBtn = this.tweaks.addButton({
          title: 'Play',
          label: `Morph ${index}`,
        });

        morphBtn.on('click', () => {
          this.particlesObject.morph(index);
        });
      });
    }
  }

  setParticles() {
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  resize() {
    this.material.uniforms.uResolution.value.set(
      this.sizes.width * this.sizes.pixelRatio,
      this.sizes.height * this.sizes.pixelRatio
    );
  }

  update() {
    this.material.uniforms.uTime.value += this.time.delta * 0.001;
  }
}
