module.exports = {
	name: "ooc",
	help: `\`!ooc\`

**Usage:** The command requires no args.
**Details:** The command gets all messages sent in #out-of-context. Then, it filters out images and returns a random one.
**Examples:**
\`!ooc\``,
	
	async execute(msg, args) {
		const oocChannel = TLAServer.channels.cache.find(channel => channel.name === "out-of-context"); // Channel for OOC posts
		let oocMessages = await getMessages(oocChannel); // Get all messages in #out-of-context
		oocMessages = oocMessages.filter(message => message.attachments.size === 1); // Only include oocMessages with one attachment
		oocMessages = oocMessages.map(message => message.attachments.array()[0].url); // Only include the url of a message's attachment
		oocMessages = oocMessages.filter(messageAttachmentURL => isImage(messageAttachmentURL)); // Only include images
		msg.channel.send({files: [getRandomObject(oocMessages)]}); // Send random image from message url array
	}
}