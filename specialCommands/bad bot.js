module.exports = {
	name: "bad bot",
	description: "Vote bot as bad",

	async execute(msg) {
		if (msg.channel.type === "dm") return; // Ignore DMs
		const item = await counter.findOne({id: 'counter'});
		msg.channel.send(`You have voted Unity Machine as being bad. (${item.goodbot} votes in total for being good, ${item.badbot + 1} votes in total for being bad)`);
		counter.updateOne({id: "counter"}, {'$inc': {badbot: 1}});
	}
}