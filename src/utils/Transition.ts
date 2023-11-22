import { OrthographicCamera, Scene, ShaderMaterial, WebGLRenderer } from 'three'
import SceneA from '../scenes/SceneA';
import SceneB from '../scenes/SceneB';
import { ThreeModels, Transition as TransitionType } from '../types'
import { Tween, update } from 'three/examples/jsm/libs/tween.module'

export default class Transition {
	private scene: Scene;
	// private needsTextureChange: boolean;

	constructor(sceneA: SceneA | SceneB, sceneB: SceneA | SceneB, models: ThreeModels, transition: TransitionType) {
		this.scene = new Scene;
		this.scene.add(models.planeShader);

		(models.planeShader.material as ShaderMaterial).uniforms.tDiffuse2.value = sceneA.fbo.texture;
		(models.planeShader.material as ShaderMaterial).uniforms.tDiffuse1.value = sceneB.fbo.texture;
		transition.myTween = new Tween(transition)
			.to({ transition: 1 }, 5000);
		transition.myTweenBack = new Tween(transition)
			.to({ transition: 0 }, 100)
			.onComplete(() => { transition.animate = false; });
		// this.needsTextureChange = false;
	}

	private resize(models: ThreeModels, camera: OrthographicCamera, renderer: WebGLRenderer) {
		models.camera[0].aspect = window.innerWidth / window.innerHeight;
		models.camera[0].updateProjectionMatrix();
		models.camera[1].aspect = window.innerWidth / window.innerHeight;
		models.camera[1].updateProjectionMatrix();
	
		camera.left = window.innerWidth / -2;
		camera.right = window.innerWidth / 2;
		camera.top = window.innerHeight / 2;
		camera.bottom = window.innerHeight / -2;
		camera.updateProjectionMatrix();
	
		(models.backgroundShader.material as ShaderMaterial).uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
	
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	  }

	  
	public render(delta: number, camera: OrthographicCamera, sceneA: SceneA | SceneB, sceneB: SceneA | SceneB, renderer: WebGLRenderer, models: ThreeModels, transition: TransitionType) {
		// Transition animation

		if (transition.animate) {
			//generate une nouvelle image avec les images de la scene A et B
			if (transition.sceneWeAt == 0) {
				transition.transition = Math.max(Math.min(transition.transitionBis + (Math.cos(delta * 1) - 1) * 0.1, 1), 0);
			}
			// if (transition.sceneWeAt == 1) {
			update();
			// }
			// Change the current alpha texture after each transition
			// needsTextureChange = true;
		}
		(models.planeShader.material as ShaderMaterial).uniforms.mixRatio.value = transition.transition;
		// Prevent render both scenes when it's not necessary
		if (transition.transition == 0) {
			sceneA.render(delta, false, transition);
			// sceneB.render(delta, false, transition);
		} else if (transition.transition == 1) {
			sceneB.render(delta, false, transition);
		} else {
			// When 0<transition<1 render transition between two scenes
			this.resize(models, camera, renderer);
			sceneA.render(delta, true, transition);
			sceneB.render(delta, true, transition);

			renderer.setRenderTarget(null);
			renderer.clear();
			renderer.render(this.scene, camera);
		}
	}
}