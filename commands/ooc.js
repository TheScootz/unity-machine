module.exports = {
	name: "ooc",
	help: `\`!ooc\`

**Usage:** The command requires no args.
**Details:** The command gets all messages sent in #out-of-context. Then, it filters out images and returns a random one.
**Examples:**
\`!ooc\``,
	
	async execute(msg, args) {
		const oocChannel = TLAServer.channels.cache.find(channel => channel.name === "out-of-context"); // Channel for OOC posts
		let oocMessages = new Discord.Collection();
		let lastFetch = await oocChannel.messages.fetch({limit: 100}); // Get last 100 messages
		oocMessages = oocMessages.concat(lastFetch);
		while (lastFetch.array().length == 100) { // There still are messages to get
			lastFetch = await oocChannel.messages.fetch({limit: 100, before: lastFetch.lastKey()}); // Get next 100 messages
			oocMessages = oocMessages.concat(lastFetch);
		}
		const isImageRegex = /\.(jpg|gif|png|tiff)$/; // Check if url is image
		oocMessages = oocMessages.filter(message => message.attachments.array().length === 1); // Only include oocMessages with one attachment
		oocMessages = oocMessages.map(message => message.attachments.array()[0].url); // Only include the url of a message's attachment
		oocMessages = oocMessages.filter(messageAttachmentURL => isImageRegex.test(messageAttachmentURL)); // Only include images
		msg.channel.send({files: [getRandomObject(oocMessages)]}); // Send random image from message url array
	}
}