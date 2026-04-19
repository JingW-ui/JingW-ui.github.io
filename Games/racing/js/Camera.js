import * as THREE from 'three';

export class Camera {

	constructor() {

		this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 60 );

		// Dynamic camera offset for immersive follow (QQ Racing style)
		this.baseOffset = new THREE.Vector3( 0, 2.5, -7 ); // Lower and closer for more intensity
		this.currentOffset = new THREE.Vector3().copy( this.baseOffset );
		this.targetPosition = new THREE.Vector3();
		this.lookAtTarget = new THREE.Vector3();

		// Camera smoothing parameters
		this.positionSmoothing = 4.5;  // Even faster follow for responsive feel
		this.offsetSmoothing = 3.5;    // Quicker offset adjustment
		this.lookAtSmoothing = 6.5;    // Snappier look-at

		this.camera.position.copy( this.baseOffset );
		this.camera.lookAt( 0, 0, 0 );

		window.addEventListener( 'resize', () => {

			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();

		} );

	}

	update( dt, vehiclePosition, vehicleQuaternion, speed ) {

		// Calculate dynamic offset based on vehicle rotation
		const rotatedOffset = this.baseOffset.clone().applyQuaternion( vehicleQuaternion );
		
		// Smoothly interpolate current offset to target offset
		this.currentOffset.lerp( rotatedOffset, dt * this.offsetSmoothing );

		// Calculate camera target position (vehicle position + offset)
		const cameraTargetPos = vehiclePosition.clone().add( this.currentOffset );
		
		// Smoothly move camera to target position
		this.camera.position.lerp( cameraTargetPos, dt * this.positionSmoothing );

		// Calculate look-at target (slightly ahead of vehicle for better view)
		const forward = new THREE.Vector3( 0, 0, 1 ).applyQuaternion( vehicleQuaternion );
		forward.y = 0;
		forward.normalize();
		
		// Look slightly ahead based on speed
		const lookAheadDistance = 5 + speed * 5;
		this.lookAtTarget.copy( vehiclePosition ).add( forward.multiplyScalar( lookAheadDistance ) );
		
		// Smoothly adjust look-at point
		const currentLookAt = new THREE.Vector3();
		this.camera.getWorldDirection( currentLookAt );
		currentLookAt.add( this.camera.position );
		currentLookAt.lerp( this.lookAtTarget, dt * this.lookAtSmoothing );
		
		this.camera.lookAt( currentLookAt );

	}

}
