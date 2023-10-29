export function updateVariables() {
	let variables = []

	variables.push(
		{ variableId: 'preview', name: 'Preview' },
		{ variableId: 'previewLabel', name: 'Preview Label' },
		{ variableId: 'document_name', name: 'Document Name' },
		{ variableId: 'logging_state', name: 'Logging State' },
		{ variableId: 'program', name: 'Program' },
		{ variableId: 'programLabel', name: 'Program Label' },
		{ variableId: 'timecode', name: 'Timecode' }
	)
	this.setVariableDefinitions(variables)
}
