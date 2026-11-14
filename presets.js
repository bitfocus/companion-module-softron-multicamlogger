import { combineRgb } from '@companion-module/base'

export function updatePresets() {
	let presets = {}

	presets['start'] = {
		type: 'button',
		category: 'Logging',
		name: 'Start Logging',
		style: {
			text: 'Start Logging',
			size: 'auto',
			bgcolor: combineRgb(0, 0, 0),
			color: combineRgb(255, 255, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'start_logging',
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'loggingState',
				style: {
					bgcolor: combineRgb(0, 204, 0),
					color: combineRgb(255, 255, 255),
				},
			},
		],
	}

	presets['stop'] = {
		type: 'button',
		category: 'Logging',
		name: 'Stop Logging',
		style: {
			text: 'Stop Logging',
			size: 'auto',
			bgcolor: combineRgb(0, 0, 0),
			color: combineRgb(255, 255, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'stop_logging',
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['marker'] = {
		type: 'button',
		category: 'Logging',
		name: 'Add Marker',
		style: {
			text: 'Add Marker',
			size: 'auto',
			bgcolor: combineRgb(0, 0, 0),
			color: combineRgb(255, 255, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'add_marker',
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['change_angle'] = {
		type: 'button',
		category: 'Logging',
		name: 'Take',
		style: {
			text: 'Take',
			size: 'auto',
			bgcolor: combineRgb(0, 0, 0),
			color: combineRgb(255, 255, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'change_angle',
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	const buses = [
		['pgm', 'Program Bus', 'set_program'],
		['pvw', 'Preview Bus', 'set_preview'],
	]

	for (const [prefix, category, actionId] of buses) {
		for (let input = 0; input < this.inputs.length; input++) {
			presets[prefix + input] = {
				type: 'button',
				category: category,
				name: String(input + 1),
				style: {
					text: String(input + 1),
					size: 'auto',
					bgcolor: combineRgb(0, 0, 0),
					color: combineRgb(255, 255, 255),
				},
				steps: [
					{
						down: [
							{
								actionId: actionId,
								options: {
									angle: input,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'program',
						options: {
							angle: input,
						},
						style: {
							bgcolor: combineRgb(204, 0, 0),
							color: combineRgb(255, 255, 255),
						},
					},
					{
						feedbackId: 'preview',
						options: {
							angle: input,
						},
						style: {
							bgcolor: combineRgb(0, 204, 0),
							color: combineRgb(255, 255, 255),
						},
					},
				],
			}
		}
	}

	this.setPresetDefinitions(presets)
}
