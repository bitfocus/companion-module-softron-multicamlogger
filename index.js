// Softron Multicam Logger
// Peter Daniel 2023

import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
// import { UpgradeScripts } from './upgrades.js'
import { updateActions } from './actions.js'
// import { updateFeedbacks } from './feedbacks.js'
import { updateVariables } from './variables.js'
import got, { Options } from 'got'

class MulticamLogger extends InstanceBase {
	constructor(internal) {
		super(internal)
		
		this.updateActions = updateActions.bind(this)
		// this.updateFeedbacks = updateFeedbacks.bind(this)
		// this.updatePresets = updatePresets.bind(this)
		this.updateVariables = updateVariables.bind(this)
	}

	async init(config) {
		console.log('init multicam logger')
		this.config = config
		
		this.gotOptions = new Options({
			prefixUrl: 'http://' + this.config.host + ':' + this.config.port,
			responseType: 'json',
			throwHttpErrors: false,
		})
		
		this.inputs = []
		
		// this.gotOptions.headers = {
		// 	Accept: 'application/text',
		// 	Connection: 'keep-alive'
		// }

		
		console.log(this.gotOptions)

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		// this.updateFeedbacks() // export feedbacks
		this.updateVariables() // export variable definitions
		
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		let resetConnection = false
		
		if (this.config.host != config.host || this.config.port != config.port) {
			resetConnection = true
		}
		
		this.config = config
		
		if (resetConnection === true) {
			this.gotOptions.prefixUrl = 'http://' + this.config.host + ':' + this.config.port
		}
		
		console.log(this.gotOptions)
		
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				default: '127.0.0.1',
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				default: '8888',
				regex: Regex.PORT,
			},
		]
	}
	
	async sendGetCommand(GetURL) {
		console.log(this.gotOptions.prefixUrl + GetURL)
		// console.log('get: ' + GetURL)
		let response
	
		try {
			response = await got(GetURL, undefined, this.gotOptions)
			if (response.statusCode == 200) {
				this.updateStatus(InstanceStatus.Ok)
				console.log(response.body)
				return response.body
			} else {
				this.updateStatus(
					InstanceStatus.UnknownError,
					`Unexpected HTTP status code: ${response.statusCode} - ${response.body.error}`
				)
				this.log('warn', `Unexpected HTTP status code: ${response.statusCode} - ${response.body.error}`)
				return null
			}
		} catch (error) {
			console.log(error.message)
			return null
		}
	}
}

runEntrypoint(MulticamLogger, [])
