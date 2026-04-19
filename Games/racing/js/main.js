import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { LightProbeGrid } from 'three/addons/lighting/LightProbeGrid.js';
import { LightProbeGridHelper } from 'three/addons/helpers/LightProbeGridHelper.js';
import { createWorldSettings, createWorld, addBroadphaseLayer, addObjectLayer, enableCollision, registerAll, updateWorld, rigidBody, box, MotionType } from 'crashcat';
import { Vehicle, MAX_SPEED } from './Vehicle.js';
import { Camera } from './Camera.js';
import { Controls } from './Controls.js';
import { buildTrack, decodeCells, computeSpawnPosition, computeTrackBounds } from './Track.js';
import { buildWallColliders, createSphereBody } from './Physics.js';
import { SmokeTrails } from './Particles.js';
import { DriftMarks } from './DriftMarks.js';
import { GameAudio } from './Audio.js';
import { VEHICLE_CONFIGS, getVehicleConfig } from './VehicleConfig.js';

// Color utility functions
function hexToRgba( hex, alpha ) {

	const r = parseInt( hex.slice( 1, 3 ), 16 );
	const g = parseInt( hex.slice( 3, 5 ), 16 );
	const b = parseInt( hex.slice( 5, 7 ), 16 );
	return `rgba(${ r }, ${ g }, ${ b }, ${ alpha })`;

}

function adjustColorBrightness( hex, percent ) {

	let r = parseInt( hex.slice( 1, 3 ), 16 );
	let g = parseInt( hex.slice( 3, 5 ), 16 );
	let b = parseInt( hex.slice( 5, 7 ), 16 );

	r = Math.min( 255, Math.max( 0, r + percent ) );
	g = Math.min( 255, Math.max( 0, g + percent ) );
	b = Math.min( 255, Math.max( 0, b + percent ) );

	return `#${ r.toString( 16 ).padStart( 2, '0' ) }${ g.toString( 16 ).padStart( 2, '0' ) }${ b.toString( 16 ).padStart( 2, '0' )}`;

}


const renderer = new THREE.WebGLRenderer( { 
	antialias: false, // Disable antialias for better performance
	powerPreference: 'high-performance', // Request high performance GPU
	precision: 'mediump' // Use medium precision for shaders
} );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 1.5 ) ); // Further limit pixel ratio
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // Faster shadow map type
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// Optimize bloom pass - reduce resolution for better performance
const bloomResolution = 0.5; // Render bloom at half resolution
const bloomPass = new UnrealBloomPass( 
	new THREE.Vector2( window.innerWidth * bloomResolution, window.innerHeight * bloomResolution ) 
);
bloomPass.strength = 0.015; // Slightly reduce strength
bloomPass.radius = 0.015;   // Reduce radius
bloomPass.threshold = 0.6;  // Increase threshold to affect fewer pixels

renderer.setEffects( [ bloomPass ] );

document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xadb2ba );
// Optimize fog - shorter distance to cull more objects
scene.fog = new THREE.Fog( 0xadb2ba, 25, 45 );

const dirLight = new THREE.DirectionalLight( 0xffffff, 2.5 ); // Reduce light intensity
dirLight.position.set( 11.4, 15, -5.3 );
dirLight.castShadow = true;
// Optimize shadow map - lower resolution for better performance
dirLight.shadow.mapSize.setScalar( 2048 ); // Reduced from 4096
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50; // Reduced from 60
dirLight.shadow.bias = -0.0001; // Reduce shadow acne
scene.add( dirLight );

const hemiLight = new THREE.HemisphereLight( 0xc8d8e8, 0x7a8a5a, 2 );
hemiLight.position.copy( dirLight.position )
scene.add( hemiLight );


window.addEventListener( 'resize', () => {

	renderer.setSize( window.innerWidth, window.innerHeight );

} );

