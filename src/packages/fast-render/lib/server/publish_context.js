import { Random } from 'meteor/random'
import { EJSON } from 'meteor/ejson'
import { Meteor } from 'meteor/meteor'
import { _ } from 'meteor/underscore'
import { MeteorX } from 'meteor/meteorhacks:meteorx'

const PublishContext = function PublishContext(
	context,
	handler,
	subscriptionId,
	params,
	name
) {
	const self = this

	// mock session
	const sessionId = Random.id()
	const session = {
		id: sessionId,
		userId: context.userId,
		// not null
		inQueue: {},
		connectionHandle: {
			id: sessionId,
			close() {},
			onClose() {},
			clientAddress: '127.0.0.1',
			httpHeaders: context.headers,
		},
		added(subscriptionHandle, collectionName, strId, fields) {
			// Don't share state with the data passed in by the user.
			const doc = EJSON.clone(fields)
			doc._id = self._idFilter.idParse(strId)
			Meteor._ensure(self._collectionData, collectionName)[strId] = doc
		},
		changed(subscriptionHandle, collectionName, strId, fields) {
			const doc = self._collectionData[collectionName][strId]
			if (!doc) {
				throw new Error(
					`Could not find element with id ${strId} to change`
				)
			}
			_.each(fields, function(value, key) {
				// Publish API ignores _id if present in fields.
				if (key === '_id') return

				if (value === undefined) {
					delete doc[key]
				} else {
					// Don't share state with the data passed in by the user.
					doc[key] = EJSON.clone(value)
				}
			})
		},
		removed(subscriptionHandle, collectionName, strId) {
			if (
				!(
					self._collectionData[collectionName] &&
					self._collectionData[collectionName][strId]
				)
			) {
				throw new Error(`Removed nonexistent document ${strId}`)
			}
			delete self._collectionData[collectionName][strId]
		},
		sendReady(subscriptionIds) {
			// this is called only for non-universal subscriptions
			if (!self._subscriptionId) throw new Error('Assertion.')

			// make the subscription be marked as ready
			if (!self._isDeactivated()) {
				self._context.completeSubscriptions(self._name, self._params)
			}

			// we just stop it
			self.stop()
		},
	}

	MeteorX.Subscription.call(
		self,
		session,
		handler,
		subscriptionId,
		params,
		name
	)

	self.unblock = function() {}

	self._context = context
	self._collectionData = {}
}

PublishContext.prototype = Object.create(MeteorX.Subscription.prototype)
PublishContext.prototype.constructor = PublishContext

PublishContext.prototype.stop = function() {
	// our stop does not remove all documents (it just calls deactivate)
	// Meteor one removes documents for non-universal subscription
	// we deactivate both for universal and named subscriptions
	// hopefully this is right in our case
	// Meteor does it just for named subscriptions
	this._deactivate()
}

PublishContext.prototype.error = function(error) {
	// TODO: Should we pass the error to the subscription somehow?
	console.warn(
		'error caught on publication: ',
		this._name,
		': ',
		error.message || error
	)
	this.stop()
}

export default PublishContext
