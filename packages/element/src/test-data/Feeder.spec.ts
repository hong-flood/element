import 'mocha'
import { expect } from 'chai'
import { Feeder } from './Feeder'

let lines = [
	{ user: '1', username: 'johnny1@loadtest.io', password: 'correcthorsebatterstaple!' },
	{ user: '2', username: 'johnny2@loadtest.io', password: 'correcthorsebatterstaple!' },
	{ user: '3', username: 'johnny3@loadtest.io', password: 'correcthorsebatterstaple!' },
	{ user: '4', username: 'johnny4@loadtest.io', password: 'correcthorsebatterstaple!' },
	{ user: '5', username: 'johnny5@loadtest.io', password: 'correcthorsebatterstaple!' },
	{ user: '1', username: 'johnny6@loadtest.io', password: 'correcthorsebatterstaple!' },
]

type Row = { user: string; username: string; password: string }

describe('Feeder', () => {
	it('Process line by line with filter', async () => {
		let feeder = new Feeder<Row>('1')
		feeder
			.filter((line, index, instanceID) => line.user === instanceID)
			.filter(line => !!line.username)
			.filter(Boolean)
			.append(lines)

		expect(feeder.feed()).to.deep.equal({
			user: '1',
			username: 'johnny1@loadtest.io',
			password: 'correcthorsebatterstaple!',
		})
		expect(feeder.isComplete).to.be.false
		expect(feeder.feed()).to.deep.equal({
			user: '1',
			username: 'johnny6@loadtest.io',
			password: 'correcthorsebatterstaple!',
		})
		expect(feeder.feed()).to.deep.equal(null)
		expect(feeder.isComplete).to.be.true
		expect(feeder.size).to.equal(2)
	})

	it('can be reset', async () => {
		let feeder = new Feeder<Row>('1')
			.filter((line, index, instanceID) => line.user === instanceID)
			.append(lines)
			.circular(false)

		expect(feeder.isStart).to.be.true
		expect(feeder.feed()).to.not.be.null
		expect(feeder.feed()).to.not.be.null
		expect(feeder.size).to.equal(2)

		expect(feeder.isComplete).to.be.true
		feeder.reset()
		expect(feeder.isComplete).to.be.false
	})

	it('can be looped', async () => {
		let feeder = new Feeder<Row>('1')
			.filter((line, index, instanceID) => line.user === instanceID)
			.circular()
			.append(lines)

		expect(feeder.size).to.equal(2)

		expect(feeder.feed()['username']).to.equal('johnny1@loadtest.io')
		expect(feeder.feed()['username']).to.equal('johnny6@loadtest.io')
		expect(feeder.feed()['username']).to.equal('johnny1@loadtest.io')
		expect(feeder.feed()['username']).to.equal('johnny6@loadtest.io')
	})

	it('can be randomized', async () => {
		let feeder = new Feeder<Row>('1')
			.circular()
			.shuffle()
			.append(lines)

		let users = [feeder.feed()['username'], feeder.feed()['username'], feeder.feed()['username']]

		expect(users).to.not.deep.equal([
			'johnny1@loadtest.io',
			'johnny2@loadtest.io',
			'johnny3@loadtest.io',
		])
	})
})
