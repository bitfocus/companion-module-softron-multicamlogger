import { combineRgb } from '@companion-module/base'

export function updateFeedbacks() {
	this.setFeedbackDefinitions({
		loggingState: {
			name: 'Logging State',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 240, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				return this.logging === true
			},
		},
		preview: {
			name: 'Preview Input',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 240, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'angle',
					default: 0,
					choices: this.getInputChoices(),
				},
			],
			callback: ({ options }) => {
				return Number(options.angle) === Number(this.status.preview)
			},
		},
		program: {
			name: 'Program Input',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(240, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'angle',
					default: 0,
					choices: this.getInputChoices(),
				},
			],
			callback: ({ options }) => {
				return Number(options.angle) === Number(this.status.program)
			},
		},
	})
}
