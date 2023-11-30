import { Scene, AmbientLight, WebGLRenderTarget, HalfFloatType, RectAreaLight, Vector3, Color, Clock, WebGLRenderer, HemisphereLight } from 'three'
import { AnimationFunctionB, ThreeModels, Transition } from '../types'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'
import initAnimationsB from '../animations/animationB'


export default class SceneB {
	public fbo: WebGLRenderTarget;

	private clock: Clock;
	private ambientLight: AmbientLight;
	private hemisphereLight: HemisphereLight;
	private reactAreaLights: { light: RectAreaLight, helper: RectAreaLightHelper }[];
	private scene: Scene;
	private animations: AnimationFunctionB;
	private animationFuncs: ((elapsedTime: number) => void)[];
	private parameters: {
		index: number,
		oldTime: number,
		nextAnimation: number,
		isOldTimeSet: boolean,
		setAnime: boolean[],
		setCam: boolean[],
		next: () => void
	};
	private models: ThreeModels;
	private renderer: WebGLRenderer;
	private tmp: boolean;

	constructor(models: ThreeModels, renderer: WebGLRenderer, transition: Transition) {
		const cameraListener = (event: MouseEvent) => this.animations.cameraAnimation(event, models.camera[1]);

		this.clock = new Clock;
		this.ambientLight = new AmbientLight(0xfff0dd, 0.5);
		this.hemisphereLight = new HemisphereLight(0xebdab7, 0x39305c, 0.1);
		this.reactAreaLights = [];
		for (let i = 0; i < 9; i++) {
			const light = new RectAreaLight('black', 0.0, 85, 85);
			const helper = new RectAreaLightHelper(light);
			this.reactAreaLights.push({ light, helper });
		}
		this.scene = new Scene;
		this.animations = initAnimationsB();
		this.parameters = {
			index: 0,
			oldTime: 0,
			nextAnimation: 5,
			isOldTimeSet: false,
			setAnime: [false, false, false, false, false, false, false, false, false, false],
			setCam: [false, false, false, false, false, false, false, false, false, false],
			next: () => {
				this.parameters.isOldTimeSet = false;
				this.parameters.index++;
				this.parameters.nextAnimation++;
				if (this.parameters.index > 9) {
					this.parameters.index = 0;
					this.parameters.oldTime = 0;
					this.parameters.nextAnimation = 5;
					transition.resetAnimation();
				}
			}
		}
		this.tmp = false;

		this.animationFuncs = [
			(elapsedTime) => {
				if (!this.parameters.isOldTimeSet) {
					this.scene.remove(
						this.hemisphereLight,
						models.dragonSphere,
						models.gate,
						models.aureole[0],
						models.aureole[1],
						models.aureole[2],
						models.water[0],
						models.cube
					);
					this.reset();
					this.parameters.setAnime = Array(this.parameters.setAnime.length).fill(false);
					this.parameters.setCam = Array(this.parameters.setCam.length).fill(false);
					this.scene.add(
						this.ambientLight,
						models.dragonUnBrokenNoSphere,
						models.fontParticules,
						models.fontA2,
						models.backgroundShader,
						models.water[1]
					);
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				}

				if (!this.animations.waterAnimation(elapsedTime - this.parameters.oldTime, this.parameters.setAnime, this.ambientLight, models, transition) && !this.parameters.setAnime[9]) {
					this.parameters.setAnime[9] = true;
					transition.needScroll = true;
				}
			},
			(elapsedTime) => {
				if (!this.tmp && !this.parameters.isOldTimeSet) {
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				}
				if (!this.tmp) {
					if (!this.animations.transitionAnimation(elapsedTime - this.parameters.oldTime, this.models)) {
						this.parameters.isOldTimeSet = false;
						this.tmp = true;
					}
					return;
				}
				if (!this.parameters.isOldTimeSet) {
					this.scene.remove(
						this.ambientLight,
						models.dragonUnBrokenNoSphere,
						models.fontParticules,
						models.fontA2,
						models.backgroundShader,
						models.water[1]
					);
					this.parameters.setAnime = Array(this.parameters.setAnime.length).fill(false);
					this.parameters.setCam = Array(this.parameters.setCam.length).fill(false);

					this.reactAreaLights.forEach(({ light, helper }) => {
						helper.visible = false;
						this.scene.add(light, helper);
					});
					models.fontB.forEach((font) => {
						font.lookAt(models.camera[1].position);
						font.visible = false;
						this.scene.add(font);
					});
					this.scene.add(
						models.dragonWireframe,
						models.torus[0],
						models.torus[1]
					);
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				}

				if (!this.animations.flashAnimation(elapsedTime - this.parameters.oldTime, this.parameters.setAnime, this.reactAreaLights, models, this.scene) && !this.parameters.setAnime[9]) {
					this.parameters.setAnime[9] = true;
					transition.needScroll = true;
				}
				this.animations.cameraFlashAnimation(elapsedTime - this.parameters.oldTime, this.parameters.setCam, models, cameraListener);
			},
			(elapsedTime) => {
				if (!this.parameters.isOldTimeSet) {
					models.fontB.forEach(font => { this.scene.add(font) });
					window.removeEventListener('mousemove', cameraListener);
					this.parameters.setAnime = Array(this.parameters.setAnime.length).fill(false);
					this.parameters.setCam = Array(this.parameters.setCam.length).fill(false);
					this.scene.add(
						this.ambientLight,
						models.dragonParticles,
						models.cube,
					);

					this.ambientLight.intensity = 0;
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				}
				if (!this.animations.galaxyAnimation(elapsedTime - this.parameters.oldTime, this.parameters.setAnime, this.ambientLight, this.reactAreaLights, models, this.scene)) {
					transition.needScroll = true;
					transition.animations_transiA[3] && (this.parameters.setAnime[9] = true);
				}
				this.animations.cameraGalaxyAnimation(elapsedTime - this.parameters.oldTime, this.parameters.setCam, models.camera[1]);
			},
			(elapsedTime) => {
				if (!this.parameters.isOldTimeSet) {
					this.scene.remove(models.dragonParticles);
					this.parameters.setAnime = Array(this.parameters.setAnime.length).fill(false);
					this.parameters.setCam = Array(this.parameters.setCam.length).fill(false);

					models.camera[1].position.set(-11.668, 7.079, 27.986);
					models.camera[1].lookAt(8.496, -0.216, -0.840);
					models.cube.position.set(-12.229, 7.282, 28.788);
					models.cube.lookAt(8.496, -0.216, -0.840);
					this.scene.add(
						this.hemisphereLight,
						models.dragonSphere,
					);
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				} else
					if (!this.animations.resetSphereAnimation(elapsedTime - this.parameters.oldTime, this.parameters.setAnime, this.ambientLight, this.hemisphereLight, models)) {
						transition.needScroll = true;
					}
			},
			(elapsedTime) => {
				if (!this.parameters.isOldTimeSet) {
					this.parameters.setAnime = Array(this.parameters.setAnime.length).fill(false);
					this.parameters.setCam = Array(this.parameters.setCam.length).fill(false);
					models.dragonUnBrokenNoSphere.rotation.set(-0.711, -0.64, 0.010);
					models.dragonUnBrokenNoSphere.scale.set(2, 2, 2);
					models.dragonUnBrokenNoSphere.position.x = -50
					models.dragonUnBrokenNoSphere.visible = true;
					this.scene.add(models.dragonUnBrokenNoSphere);
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				} else
					if (!this.animations.resetDragonAnimation(elapsedTime - this.parameters.oldTime, this.parameters.setAnime, this.ambientLight, this.hemisphereLight, models)) {
						transition.needScroll = true;
					}
			},
			(elapsedTime) => {
				if (!this.parameters.isOldTimeSet) {
					this.parameters.setAnime = Array(this.parameters.setAnime.length).fill(false);
					this.parameters.setCam = Array(this.parameters.setCam.length).fill(false);
					this.scene.add(models.gate);
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				} else
					if (!this.animations.resetGateAnimation(elapsedTime - this.parameters.oldTime, this.parameters.setAnime, this.ambientLight, this.hemisphereLight, models)) {
						transition.needScroll = true;
					}
			},
			(elapsedTime) => {
				if (!this.parameters.isOldTimeSet) {
					this.parameters.setAnime = Array(this.parameters.setAnime.length).fill(false);
					this.parameters.setCam = Array(this.parameters.setCam.length).fill(false);
					this.scene.add(models.aureole[0]);
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				} else
					if (!this.animations.resetAureoleAnimation[0](elapsedTime - this.parameters.oldTime, this.parameters.setAnime, this.ambientLight, this.hemisphereLight, models)) {
						transition.needScroll = true;
					}
			},
			(elapsedTime) => {
				if (!this.parameters.isOldTimeSet) {
					this.parameters.setAnime = Array(this.parameters.setAnime.length).fill(false);
					this.parameters.setCam = Array(this.parameters.setCam.length).fill(false);
					this.scene.add(models.aureole[1]);
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				} else
					if (!this.animations.resetAureoleAnimation[1](elapsedTime - this.parameters.oldTime, this.parameters.setAnime, this.ambientLight, this.hemisphereLight, models)) {
						transition.needScroll = true;
					}
			},
			(elapsedTime) => {
				if (!this.parameters.isOldTimeSet) {
					this.parameters.setAnime = Array(this.parameters.setAnime.length).fill(false);
					this.parameters.setCam = Array(this.parameters.setCam.length).fill(false);
					this.scene.add(models.aureole[2]);
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				} else
					if (!this.animations.resetAureoleAnimation[2](elapsedTime - this.parameters.oldTime, this.parameters.setAnime, this.ambientLight, this.hemisphereLight, models)) {
						transition.needScroll = true;
					}
			},
			(elapsedTime) => {
				if (!this.parameters.isOldTimeSet) {
					this.parameters.setAnime = Array(this.parameters.setAnime.length).fill(false);
					this.parameters.setCam = Array(this.parameters.setCam.length).fill(false);
					models.water[0].rotation.x = -Math.PI / 2;
					models.water[0].position.y = -50;
					this.scene.add(models.water[0]);
					this.parameters.oldTime = this.clock.getElapsedTime();
					this.parameters.isOldTimeSet = true;
				} else
					if (!this.animations.resetWaterAnimation(elapsedTime - this.parameters.oldTime, this.parameters.setAnime, this.ambientLight, this.hemisphereLight, models)) {
						this.parameters.next();
					}
			}
		]
		this.models = models;
		this.renderer = renderer;
		this.fbo = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { type: HalfFloatType });
	}

	public reset() {
		this.ambientLight.intensity = 0.5;
		this.hemisphereLight.intensity = 0.1;
		const positionLight = [
			new Vector3(-150, 100, 0),
			new Vector3(-200, 150, -150),
			new Vector3(0, 150, -100),
			new Vector3(150, 150, -100),
			new Vector3(-100, 0, -100),
			new Vector3(0, 0, -100),
			new Vector3(100, 0, -100),
			new Vector3(-100, -100, -50),
			new Vector3(0, -100, -100)
		];
		const lookAtLight = [
			new Vector3(100, 0, 0),
			new Vector3(100, -100, 0),
			new Vector3(0, 0, 0),
			new Vector3(100, 100, 0),
			new Vector3(0, 0, 0),
			new Vector3(0, 0, 0),
			new Vector3(0, 0, 0),
			new Vector3(0, 0, 0),
			new Vector3(0, 0, 0)
		];
		this.reactAreaLights.forEach(({ light, helper }, i): void => {
			light.position.copy(positionLight[i]);
			light.lookAt(lookAtLight[i]);
			helper.visible = true;
		});
		this.scene.background = new Color("black");
		this.models.backgroundTexture

		/* - Camera - */
		this.models.camera[1].lookAt(0, 0, 0);
		this.models.camera[1].position.set(-5.14, -11.93, 12.39);
		this.models.camera[1].rotation.set(0.706, -0.067, 0.056);
		this.models.camera[1].far = 300;
		this.models.camera[1].updateProjectionMatrix();

		/* - Fonts - */
		this.models.fontParticules.position.set(-1.268, 3.4, 2);
		this.models.fontParticules.rotation.set(-2.25, Math.PI, 0.05);
		this.models.fontParticules.scale.set(-1.8, -1.8, -1.8);
		this.models.fontA2.position.set(4.381, 22.855, 20);
		this.models.fontA2.rotation.set(2.606, 3.406, 0);
		this.models.fontB[0].position.set(-150, 100, 0);
		this.models.fontB[1].position.set(-100, 0, -100);
		this.models.fontB[2].position.set(0, 150, -100);
		this.models.fontB[3].position.set(0, -100, -100);
		this.models.fontB[4].position.set(100, 0, -100);
		this.models.fontB[5].position.set(150, 150, -100);

		/* - Models - */
		this.models.dragonUnBrokenNoSphere.position.set(-4.75, -0.58, -0.53);
		this.models.dragonUnBrokenNoSphere.scale.set(-2, -2, -2);
		this.models.dragonUnBrokenNoSphere.rotation.set(2.1959, -0.64, 0.010);
		this.models.dragonUnBrokenNoSphere.visible = true;

		this.models.dragonParticles.visible = false;

		this.models.water[1].position.set(-5.2, 0.988, -4.912);
		this.models.water[1].scale.set(15, 15, 0.413);
		this.models.water[1].rotation.set(0.825, -0.179, -0.052);

		this.models.backgroundShader.position.set(-5.28, 0.988, -4.912);
		this.models.backgroundShader.scale.set(15, 15, 0.413);
		this.models.backgroundShader.rotation.set(0.825, -0.179, -0.052);

		this.models.torus[0].position.set(0, 0, -50);
		this.models.torus[0].rotation.x = Math.PI / 2;
		this.models.torus[1].position.set(0, 0, -50);
		this.models.torus[1].rotation.x = Math.PI / 2;

		this.models.cube.visible = false;

		/* - Models for reset - */
		this.models.gate.scale.set(0.734, 1, 0.623);
		this.models.gate.position.set(-50, 0, 0);

		this.models.dragonSphere.position.set(-50, 0, 0)
		this.models.dragonSphere.scale.set(0.04, 0.04, 0.04);
		this.models.dragonSphere.geometry.center();
		this.models.dragonSphere.geometry.computeBoundingBox();

		this.models.aureole[0].scale.set(10, 10, 7);
		this.models.aureole[1].scale.set(12, 12, 7);
		this.models.aureole[2].scale.set(15, 15, 7);
		this.models.aureole[0].position.set(-50, 0, 0);
		this.models.aureole[1].position.set(-50, 0, 0);
		this.models.aureole[2].position.set(-50, 0, 0);
		this.models.aureole[0].rotation.set(0, 0, 0);
		this.models.aureole[1].rotation.set(0, 0, 0);
		this.models.aureole[2].rotation.set(0, 0, 0);
	}

	public render(_, rtt: boolean, transition: Transition) {
		const elapsedTime = this.clock.getElapsedTime();
		this.animationFuncs[this.parameters.index](elapsedTime);
		if (transition.animation < 14 && transition.animation === this.parameters.nextAnimation) {
			this.parameters.next();
		}
		this.renderer.setClearColor('black');

		if (rtt) {
			this.renderer.setRenderTarget(this.fbo);
			this.renderer.clear();
			this.renderer.render(this.scene, this.models.camera[1]);

		} else {
			this.renderer.setRenderTarget(null);
			this.renderer.render(this.scene, this.models.camera[1]);
		}
	}

}