const loader = new GLTFLoader();
const modelNames = [
	'vehicle-truck-yellow', 'vehicle-truck-green', 'vehicle-truck-purple', 'vehicle-truck-red',
	'track-straight', 'track-corner', 'track-bump', 'track-finish',
	'decoration-empty', 'decoration-forest', 'decoration-tents',
];

const models = {};
let selectedVehicleType = null;
let currentVehicleIndex = 0;
const vehicleTypes = Object.keys( VEHICLE_CONFIGS );
let previewScene = null;
let previewCamera = null;
let previewRenderer = null;
let previewVehicle = null;
let previewAnimationId = null;

// Game pause state
let isPaused = false;
let pauseBtn = null;
let pauseOverlay = null;
let resumeBtn = null;

async function loadModels() {

	const promises = modelNames.map( ( name ) =>
		new Promise( ( resolve, reject ) => {

			loader.load( `./models/${ name }.glb`, ( gltf ) => {

				gltf.scene.traverse( ( child ) => {

					if ( child.isMesh ) {

						child.material.side = THREE.FrontSide;
						child.frustumCulled = true; // Enable frustum culling for each mesh

					}

				} );

				// Godot imports vehicle models at root_scale=0.5, we scale to 0.75 for preview (1.5x)
				if ( name.startsWith( 'vehicle-' ) ) {

					gltf.scene.scale.setScalar( 0.75 ); // Increased from 0.5 to 0.75 (1.5x larger)

				}

				models[ name ] = gltf.scene;
				resolve();

			}, undefined, reject );

		} )
	);

	await Promise.all( promises );

	// Initialize preview scene after models are loaded
	initPreviewScene();

}

function initVehicleSelection() {

	const startBtn = document.getElementById( 'start-btn' );
	const indicatorContainer = document.getElementById( 'vehicle-indicator' );

	// Create indicator dots
	vehicleTypes.forEach( ( type, index ) => {

		const dot = document.createElement( 'div' );
		dot.className = 'indicator-dot';
		if ( index === 0 ) dot.classList.add( 'active' );

		dot.addEventListener( 'click', () => {

			selectVehicle( index );

		} );

		indicatorContainer.appendChild( dot );

	} );

	// Initialize with first vehicle
	selectVehicle( 0 );

	// Mouse wheel support
	const canvas = document.getElementById( 'preview-canvas' );
	canvas.addEventListener( 'wheel', ( e ) => {

		e.preventDefault();
		if ( e.deltaY > 0 ) {

			// Scroll down/right - next vehicle
			nextVehicle();

		} else {

			// Scroll up/left - previous vehicle
			prevVehicle();

		}

	}, { passive: false } );

	// Touch/swipe support
	let touchStartX = 0;
	let touchEndX = 0;

	canvas.addEventListener( 'touchstart', ( e ) => {

		touchStartX = e.changedTouches[ 0 ].screenX;

	}, { passive: true } );

	canvas.addEventListener( 'touchend', ( e ) => {

		touchEndX = e.changedTouches[ 0 ].screenX;
		handleSwipe();

	}, { passive: true } );

	function handleSwipe() {

		const swipeThreshold = 50;
		const diff = touchStartX - touchEndX;

		if ( Math.abs( diff ) > swipeThreshold ) {

			if ( diff > 0 ) {

				// Swipe left - next vehicle
				nextVehicle();

			} else {

				// Swipe right - previous vehicle
				prevVehicle();

			}

		}

	}

	// Keyboard support
	window.addEventListener( 'keydown', ( e ) => {

		if ( e.code === 'ArrowLeft' || e.code === 'KeyA' ) {

			prevVehicle();

		} else if ( e.code === 'ArrowRight' || e.code === 'KeyD' ) {

			nextVehicle();

		}

	} );

	startBtn.addEventListener( 'click', () => {

		// Stop preview animation to save performance
		if ( previewAnimationId ) {

			cancelAnimationFrame( previewAnimationId );
			previewAnimationId = null;

		}

		const selectScreen = document.getElementById( 'vehicle-select' );
		selectScreen.classList.add( 'hidden' );

		// Start the game after selection screen fades out
		setTimeout( () => {

			startGame( selectedVehicleType );

		}, 500 );

	} );

}

