import { combineRgb } from '@companion-module/base'

export function updateFeedbacks() {
	// let feedbacks = {}

	this.setFeedbackDefinitions({
		loggingState: {
			name: 'Logging State',
			type: 'boolean',
			label: 'Logging State',
			defaultStyle: {
				bgcolor: combineRgb(0, 240, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: (feedback) => {
				if (this.logging == true) {
					return true
				} else {
					return false
				}
			},
		},
		preview: {
			name: 'Preview Input',
			type: 'boolean',
			label: 'Change button state when Preview Input matches',
			defaultStyle: {
				bgcolor: combineRgb(0, 240, 0),
				color: combineRgb(0, 0, 0),
			},
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
				if (options.angle == this.status['preview']) {
					return true
				} else {
					return false
				}
			},
		},
		program: {
			name: 'Program Input',
			type: 'boolean',
			label: 'Change button state when Program Input matches',
			defaultStyle: {
				bgcolor: combineRgb(240, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
				if (options.angle == this.status['program']) {
					return true
				} else {
					return false
				}
			},
		},
	})
}
