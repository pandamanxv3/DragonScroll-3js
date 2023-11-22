import { ThreeModels } from '../types'

export function cloneThreeModels(models: ThreeModels): ThreeModels {
	return {
		backgroundTexture: models.backgroundTexture,
		backgroundShader: models.backgroundShader,
		fontA1: models.fontA1,
		fontA2: models.fontA2,
		fontB: models.fontB,
		cube: models.cube,
		torus: models.torus.map((mesh) => mesh.clone()),
		fontParticules: models.fontParticules.clone(),
		dragonUnBroken: models.dragonUnBroken.clone(),
		dragonWireframe: models.dragonWireframe.clone(),
		dragonParticles: models.dragonParticles.clone(),
		dragonCenter: models.dragonCenter.clone(),
		dragonDown: models.dragonDown.clone(),
		dragonSphere: models.dragonSphere.clone(),
		dragonUp: models.dragonUp.clone(),
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
	};
}