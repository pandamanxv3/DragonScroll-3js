import { Scene , PerspectiveCamera, AmbientLight, HemisphereLight, WebGLRenderTarget, HalfFloatType, WebGLRenderer, Color } from 'three';
import { AnimationFunctionA, ThreeModels, Transition } from '../types';
import initAnimationsA from '../animations/animationA';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min';

export default class SceneA {
	public fbo: WebGLRenderTarget;

	private ambientLight: AmbientLight;
	private hemisphereLight: HemisphereLight;
	private scene: Scene;
	private animations: AnimationFunctionA[];
	private models: ThreeModels;
	private renderer: WebGLRenderer;

	constructor(models: ThreeModels, renderer: WebGLRenderer, gui: GUI) {  // TMP - Debug
		this.ambientLight = new AmbientLight(0xfff0dd, 0.5);
		this.hemisphereLight = new HemisphereLight(0xebdab7, 0x39305c, 0.8);
		this.scene = new Scene;
		this.animations = initAnimationsA();
		this.models = models;
		this.renderer = renderer;
		this.fbo = new WebGLRenderTarget(window.innerWidth, window.innerHeight, { type: HalfFloatType });

		this.scene.add(
			models.gate,
			models.dragonUnBrokenNoSphere,
			models.dragonSphere,
			models.aureole[0],
			models.aureole[1],
			models.aureole[2],
			models.water[0],
			models.cube,
			this.ambientLight,
			this.hemisphereLight,
			models.fontA1
		);

		this.reset();
		// TMP - Debug
		const lightUI = gui.addFolder('Light');
		const ambientLightUI = lightUI.addFolder('Ambient').close();
		ambientLightUI.addColor(this.ambientLight, 'color');
		ambientLightUI.add(this.ambientLight, 'intensity')
			.min(0)
			.max(10)
			.step(0.1);
		// ------------
	}

	public reset() {
		/* - Camera - */
		this.models.camera[0].position.set(-11.668095624446837, 7.0791641969833075, 27.986620027884758);
		this.models.camera[0].lookAt(8.49699361604131276, -0.2164219053147923, -0.8403326154054094);
		/* - Models - */
		this.models.dragonUnBrokenNoSphere.position.set(-4.75, -0.58, -0.53);
		this.models.dragonUnBrokenNoSphere.rotation.set(-0.711, -0.64, 0.010);
		this.models.dragonUnBrokenNoSphere.scale.set(2, 2, 2);

		this.models.dragonSphere.scale.set(0.04, 0.04, 0.04);
		this.models.dragonSphere.geometry.center();
		this.models.dragonSphere.geometry.computeBoundingBox();

		this.models.gate.scale.set(0.734, 1, 0.623);
		this.models.gate.position.set(-0.39, 2.1, -1.42);

		this.models.aureole[0].scale.set(10, 10, 7);
		this.models.aureole[1].scale.set(12, 12, 7);
		this.models.aureole[2].scale.set(15, 15, 7);
		this.models.aureole[0].position.set(0, 0, -25);
		this.models.aureole[1].position.set(0, 0, -25);
		this.models.aureole[2].position.set(0, 0, -25);
		this.models.aureole[0].rotation.set(0, 0, 0);
		this.models.aureole[1].rotation.set(0, 0, 0);
		this.models.aureole[2].rotation.set(0, 0, 0);

		this.models.fontA1.scale.set(2, 2, 2);
		this.models.fontA1.position.set(-8, 5.5, 2);
		this.models.fontA1.rotation.set(-Math.PI / 2, 0, Math.PI);

		this.models.water[0].rotation.x = -Math.PI / 2;
		this.models.water[0].position.y = -6;

		/* - Add - */
		this.models.gate.visible = true;
		this.models.dragonUnBrokenNoSphere.visible = true;
		this.models.dragonSphere.visible = true;
		this.models.aureole[0].visible = true;
		this.models.aureole[1].visible = true;
		this.models.aureole[2].visible = true;
		this.models.water[0].visible = true;
		this.models.cube.visible = false;
		this.models.fontA1.visible = false;
		this.hemisphereLight.visible = true;
		this.ambientLight.visible = true;
		this.scene.background = this.models.backgroundTexture;
	}

	public render(delta: number, rtt: boolean, transition: Transition): void {
		// renderer.setClearColor('#a7ccdb');
		this.animations[transition.animation](delta, this.models, this.models.camera[0], this.scene, transition)
		this.models.water[0].material.uniforms['time'].value = delta / 2;

		if (rtt) {
			this.renderer.setRenderTarget(this.fbo);
			this.renderer.clear();
			this.renderer.render(this.scene, this.models.camera[0]);
		} else {
			this.renderer.setRenderTarget(null);
			this.renderer.render(this.scene, this.models.camera[0]);
		}
	}
}