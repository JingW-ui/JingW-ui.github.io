import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { LightProbeGrid } from 'three/addons/lighting/LightProbeGrid.js';
import { LightProbeGridHelper } from 'three/addons/helpers/LightProbeGridHelper.js';
import { createWorldSettings, createWorld, addBroadphaseLayer, addObjectLayer, enableCollision, registerAll, updateWorld, rigidBody, box, MotionType } from 'crashcat';
import { Vehicle, MAX_SPEED } from './Vehicle.js';
import { Camera } from './Camera.js';
import { Controls } from './Controls.js';
import { buildTrack, decodeCells, computeSpawnPosition, computeTrackBounds, getMapConfig, MAP_CONFIGS } from './Track.js';
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

// Map selection state
let selectedMapKey = 'default';
let currentMapIndex = 0;
const mapKeys = Object.keys( MAP_CONFIGS );

let previewScene = null;
let previewCamera = null;
let previewRenderer = null;
let previewVehicle = null;
let previewAnimationId = null;

// Map preview variables
let mapPreviewScene = null;
let mapPreviewCamera = null;
let mapPreviewRenderer = null;
let mapPreviewGroup = null;
let mapPreviewAnimationId = null;
let mapPreviewRotation = 0;

// Game pause state
let isPaused = false;
let pauseBtn = null;
let pauseOverlay = null;
let resumeBtn = null;
let menuBtn = null;
let audio = null; // Global audio reference

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

	const nextToMapBtn = document.getElementById( 'next-to-map-btn' );
	const backToVehicleBtn = document.getElementById( 'back-to-vehicle-btn' );
	const startRaceBtn = document.getElementById( 'start-race-btn' );
	const indicatorContainer = document.getElementById( 'vehicle-indicator' );
	const mapIndicatorContainer = document.getElementById( 'map-indicator' );

	// Create vehicle indicator dots
	vehicleTypes.forEach( ( type, index ) => {

		const dot = document.createElement( 'div' );
		dot.className = 'indicator-dot';
		if ( index === 0 ) dot.classList.add( 'active' );

		dot.addEventListener( 'click', () => {

			selectVehicle( index );

		} );

		indicatorContainer.appendChild( dot );

	} );

	// Create map indicator dots
	if ( mapIndicatorContainer ) {

		mapKeys.forEach( ( key, index ) => {

			const dot = document.createElement( 'div' );
			dot.className = 'indicator-dot map-dot';
			if ( index === 0 ) dot.classList.add( 'active' );

			dot.addEventListener( 'click', () => {

				selectMap( index );

			} );

			mapIndicatorContainer.appendChild( dot );

		} );

	}

	// Initialize with first vehicle and map
	selectVehicle( 0 );
	selectMap( 0 );

	// Mouse wheel support for vehicle selection
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

	// Touch/swipe support for vehicle selection
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

	// Keyboard support - different keys for each screen
	window.addEventListener( 'keydown', ( e ) => {

		const vehicleSelectVisible = ! document.getElementById( 'vehicle-select' ).classList.contains( 'hidden' );
		const mapSelectVisible = document.getElementById( 'map-select' ).classList.contains( 'active' );

		if ( vehicleSelectVisible ) {

			// Vehicle selection mode
			if ( e.code === 'ArrowLeft' || e.code === 'KeyA' ) {

				prevVehicle();

			} else if ( e.code === 'ArrowRight' || e.code === 'KeyD' ) {

				nextVehicle();

			} else if ( e.code === 'Enter' || e.code === 'Space' ) {

				e.preventDefault();
				showMapSelection();

			}

		} else if ( mapSelectVisible ) {

			// Map selection mode
			if ( e.code === 'ArrowUp' || e.code === 'KeyW' ) {

				prevMap();

			} else if ( e.code === 'ArrowDown' || e.code === 'KeyS' ) {

				nextMap();

			} else if ( e.code === 'Escape' || e.code === 'Backspace' ) {

				e.preventDefault();
				showVehicleSelection();

			} else if ( e.code === 'Enter' || e.code === 'Space' ) {

				e.preventDefault();
				startGameWithSelectedOptions();

			}

		}

	} );

	// Button event listeners
	nextToMapBtn.addEventListener( 'click', () => {

		showMapSelection();

	} );

	backToVehicleBtn.addEventListener( 'click', () => {

		showVehicleSelection();

	} );

	startRaceBtn.addEventListener( 'click', () => {

		startGameWithSelectedOptions();

	} );

	// Map selection scroll support
	const mapCanvas = document.getElementById( 'map-preview-canvas' );
	const mapSelectScreen = document.getElementById( 'map-select' );
	
	// Add wheel event to both canvas and the entire map select screen
	const handleMapWheel = ( e ) => {

		const mapSelectVisible = mapSelectScreen.classList.contains( 'active' );
		if ( ! mapSelectVisible ) return;

		e.preventDefault();
		if ( e.deltaY > 0 ) {

			nextMap();

		} else {

			prevMap();

		}

	};

	if ( mapCanvas ) {

		mapCanvas.addEventListener( 'wheel', handleMapWheel, { passive: false } );

	}

	if ( mapSelectScreen ) {

		mapSelectScreen.addEventListener( 'wheel', handleMapWheel, { passive: false } );

	}

	// Touch/swipe support for map selection
	let mapTouchStartY = 0;
	let mapTouchEndY = 0;

	if ( mapCanvas ) {

		mapCanvas.addEventListener( 'touchstart', ( e ) => {

			mapTouchStartY = e.changedTouches[ 0 ].screenY;

		}, { passive: true } );

		mapCanvas.addEventListener( 'touchend', ( e ) => {

			mapTouchEndY = e.changedTouches[ 0 ].screenY;
			handleMapSwipe();

		}, { passive: true } );

		function handleMapSwipe() {

			const swipeThreshold = 50;
			const diff = mapTouchStartY - mapTouchEndY;

			if ( Math.abs( diff ) > swipeThreshold ) {

				if ( diff > 0 ) {

					// Swipe up - next map
					nextMap();

				} else {

					// Swipe down - previous map
					prevMap();

				}

			}

		}

	}

}

