module.exports = {
	name: "ooc",
	help: `\`!ooc\`

**Usage:** The command requires no args.
**Details:** The command gets all messages sent in #out-of-context. Then, it filters out images and returns a random one.
**Examples:**
\`!ooc\``,
	
	async execute(msg, args) {
		const oocChannel = await TLAServer.channels.fetch(IDS.channels.ooc); // Channel for OOC posts
		let oocMessages = await getMessages(oocChannel); // Get all messages in #out-of-context
		oocMessages = oocMessages.filter(message => message.attachments.size === 1); // Only include oocMessages with one attachment
		oocMessages = oocMessages.map(message => message.attachments.first().attachment); // Only include the url of a message's attachment
		oocMessages = oocMessages.filter(messageAttachmentURL => isImage(messageAttachmentURL.replace(/(.+)\?.*/, "$1"))); // Only include images
		try {
			msg.channel.send({ files: [getRandomObject(oocMessages)] }); // Send random image from message url array
		} catch (err) {
			msg.channel.send(`An unexpected error occured: \`${err}\``);
			console.log("ooc error: verification failed: " + err);
			return;
		}
	}
}