function togglePause() {

	isPaused = ! isPaused;

	if ( isPaused ) {

		// Pause the game
		pauseBtn.textContent = '▶';
		pauseBtn.classList.add( 'paused' );
		pauseOverlay.classList.add( 'active' );

		// Pause audio
		if ( audio && audio.engineSound && audio.engineSound.isPlaying ) {

			audio.engineSound.pause();

		}

		if ( audio && audio.engineLayerSound && audio.engineLayerSound.isPlaying ) {

			audio.engineLayerSound.pause();

		}

		if ( audio && audio.skidSound && audio.skidSound.isPlaying ) {

			audio.skidSound.pause();

		}

	} else {

		// Resume the game
		pauseBtn.textContent = '⏸';
		pauseBtn.classList.remove( 'paused' );
		pauseOverlay.classList.remove( 'active' );

		// Resume audio
		if ( audio && audio.engineSound ) {

			audio.engineSound.play();

		}

		if ( audio && audio.engineLayerSound ) {

			audio.engineLayerSound.play();

		}

		if ( audio && audio.skidSound ) {

			audio.skidSound.play();

		}

	}

}

function selectVehicle( index ) {

	currentVehicleIndex = index;
	selectedVehicleType = vehicleTypes[ index ];

	// Update indicator dots
	const dots = document.querySelectorAll( '.indicator-dot' );
	dots.forEach( ( dot, i ) => {

		if ( i === index ) {

			dot.classList.add( 'active' );

		} else {

			dot.classList.remove( 'active' );

		}

	} );

	// Update vehicle info
	updateVehicleInfo( selectedVehicleType );

	// Update 3D preview
	updatePreviewVehicle( selectedVehicleType );

}

function nextVehicle() {

	const newIndex = ( currentVehicleIndex + 1 ) % vehicleTypes.length;
	selectVehicle( newIndex );

}

function prevVehicle() {

	const newIndex = ( currentVehicleIndex - 1 + vehicleTypes.length ) % vehicleTypes.length;
	selectVehicle( newIndex );

}

function updateVehicleInfo( vehicleType ) {

	const config = getVehicleConfig( vehicleType );

	// Update name and description
	document.getElementById( 'vehicle-name' ).textContent = config.name;
	document.getElementById( 'vehicle-desc' ).textContent = config.description;

	// Update stats display
	const statsContainer = document.getElementById( 'vehicle-stats' );
	statsContainer.innerHTML = `
		<div class="stat-item">
			<div class="stat-value">${ ( config.maxSpeed * 100 ).toFixed( 0 ) }</div>
			<div class="stat-name">SPEED</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">${ ( config.acceleration * 100 ).toFixed( 0 ) }</div>
			<div class="stat-name">ACCEL</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">${ ( config.handling * 100 ).toFixed( 0 ) }</div>
			<div class="stat-name">HANDLE</div>
		</div>
		<div class="stat-item">
			<div class="stat-value">${ ( config.braking * 100 ).toFixed( 0 ) }</div>
			<div class="stat-name">BRAKE</div>
		</div>
	`;

	// Update theme colors
	updateThemeColors( config.theme );

}

