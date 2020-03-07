module.exports = {
	name: "f",
	description: "Pay respects",

	async execute(msg) {
		if (msg.channel.type === "dm") return; // Ignore DMs
		const item = await counter.findOne({id: 'counter'});
		msg.channel.send(`Respects paid. (${item.respects + 1} respects paid)`);
		counter.updateOne({id: "counter"}, {'$inc': {respects: 1}});
	}
}