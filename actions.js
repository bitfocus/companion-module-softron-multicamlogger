const MARKER_REFERENCES = [
	{ id: 'live', label: 'Live' },
	{ id: 'playhead', label: 'Playhead' },
	{ id: 'in_point', label: 'In point' },
	{ id: 'out_point', label: 'Out point' },
	{ id: 'absolute', label: 'Absolute time' },
]

export function updateActions() {
	let actions = {}

	actions['start_logging'] = {
		name: 'Start Logging',
		options: [],
		callback: async () => {
			await this.runCommand('Start logging', () => this.api.startLogging())
		},
	}

	actions['stop_logging'] = {
		name: 'Stop Logging',
		options: [],
		callback: async () => {
			await this.runCommand('Stop logging', () => this.api.stopLogging())
		},
	}

	actions['toggle_logging'] = {
		name: 'Toggle Logging',
		options: [],
		callback: async () => {
			if (this.logging === true) {
				await this.runCommand('Stop logging', () => this.api.stopLogging())
			} else {
				await this.runCommand('Start logging', () => this.api.startLogging())
			}
		},
	}

	actions['get_inputs'] = {
		name: 'Update Input List',
		options: [],
		callback: async () => {
			await this.refreshInputs()
		},
	}

	actions['change_angle'] = {
		name: 'Change Angle (Take)',
		options: [],
		callback: async () => {
			await this.runCommand('Take', () => this.api.changeAngle({}))
		},
	}

	actions['set_program'] = {
		name: 'Set Program',
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'angle',
				default: 0,
				choices: this.getInputChoices(),
			},
		],
		callback: async ({ options }) => {
			await this.runCommand('Set program', () => this.api.changeAngle({ program: Number(options.angle) }))
		},
	}

	actions['set_preview'] = {
		name: 'Set Preview',
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'angle',
				default: 0,
				choices: this.getInputChoices(),
			},
		],
		callback: async ({ options }) => {
			await this.runCommand('Set preview', () => this.api.changeAngle({ preview: Number(options.angle) }))
		},
	}

	actions['set_program_preview'] = {
		name: 'Set Program & Preview',
		options: [
			{
				type: 'dropdown',
				label: 'Program Input',
				id: 'program',
				default: 0,
				choices: this.getInputChoices(),
			},
			{
				type: 'dropdown',
				label: 'Preview Input',
				id: 'preview',
				default: 0,
				choices: this.getInputChoices(),
			},
		],
		callback: async ({ options }) => {
			await this.runCommand('Set program & preview', () =>
				this.api.changeAngle({ program: Number(options.program), preview: Number(options.preview) }),
			)
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
				useVariables: true,
				tooltip: 'Markers can only be added when logging is running',
			},
			{
				type: 'dropdown',
				label: 'Time Reference',
				id: 'reference',
				default: 'live',
				choices: MARKER_REFERENCES,
			},
			{
				type: 'textinput',
				label: 'Offset (seconds or timecode, may be negative)',
				id: 'offset',
				default: '0',
				useVariables: true,
				isVisible: (options) => options.reference !== 'absolute',
			},
			{
				type: 'textinput',
				label: 'Absolute Time (seconds or timecode)',
				id: 'time',
				default: '',
				useVariables: true,
				isVisible: (options) => options.reference === 'absolute',
			},
		],
		callback: async ({ options }, context) => {
			const body = {
				name: await context.parseVariablesInString(options.markerText ?? ''),
				reference: options.reference ?? 'live',
			}
			if (body.reference === 'absolute') {
				body.time = await context.parseVariablesInString(options.time ?? '0')
			} else {
				body.offset = await context.parseVariablesInString(options.offset ?? '0')
			}
			await this.runCommand('Add marker', () => this.api.addMarker(body))
		},
	}

	this.setActionDefinitions(actions)
}
