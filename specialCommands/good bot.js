module.exports = {
	name: "good bot",
	description: "Vote bot as good",

	async execute(msg) {
		if (msg.channel.type === "dm") return; // Ignore DMs
		item = await counter.findOne({id: 'counter'});
		msg.channel.send(`You have voted Unity Machine as being good. (${item.goodbot + 1} votes in total for being good, ${item.badbot} votes in total for being bad)`);
		counter.updateOne({id: "counter"}, {'$inc': {goodbot: 1}});
	}
}