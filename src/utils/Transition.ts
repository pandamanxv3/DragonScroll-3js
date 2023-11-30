import { OrthographicCamera, Scene, ShaderMaterial, WebGLRenderer } from 'three'
import SceneA from '../scenes/SceneA';
import SceneB from '../scenes/SceneB';
import { ThreeModels, Transition as TransitionType } from '../types'
import { Tween, update } from 'three/examples/jsm/libs/tween.module'

export default class Transition {
	private scene: Scene;

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
	}
	  
	public render(delta: number, camera: OrthographicCamera, sceneA: SceneA | SceneB, sceneB: SceneA | SceneB, renderer: WebGLRenderer, models: ThreeModels, transition: TransitionType) {
		if (transition.animate) {
			if (transition.sceneWeAt == 0) {
				transition.transition = Math.max(Math.min(transition.transitionBis + (Math.cos(delta * 1) - 1) * 0.1, 1), 0);
			}
			update();
		}
		(models.planeShader.material as ShaderMaterial).uniforms.mixRatio.value = transition.transition;
		if (transition.transition == 0) {
			sceneA.render(delta, false, transition);
		} else if (transition.transition == 1) {
			sceneB.render(delta, false, transition);
		} else {
			sceneA.render(delta, true, transition);
			sceneB.render(delta, true, transition);

			renderer.setRenderTarget(null);
			renderer.clear();
			renderer.render(this.scene, camera);
		}
	}
}