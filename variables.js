export function updateVariables() {
	let variables = []

	variables.push(
		{ variableId: 'preview', name: 'Preview' },
		{ variableId: 'previewLabel', name: 'Preview Label' },
		{ variableId: 'document_name', name: 'Document Name' },
		{ variableId: 'logging_state', name: 'Logging State' },
		{ variableId: 'program', name: 'Program' },
		{ variableId: 'programLabel', name: 'Program Label' },
		{ variableId: 'timecode', name: 'Timecode' },
	)

	for (const input of this.inputs) {
		variables.push({ variableId: 'input_' + (input.id + 1) + '_name', name: 'Input ' + (input.id + 1) + ' Name' })
	}

	this.setVariableDefinitions(variables)
}

export function updateVariableValues() {
	const values = {
		preview: this.status.preview ?? '',
		previewLabel: this.inputs[this.status.preview]?.label ?? '',
		document_name: this.status.document_name ?? '',
		logging_state: this.logging,
		program: this.status.program ?? '',
		programLabel: this.inputs[this.status.program]?.label ?? '',
		timecode: this.status.timecode ?? '',
	}

	for (const input of this.inputs) {
		values['input_' + (input.id + 1) + '_name'] = input.label
	}

	this.setVariableValues(values)
}
