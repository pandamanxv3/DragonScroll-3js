import { ThreeModels } from '../types'

export function cloneThreeModels(models: ThreeModels): ThreeModels {
	return {
		backgroundTexture: models.backgroundTexture,
		backgroundShader: models.backgroundShader,
		fontA1: models.fontA1,
		fontA2: models.fontA2,
		fontB: models.fontB,
		fontParticules: models.fontParticules.clone(true),
		cube: models.cube.clone(),
		torus: models.torus.map((mesh) => mesh.clone()),
		dragonUnBroken: models.dragonUnBroken.clone(),
		dragonWireframe: models.dragonWireframe.clone(),
		dragonParticles: models.dragonParticles.clone(true),
		dragonSphere: models.dragonSphere.clone(),
		rockA: models.rockA.clone(),
		rockB: models.rockB.clone(),
		rockC: models.rockC.clone(),
		RockD: models.RockD.clone(),
		dragonBroken: models.dragonBroken.clone(),
		dragonUnBrokenNoSphere: models.dragonUnBrokenNoSphere.clone(),
		planeShader: models.planeShader,
		gate: models.gate.clone(),
		aureole: models.aureole.map((group) => group.clone()),
		camera: models.camera,
		water: models.water,
		textContainer: models.textContainer,
		textTitle: models.textTitle,
		textSubtitle: models.textSubtitle,
		creditText : models.creditText,
	};
}