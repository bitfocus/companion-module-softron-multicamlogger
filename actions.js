export function updateActions() {
	let actions = {}

	actions['start_logging'] = {
		name: 'Start Logging',
		options: [],
		callback: (action) => {
			this.sendGetCommand('start')
		},
	}

	actions['stop_logging'] = {
		name: 'Stop Logging',
		options: [],
		callback: (action) => {
			this.sendGetCommand('stop')
		},
	}

	actions['get_inputs'] = {
		name: 'Update Input List',
		options: [],
		callback: (action) => {
			this.sendGetCommand('inputs')
		},
	}

	// actions['get_status'] = {
	// 	name: 'Update Status',
	// 	options: [],
	// 	callback: (action) => {
	// 		this.sendGetCommand('status')
	// 	},
	// }

	actions['change_angle'] = {
		name: 'Change Angle (Take)',
		options: [],
		callback: (action) => {
			this.sendGetCommand('change_angle')
		},
	}

	actions['set_program'] = {
		name: 'Set Program',
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'angle',
				default: '0',
				choices: this.inputs,
			},
		],
		callback: ({ options }) => {
			this.sendGetCommand('change_angle?program=' + options.angle)
		},
	}

	actions['set_preview'] = {
		name: 'Set Preview',
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'angle',
				default: '0',
				choices: this.inputs,
			},
		],
		callback: ({ options }) => {
			this.sendGetCommand('change_angle?preview=' + options.angle)
		},
	}

	actions['add_marker'] = {
		name: 'Add Marker',
		options: [
			{
				type: 'textinput',
				label: 'Marker Text',
				id: 'markerText',
				default: '',
				tooltip: 'Makers can only be added when logging is running',
			},
		],
		callback: ({ options }) => {
			this.sendGetCommand('add_marker?name=' + options.markerText)
		},
	}

	this.setActionDefinitions(actions)
}