function togglePause() {

	isPaused = ! isPaused;

	if ( isPaused ) {

		// Pause the game
		pauseBtn.textContent = '▶';
		pauseBtn.classList.add( 'paused' );
		pauseOverlay.classList.add( 'active' );

		// Mute all audio by setting volume to 0
		if ( audio ) {

			if ( audio.engineSound ) audio.engineSound.setVolume( 0 );
			if ( audio.engineLayerSound ) audio.engineLayerSound.setVolume( 0 );
			if ( audio.skidSound ) audio.skidSound.setVolume( 0 );

		}

	} else {

		// Resume the game
		pauseBtn.textContent = '⏸';
		pauseBtn.classList.remove( 'paused' );
		pauseOverlay.classList.remove( 'active' );

		// Audio will be restored by update() function automatically

	}

}

function returnToMainMenu() {

	// Stop all game systems
	if ( audio ) {

		if ( audio.engineSound ) {

			audio.engineSound.stop();
			audio.engineSound.setVolume( 0 );

		}
		if ( audio.engineLayerSound ) {

			audio.engineLayerSound.stop();
			audio.engineLayerSound.setVolume( 0 );

		}
		if ( audio.skidSound ) {

			audio.skidSound.stop();
			audio.skidSound.setVolume( 0 );

		}

	}

	// Reset pause state
	isPaused = false;
	if ( pauseBtn ) {

		pauseBtn.textContent = '⏸';
		pauseBtn.classList.remove( 'paused' );
		pauseBtn.style.display = 'none';

	}
	if ( pauseOverlay ) {

		pauseOverlay.classList.remove( 'active' );

	}

	// Clear scene
	while ( scene.children.length > 0 ) {

		scene.remove( scene.children[ 0 ] );

	}

	// Re-add lights
	scene.add( dirLight );
	scene.add( hemiLight );

	// Show vehicle selection screen
	const vehicleSelect = document.getElementById( 'vehicle-select' );
	const mapSelect = document.getElementById( 'map-select' );
	
	if ( vehicleSelect ) {

		vehicleSelect.style.display = 'flex';
		setTimeout( () => {

			vehicleSelect.classList.remove( 'hidden' );

		}, 50 );

	}
	
	if ( mapSelect ) {

		mapSelect.classList.remove( 'active' );

	}

	// Restart preview animation
	if ( ! previewAnimationId && previewScene && previewCamera && previewRenderer ) {

		updatePreview();

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

function selectMap( index ) {

	currentMapIndex = index;
	selectedMapKey = mapKeys[ index ];

	// Update map indicator dots
	const dots = document.querySelectorAll( '.map-dot' );
	dots.forEach( ( dot, i ) => {

		if ( i === index ) {

			dot.classList.add( 'active' );

		} else {

			dot.classList.remove( 'active' );

		}

	} );

	// Update map info display
	updateMapInfo( selectedMapKey );

	// Update 3D map preview
	updateMapPreviewTrack( selectedMapKey );

}

function nextMap() {

	const newIndex = ( currentMapIndex + 1 ) % mapKeys.length;
	selectMap( newIndex );

}

function prevMap() {

	const newIndex = ( currentMapIndex - 1 + mapKeys.length ) % mapKeys.length;
	selectMap( newIndex );

}

function showMapSelection() {

	// Stop vehicle preview animation
	if ( previewAnimationId ) {

		cancelAnimationFrame( previewAnimationId );
		previewAnimationId = null;

	}

	// Hide vehicle selection, show map selection
	const vehicleSelect = document.getElementById( 'vehicle-select' );
	const mapSelect = document.getElementById( 'map-select' );

	vehicleSelect.classList.add( 'hidden' );

	setTimeout( () => {

		vehicleSelect.style.display = 'none';
		mapSelect.classList.add( 'active' );

		// Initialize and apply current map theme
		updateMapInfo( selectedMapKey );
		updateMapPreviewTrack( selectedMapKey );

	}, 500 );

}

function showVehicleSelection() {

	const vehicleSelect = document.getElementById( 'vehicle-select' );
	const mapSelect = document.getElementById( 'map-select' );

	mapSelect.classList.remove( 'active' );
	vehicleSelect.style.display = 'flex';

	setTimeout( () => {

		vehicleSelect.classList.remove( 'hidden' );

		// Restart vehicle preview animation
		if ( ! previewAnimationId ) {

			updatePreview();

		}

	}, 50 );

}

function startGameWithSelectedOptions() {

	// Stop all animations
	if ( previewAnimationId ) {

		cancelAnimationFrame( previewAnimationId );
		previewAnimationId = null;

	}

	// Hide both selection screens
	const vehicleSelect = document.getElementById( 'vehicle-select' );
	const mapSelect = document.getElementById( 'map-select' );

	vehicleSelect.classList.add( 'hidden' );
	mapSelect.classList.remove( 'active' );

	// Start the game after fade out
	setTimeout( () => {

		startGame( selectedVehicleType, selectedMapKey );

	}, 500 );

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
	const indicatorDots = document.querySelectorAll( '.indicator-dot.active:not(.map-dot)' );

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

	// Update active vehicle indicator dot
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

function updateMapInfo( mapKey ) {

	const config = getMapConfig( mapKey );
	if ( ! config ) return;

	// Update map name and description in UI
	const mapNameEl = document.getElementById( 'map-name' );
	const mapDescEl = document.getElementById( 'map-desc' );

	if ( mapNameEl ) {

		mapNameEl.textContent = config.name;

	}

	if ( mapDescEl ) {

		mapDescEl.textContent = config.description;

	}

	// Apply map theme colors
	if ( config.theme ) {

		updateThemeColors( config.theme );

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

function initMapPreviewScene() {

	const canvas = document.getElementById( 'map-preview-canvas' );
	if ( ! canvas ) return;

	// Create map preview renderer with better quality
	mapPreviewRenderer = new THREE.WebGLRenderer( { 
		canvas: canvas,
		antialias: true,
		alpha: true 
	} );
	mapPreviewRenderer.setSize( window.innerWidth, window.innerHeight );
	mapPreviewRenderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
	mapPreviewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
	mapPreviewRenderer.toneMappingExposure = 1.3;
	mapPreviewRenderer.shadowMap.enabled = true;
	mapPreviewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

	// Create map preview scene
	mapPreviewScene = new THREE.Scene();
	mapPreviewScene.background = new THREE.Color( 0x0a0a0a );
	mapPreviewScene.fog = new THREE.Fog( 0x0a0a0a, 50, 150 );

	// Enhanced lighting setup for better visualization
	// Key light - main directional light
	const keyLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
	keyLight.position.set( 15, 20, 10 );
	keyLight.castShadow = true;
	keyLight.shadow.mapSize.width = 2048;
	keyLight.shadow.mapSize.height = 2048;
	keyLight.shadow.camera.near = 0.5;
	keyLight.shadow.camera.far = 100;
	keyLight.shadow.camera.left = -50;
	keyLight.shadow.camera.right = 50;
	keyLight.shadow.camera.top = 50;
	keyLight.shadow.camera.bottom = -50;
	keyLight.shadow.bias = -0.0001;
	mapPreviewScene.add( keyLight );

	// Fill light - softer light from opposite side
	const fillLight = new THREE.DirectionalLight( 0x8899aa, 1.2 );
	fillLight.position.set( -10, 10, -10 );
	mapPreviewScene.add( fillLight );

	// Rim light - backlight for edge definition
	const rimLight = new THREE.DirectionalLight( 0x6688cc, 1.5 );
	rimLight.position.set( 0, 10, -15 );
	mapPreviewScene.add( rimLight );

	// Ambient light - subtle base illumination
	const ambientLight = new THREE.AmbientLight( 0x303030, 0.8 );
	mapPreviewScene.add( ambientLight );

	// Hemisphere light - sky/ground color blend
	const hemiLight = new THREE.HemisphereLight( 0x556677, 0x222222, 1.0 );
	hemiLight.position.set( 0, 20, 0 );
	mapPreviewScene.add( hemiLight );

	// Add point lights for dramatic effect
	const pointLight1 = new THREE.PointLight( 0x4488ff, 1.5, 50 );
	pointLight1.position.set( 20, 15, 20 );
	mapPreviewScene.add( pointLight1 );

	const pointLight2 = new THREE.PointLight( 0xff6644, 1.0, 50 );
	pointLight2.position.set( -20, 15, -20 );
	mapPreviewScene.add( pointLight2 );

	// Create map preview camera - optimized viewing angle
	mapPreviewCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 300 );
	mapPreviewCamera.position.set( 30, 25, 30 );
	mapPreviewCamera.lookAt( 0, 0, 0 );

	// Handle resize
	window.addEventListener( 'resize', () => {

		if ( mapPreviewCamera && mapPreviewRenderer ) {

			mapPreviewCamera.aspect = window.innerWidth / window.innerHeight;
			mapPreviewCamera.updateProjectionMatrix();
			mapPreviewRenderer.setSize( window.innerWidth, window.innerHeight );

		}

	} );

	// Start map preview animation
	updateMapPreview();

}

let currentMapCells = null;

function updateMapPreviewTrack( mapKey ) {

	if ( ! mapPreviewScene ) return;

	// Remove old track
	if ( mapPreviewGroup ) {

		mapPreviewScene.remove( mapPreviewGroup );
		mapPreviewGroup = null;

	}

	// Get map configuration
	const mapConfig = getMapConfig( mapKey );
	if ( ! mapConfig || ! mapConfig.cells ) return;

	currentMapCells = mapConfig.cells;

	// Create a enhanced track visualization
	mapPreviewGroup = new THREE.Group();

	// Enhanced materials with better visual quality
	const trackMaterial = new THREE.MeshStandardMaterial( { 
		color: 0x2a2a2a,
		roughness: 0.6,
		metalness: 0.4,
		normalScale: new THREE.Vector2( 1, 1 )
	} );

	const cornerMaterial = new THREE.MeshStandardMaterial( { 
		color: 0x353535,
		roughness: 0.6,
		metalness: 0.4
	} );

	const finishMaterial = new THREE.MeshStandardMaterial( { 
		color: 0xffffff,
		emissive: 0xff0000,
		emissiveIntensity: 0.5,
		roughness: 0.3,
		metalness: 0.7
	} );

	// Add ground plane for better context
	const groundGeometry = new THREE.PlaneGeometry( 100, 100 );
	const groundMaterial = new THREE.MeshStandardMaterial( { 
		color: 0x1a1a1a,
		roughness: 0.9,
		metalness: 0.1,
		transparent: true,
		opacity: 0.6
	} );
	const ground = new THREE.Mesh( groundGeometry, groundMaterial );
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -0.5;
	ground.receiveShadow = true;
	mapPreviewGroup.add( ground );

	// Add grid helper for scale reference
	const gridHelper = new THREE.GridHelper( 100, 50, 0x444444, 0x2a2a2a );
	gridHelper.position.y = -0.49;
	gridHelper.material.transparent = true;
	gridHelper.material.opacity = 0.3;
	mapPreviewGroup.add( gridHelper );

	// Calculate bounds to center the track
	let minX = Infinity, maxX = -Infinity;
	let minZ = Infinity, maxZ = -Infinity;

	for ( const [ gx, gz ] of currentMapCells ) {

		minX = Math.min( minX, gx );
		maxX = Math.max( maxX, gx );
		minZ = Math.min( minZ, gz );
		maxZ = Math.max( maxZ, gz );

	}

	const centerX = ( minX + maxX ) / 2;
	const centerZ = ( minZ + maxZ ) / 2;

	// Track piece dimensions
	const pieceSize = 7;
	const pieceHeight = 0.6;
	const spacing = 7.5;

	// Place track pieces with enhanced visuals
	for ( const [ gx, gz, type, orient ] of currentMapCells ) {

		let mesh;
		let material;

		if ( type === 'track-finish' ) {

			// Finish line with checkered pattern effect
			const geometry = new THREE.BoxGeometry( pieceSize, pieceHeight, pieceSize );
			mesh = new THREE.Mesh( geometry, finishMaterial );
			
			// Add red-white stripes on top
			const stripeCount = 4;
			const stripeWidth = pieceSize / stripeCount;
			for ( let i = 0; i < stripeCount; i ++ ) {

				if ( i % 2 === 0 ) {

					const stripeGeo = new THREE.BoxGeometry( stripeWidth, pieceHeight + 0.05, pieceSize );
					const stripeMat = new THREE.MeshStandardMaterial( { 
						color: 0xff0000,
						emissive: 0xcc0000,
						emissiveIntensity: 0.3
					} );
					const stripe = new THREE.Mesh( stripeGeo, stripeMat );
					stripe.position.x = ( i - stripeCount / 2 + 0.5 ) * stripeWidth;
					stripe.castShadow = true;
					mesh.add( stripe );

				}

			}

		} else if ( type === 'track-corner' ) {

			const geometry = new THREE.BoxGeometry( pieceSize, pieceHeight, pieceSize );
			mesh = new THREE.Mesh( geometry, cornerMaterial );

			// Add curve indicator
			const curveGeo = new THREE.TorusGeometry( 2, 0.15, 8, 16, Math.PI / 2 );
			const curveMat = new THREE.MeshStandardMaterial( { 
				color: 0xffaa00,
				emissive: 0xff8800,
				emissiveIntensity: 0.4
			} );
			const curve = new THREE.Mesh( curveGeo, curveMat );
			curve.rotation.x = -Math.PI / 2;
			curve.position.y = pieceHeight / 2 + 0.1;
			mesh.add( curve );

		} else {

			// Straight track with lane markings
			const geometry = new THREE.BoxGeometry( pieceSize, pieceHeight, pieceSize );
			mesh = new THREE.Mesh( geometry, trackMaterial );

			// Add center line marking
			const lineGeo = new THREE.BoxGeometry( 0.3, pieceHeight + 0.05, pieceSize * 0.6 );
			const lineMat = new THREE.MeshStandardMaterial( { 
				color: 0xffff00,
				emissive: 0xffcc00,
				emissiveIntensity: 0.2
			} );
			const line = new THREE.Mesh( lineGeo, lineMat );
			line.position.y = 0.05;
			line.castShadow = true;
			mesh.add( line );

		}

		// Position (centered)
		mesh.position.set( 
			( gx - centerX ) * spacing, 
			0, 
			( gz - centerZ ) * spacing 
		);

		// Rotation
		const deg = { 0: 0, 10: 180, 16: 90, 22: 270 }[ orient ] || 0;
		mesh.rotation.y = THREE.MathUtils.degToRad( deg );

		mesh.castShadow = true;
		mesh.receiveShadow = true;
		mapPreviewGroup.add( mesh );

	}

	// Add edge markers for track boundaries
	addTrackEdgeMarkers( mapPreviewGroup, currentMapCells, centerX, centerZ, spacing );

	mapPreviewScene.add( mapPreviewGroup );

	// Adjust camera to fit the track with better framing
	const trackWidth = ( maxX - minX + 1 ) * spacing;
	const trackDepth = ( maxZ - minZ + 1 ) * spacing;
	const maxDim = Math.max( trackWidth, trackDepth );
	
	// Set optimal camera position based on track size
	const cameraDistance = maxDim * 0.7;
	const cameraHeight = maxDim * 0.6;
	
	mapPreviewCamera.position.set( cameraDistance, cameraHeight, cameraDistance );
	mapPreviewCamera.lookAt( 0, 0, 0 );
	mapPreviewCamera.near = 0.1;
	mapPreviewCamera.far = cameraDistance * 3;
	mapPreviewCamera.updateProjectionMatrix();

}

function addTrackEdgeMarkers( group, cells, centerX, centerZ, spacing ) {

	// Create boundary indicators
	const markerGeometry = new THREE.SphereGeometry( 0.3, 16, 16 );
	const markerMaterial = new THREE.MeshStandardMaterial( { 
		color: 0x00ff88,
		emissive: 0x00ff66,
		emissiveIntensity: 0.5
	} );

	// Find edge cells and add markers
	const occupied = new Set();
	for ( const [ gx, gz ] of cells ) {

		occupied.add( `${ gx },${ gz }` );

	}

	for ( const [ gx, gz ] of cells ) {

		// Check all 4 directions
		const neighbors = [
			[ gx + 1, gz ],
			[ gx - 1, gz ],
			[ gx, gz + 1 ],
			[ gx, gz - 1 ]
		];

		for ( const [ nx, nz ] of neighbors ) {

			if ( ! occupied.has( `${ nx },${ nz }` ) ) {

				// This is an edge, add marker
				const marker = new THREE.Mesh( markerGeometry, markerMaterial );
				marker.position.set(
					( gx - centerX ) * spacing + ( nx - gx ) * 3.5,
					0.5,
					( gz - centerZ ) * spacing + ( nz - gz ) * 3.5
				);
				marker.castShadow = true;
				group.add( marker );

			}

		}

	}

}

function updateMapPreview() {

	mapPreviewAnimationId = requestAnimationFrame( updateMapPreview );

	if ( ! mapPreviewScene || ! mapPreviewCamera || ! mapPreviewRenderer ) return;

	// Smooth rotation for better viewing experience
	mapPreviewRotation += 0.002;
	if ( mapPreviewGroup ) {

		mapPreviewGroup.rotation.y = mapPreviewRotation;

	}

	mapPreviewRenderer.render( mapPreviewScene, mapPreviewCamera );

}

async function init() {

	registerAll();
	await loadModels();

	// Check if custom map is provided via URL parameter
	const mapParam = new URLSearchParams( window.location.search ).get( 'map' );
	
	if ( mapParam ) {
		// Custom map detected - start game directly with default vehicle
		console.log( 'Custom map detected, starting game directly...' );
		
		// Hide selection screens
		const vehicleSelect = document.getElementById( 'vehicle-select' );
		const mapSelect = document.getElementById( 'map-select' );
		if ( vehicleSelect ) vehicleSelect.style.display = 'none';
		if ( mapSelect ) mapSelect.style.display = 'none';
		
		startGame( vehicleTypes[ 0 ], null ); // Use first vehicle, map will be loaded from URL param
	} else {
		// No custom map - show selection screens
		initVehicleSelection();
		initMapPreviewScene();
	}

}

async function startGame( vehicleType, mapKey ) {

	const mapParam = new URLSearchParams( window.location.search ).get( 'map' );
	let customCells = null;
	let spawn = null;

	// If URL has map parameter, use it (custom map)
	if ( mapParam ) {

		try {

			customCells = decodeCells( mapParam );
			spawn = computeSpawnPosition( customCells );

		} catch ( e ) {

			console.warn( 'Invalid map parameter, using default track' );

		}

	} else if ( mapKey && MAP_CONFIGS[ mapKey ] ) {

		// Use pre-defined map configuration from selection screen
		const mapConfig = getMapConfig( mapKey );
		customCells = mapConfig.cells;
		spawn = computeSpawnPosition( customCells );

	} else {

		// Fallback to default map
		const mapConfig = getMapConfig( 'default' );
		customCells = mapConfig.cells;
		spawn = computeSpawnPosition( customCells );

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
	menuBtn = document.getElementById( 'menu-btn' );
	
	if ( pauseBtn ) {

		pauseBtn.style.display = 'flex';
		pauseBtn.addEventListener( 'click', togglePause );

	}
	
	if ( resumeBtn ) {

		resumeBtn.addEventListener( 'click', togglePause );

	}
	
	if ( menuBtn ) {

		menuBtn.addEventListener( 'click', returnToMainMenu );

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

	audio = new GameAudio(); // Assign to global variable
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

		} else {

			// When paused, ensure audio stays muted
			if ( audio ) {

				if ( audio.engineSound ) audio.engineSound.setVolume( 0 );
				if ( audio.engineLayerSound ) audio.engineLayerSound.setVolume( 0 );
				if ( audio.skidSound ) audio.skidSound.setVolume( 0 );

			}

		}

		// Always render (so we can see the paused state)
		renderer.render( scene, cam.camera );

	}

	animate();

}

init();