function updateThemeColors( theme ) {

	if ( ! theme ) return;

	const selectScreen = document.getElementById( 'vehicle-select' );
	const startBtn = document.getElementById( 'start-btn' );
	const scrollHints = document.querySelectorAll( '.scroll-hint' );
	const indicatorDots = document.querySelectorAll( '.indicator-dot.active' );

	// Update background gradient with smooth transition
	if ( selectScreen ) {

		selectScreen.style.background = `linear-gradient(135deg, ${ theme.bgStart } 0%, ${ theme.bgEnd } 50%, ${ theme.bgStart } 100%)`;

	}

	// Update title color
	const title = document.querySelector( '.select-header h1' );
	if ( title ) {

		title.style.color = theme.primary;

	}

	// Update start button
	if ( startBtn ) {

		startBtn.style.background = `linear-gradient(135deg, ${ theme.accent } 0%, ${ adjustColorBrightness( theme.accent, -10 ) } 100%)`;
		startBtn.onmouseenter = function() {

			this.style.background = `linear-gradient(135deg, ${ adjustColorBrightness( theme.accent, 10 ) } 0%, ${ theme.accent } 100%)`;
			this.style.boxShadow = `0 8px 25px ${ hexToRgba( theme.accent, 0.4 )}`;

		};
		startBtn.onmouseleave = function() {

			this.style.background = `linear-gradient(135deg, ${ theme.accent } 0%, ${ adjustColorBrightness( theme.accent, -10 ) } 100%)`;
			this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.4)';

		};

	}

	// Update scroll hints
	scrollHints.forEach( hint => {

		hint.style.color = hexToRgba( theme.primary, 0.4 );

	} );

	// Update active indicator dot
	indicatorDots.forEach( dot => {

		dot.style.background = theme.secondary;
		dot.style.borderColor = theme.primary;
		dot.style.boxShadow = `0 0 12px ${ hexToRgba( theme.primary, 0.6 )}`;

	} );

	// Update stat values color
	const statValues = document.querySelectorAll( '.stat-value' );
	statValues.forEach( value => {

		value.style.color = theme.accent;

	} );

	// Update pause button border and color
	const pauseBtnEl = document.getElementById( 'pause-btn' );
	if ( pauseBtnEl && ! pauseBtnEl.classList.contains( 'paused' ) ) {

		pauseBtnEl.style.borderColor = theme.primary;
		pauseBtnEl.style.color = theme.primary;

	}

	// Update pause overlay
	const pauseTitle = document.querySelector( '.pause-title' );
	if ( pauseTitle ) {

		pauseTitle.style.color = theme.primary;

	}

}

function initPreviewScene() {

	const canvas = document.getElementById( 'preview-canvas' );
	if ( ! canvas ) return;

	// Create preview renderer
	previewRenderer = new THREE.WebGLRenderer( { 
		canvas: canvas,
		antialias: true,
		alpha: true 
	} );
	previewRenderer.setSize( window.innerWidth, window.innerHeight );
	previewRenderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
	previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
	previewRenderer.toneMappingExposure = 1.2;

	// Create preview scene
	previewScene = new THREE.Scene();

	// Add atmospheric lighting setup
	// Key light - main directional light from upper right
	const keyLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
	keyLight.position.set( 5, 8, 5 );
	keyLight.castShadow = true;
	keyLight.shadow.mapSize.width = 1024;
	keyLight.shadow.mapSize.height = 1024;
	previewScene.add( keyLight );

	// Fill light - softer light from left to reduce shadows
	const fillLight = new THREE.DirectionalLight( 0xb0c4de, 1.2 ); // Light blue-gray
	fillLight.position.set( -5, 3, -3 );
	previewScene.add( fillLight );

	// Rim light - backlight for edge definition
	const rimLight = new THREE.SpotLight( 0xffffff, 2.0 );
	rimLight.position.set( 0, 5, -8 );
	rimLight.angle = Math.PI / 6;
	rimLight.penumbra = 0.5;
	rimLight.decay = 2;
	rimLight.distance = 50;
	previewScene.add( rimLight );

	// Ambient light - subtle base illumination
	const ambientLight = new THREE.AmbientLight( 0x404040, 0.6 ); // Dark gray ambient
	previewScene.add( ambientLight );

	// Hemisphere light - sky/ground color blend
	const hemiLight = new THREE.HemisphereLight( 0x606060, 0x202020, 0.8 ); // Gray sky, darker ground
	previewScene.add( hemiLight );

	// Create preview camera
	previewCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 50 );
	previewCamera.position.set( 0, 3, -7 ); // Better viewing angle for showcase
	previewCamera.lookAt( 0, 0.5, 0 );

	// Handle resize
	window.addEventListener( 'resize', () => {

		if ( previewCamera && previewRenderer ) {

			previewCamera.aspect = window.innerWidth / window.innerHeight;
			previewCamera.updateProjectionMatrix();
			previewRenderer.setSize( window.innerWidth, window.innerHeight );

		}

	} );

	// Start preview animation
	updatePreview();

}

