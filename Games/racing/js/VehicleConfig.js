// Vehicle configurations with different characteristics
export const VEHICLE_CONFIGS = {
	yellow: {
		name: 'Yellow Speedster',
		model: 'vehicle-truck-yellow',
		color: 0xFFD700,
		maxSpeed: 1.5,        // Base max speed multiplier
		acceleration: 1.5,    // Acceleration rate
		handling: 4.0,        // Steering responsiveness
		braking: 8.0,         // Braking power
		description: 'Balanced performance',
		// Theme colors for UI
		theme: {
			primary: '#d4af37',      // Muted gold
			secondary: '#c9b037',    // Darker gold
			accent: '#7fb069',       // Muted green
			bgStart: '#2c3e50',      // Dark blue-gray
			bgEnd: '#34495e'         // Lighter blue-gray
		}
	},
	green: {
		name: 'Green Racer',
		model: 'vehicle-truck-green',
		color: 0x32CD32,
		maxSpeed: 1.6,        // Higher top speed
		acceleration: 1.3,    // Slower acceleration
		handling: 3.5,        // Slightly less responsive
		braking: 7.0,
		description: 'High top speed',
		theme: {
			primary: '#7fb069',      // Muted green
			secondary: '#6a9e56',    // Darker green
			accent: '#d4af37',       // Gold accent
			bgStart: '#1e3a2f',      // Dark forest green
			bgEnd: '#2d4a3e'         // Lighter forest green
		}
	},
	purple: {
		name: 'Purple Drifter',
		model: 'vehicle-truck-purple',
		color: 0x9370DB,
		maxSpeed: 1.4,
		acceleration: 1.8,    // Fast acceleration
		handling: 4.5,        // Better handling
		braking: 9.0,         // Strong braking
		description: 'Excellent handling',
		theme: {
			primary: '#9b7cb6',      // Muted purple
			secondary: '#8568a3',    // Darker purple
			accent: '#d4af37',       // Gold accent
			bgStart: '#2d2640',      // Dark purple-gray
			bgEnd: '#3d3454'         // Lighter purple-gray
		}
	},
	red: {
		name: 'Red Thunder',
		model: 'vehicle-truck-red',
		color: 0xDC143C,
		maxSpeed: 1.7,        // Highest top speed
		acceleration: 1.2,    // Slowest acceleration
		handling: 3.2,        // Less responsive
		braking: 6.5,
		description: 'Maximum speed beast',
		theme: {
			primary: '#c94c4c',      // Muted red
			secondary: '#b33a3a',    // Darker red
			accent: '#d4af37',       // Gold accent
			bgStart: '#3a2428',      // Dark red-brown
			bgEnd: '#4a3438'         // Lighter red-brown
		}
	}
};

export function getVehicleConfig( type ) {
	
	return VEHICLE_CONFIGS[ type ] || VEHICLE_CONFIGS.yellow;
	
}