function updatePreviewVehicle( vehicleType ) {

	if ( ! previewScene ) return;

	// Remove old vehicle
	if ( previewVehicle ) {

		previewScene.remove( previewVehicle );
		previewVehicle = null;

	}

	// Add new vehicle
	const config = getVehicleConfig( vehicleType );
	if ( models[ config.model ] ) {

		previewVehicle = models[ config.model ].clone();
		previewScene.add( previewVehicle );

	}

}

let previewRotation = 0;

function updatePreview() {

	previewAnimationId = requestAnimationFrame( updatePreview );

	if ( ! previewScene || ! previewCamera || ! previewRenderer ) return;

	// Slowly rotate the vehicle for better viewing
	previewRotation += 0.005;
	if ( previewVehicle ) {

		previewVehicle.rotation.y = previewRotation;

	}

	previewRenderer.render( previewScene, previewCamera );

}

async function init() {

	registerAll();
	await loadModels();

	// Initialize vehicle selection screen
	initVehicleSelection();

}

async function startGame( vehicleType ) {

	const mapParam = new URLSearchParams( window.location.search ).get( 'map' );
	let customCells = null;
	let spawn = null;

	if ( mapParam ) {

		try {

			customCells = decodeCells( mapParam );
			spawn = computeSpawnPosition( customCells );

		} catch ( e ) {

			console.warn( 'Invalid map parameter, using default track' );

		}

	}

	// Compute track bounds and size physics/shadows to fit
	const bounds = computeTrackBounds( customCells );
	const hw = bounds.halfWidth;
	const hd = bounds.halfDepth;
	const groundSize = Math.max( hw, hd ) * 2 + 20;

	const shadowExtent = Math.max( hw, hd ) + 10;
	dirLight.shadow.camera.left = - shadowExtent;
	dirLight.shadow.camera.right = shadowExtent;
	dirLight.shadow.camera.top = shadowExtent;
	dirLight.shadow.camera.bottom = - shadowExtent;
	dirLight.shadow.camera.updateProjectionMatrix();

	scene.fog.near = groundSize * 0.4;
	scene.fog.far = groundSize * 0.8;

	buildTrack( scene, models, customCells );

	// Probes

	const probeHeight = 6;
	const probes = new LightProbeGrid(
		hw * 2, probeHeight, hd * 2,
		Math.max( 4, Math.round( hw / 4 ) ),
		2,
		Math.max( 4, Math.round( hd / 4 ) ),
	);
	probes.position.set( bounds.centerX, probeHeight / 2, bounds.centerZ );
	probes.bake( renderer, scene, { cubemapSize: 32, near: 0.1, far: groundSize } );
	scene.add( probes );

	// scene.add( new LightProbeGridHelper( probes, 0.5 ) );

	//

	const worldSettings = createWorldSettings();
	worldSettings.gravity = [ 0, - 9.81, 0 ];

	const BPL_MOVING = addBroadphaseLayer( worldSettings );
	const BPL_STATIC = addBroadphaseLayer( worldSettings );
	const OL_MOVING = addObjectLayer( worldSettings, BPL_MOVING );
	const OL_STATIC = addObjectLayer( worldSettings, BPL_STATIC );

	enableCollision( worldSettings, OL_MOVING, OL_STATIC );
	enableCollision( worldSettings, OL_MOVING, OL_MOVING );

	const world = createWorld( worldSettings );
	world._OL_MOVING = OL_MOVING;
	world._OL_STATIC = OL_STATIC;

	buildWallColliders( world, null, customCells );

	const roadHalf = groundSize / 2;
	rigidBody.create( world, {
		shape: box.create( { halfExtents: [ roadHalf, 0.01, roadHalf ] } ),
		motionType: MotionType.STATIC,
		objectLayer: OL_STATIC,
		position: [ bounds.centerX, - 0.125, bounds.centerZ ],
		friction: 5.0,
		restitution: 0.0,
	} );

	const sphereBody = createSphereBody( world, spawn ? spawn.position : null );

	const vehicle = new Vehicle( getVehicleConfig( vehicleType ) );
	vehicle.rigidBody = sphereBody;
	vehicle.physicsWorld = world;

	if ( spawn ) {

		const [ sx, sy, sz ] = spawn.position;
		vehicle.spherePos.set( sx, sy, sz );
		vehicle.prevModelPos.set( sx, 0, sz );
		vehicle.container.rotation.y = spawn.angle;

	}

	const vehicleGroup = vehicle.init( models[ getVehicleConfig( vehicleType ).model ] );
	scene.add( vehicleGroup );

	dirLight.target = vehicleGroup;

	const cam = new Camera();
	cam.targetPosition.copy( vehicle.spherePos );

	const controls = new Controls();

	// Initialize pause UI
	pauseBtn = document.getElementById( 'pause-btn' );
	pauseOverlay = document.getElementById( 'pause-overlay' );
	resumeBtn = document.getElementById( 'resume-btn' );
	
	if ( pauseBtn ) {

		pauseBtn.style.display = 'flex';
		pauseBtn.addEventListener( 'click', togglePause );

	}
	
	if ( resumeBtn ) {

		resumeBtn.addEventListener( 'click', togglePause );

	}

	// Space key to toggle pause
	window.addEventListener( 'keydown', ( e ) => {

		if ( e.code === 'Space' && ! isPaused ) {

			e.preventDefault();
			togglePause();

		} else if ( e.code === 'Space' && isPaused ) {

			e.preventDefault();
			togglePause();

		}

	} );

	const particles = new SmokeTrails( scene );
	const driftMarks = new DriftMarks( scene );

	const audio = new GameAudio();
	audio.init( cam.camera );

	const _forward = new THREE.Vector3();

	const contactListener = {
		onContactAdded( bodyA, bodyB ) {

			if ( bodyA !== sphereBody && bodyB !== sphereBody ) return;

			_forward.set( 0, 0, 1 ).applyQuaternion( vehicle.container.quaternion );
			_forward.y = 0;
			_forward.normalize();

			const impactVelocity = Math.abs( vehicle.modelVelocity.dot( _forward ) );
			audio.playImpact( impactVelocity );

		}
	};

	const timer = new THREE.Timer();
	
	// Frame rate limiting for better performance
	const targetFPS = 60;
	const frameInterval = 1000 / targetFPS;
	let lastFrameTime = 0;

	function animate( currentTime = 0 ) {

		requestAnimationFrame( animate );

		// Skip frame if too soon (frame rate limiting)
		const elapsed = currentTime - lastFrameTime;
		if ( elapsed < frameInterval ) return;
		lastFrameTime = currentTime - ( elapsed % frameInterval );

		// Don't update game logic when paused
		if ( ! isPaused ) {

			timer.update();
			const dt = Math.min( timer.getDelta(), 1 / 30 ); // Cap delta time

			const input = controls.update();

			updateWorld( world, contactListener, dt );

			vehicle.update( dt, input );

			dirLight.position.set(
				vehicle.spherePos.x + 11.4,
				15,
				vehicle.spherePos.z - 5.3
			);

			cam.update( dt, vehicle.spherePos, vehicle.container.quaternion, vehicle.linearSpeed / MAX_SPEED );
			particles.update( dt, vehicle );
			driftMarks.update( dt, vehicle );
			audio.update( dt, vehicle.linearSpeed / MAX_SPEED, input.z, vehicle.driftIntensity );

		}

		// Always render (so we can see the paused state)
		renderer.render( scene, cam.camera );

	}

	animate();

}

init();
