module.exports = {
	name: "chatchart",
	help: `\`!chatchart [Channel]\`

**Usage:** If no channel is specified, the bot will default to the channel that is currently being used.
**Details:** The command creates a chart showing the proportion of the past 1000 messages each non-bot account posted.
**Examples:**
\`!chatchart\`
\`!chatchart #foyer\``,
	async execute(msg, args) {
		if (args.length === 0) { // No channel specified
			var channel = msg.channel; // Use current channel
		} else {
			const channelID = args[0].slice(2, -1);
			var channel = TLAServer.channels.cache.get(channelID); // Get specified channel
		}
		let messagesInChannel = await getMessages(channel, 1000); // Get messages in given channel
		messagesInChannel = messagesInChannel.filter(message => ! message.author.bot); // Filter messages sent by bot
		if (messagesInChannel.size === 0) { // No non-bot messages
			msg.channel.send(`There are no non-bot messages in ${channel}.`);
			return;
		}
		let authors = []; // Array containing authors of each message
		messagesInChannel.array().forEach(message => {
			authors.push(message.author.tag);
		});
		let authorCounter = {};
		authors.forEach(author => {
			if (author in authorCounter) { // authorCounter[author] exists
				authorCounter[author] ++; // Add one to counter
			} else {
				authorCounter[author] = 1; // Set counter to one
			}
		});

		let jsonToSend = {"messages-by-account": authorCounter, "channel": channel.name}; // JSON to send to Python file
		// Convert authorCounter into PNG file
		let pngFile = await executePythonFile(path.join(__dirname, "..", "py-exec", "chatchart.py"), JSON.stringify(jsonToSend));
		pngFile = pngFile.trim() // Remove newline at end of PNG file name
		await msg.channel.send({files: [pngFile]});
		fs.unlink(pngFile, err => {if (err) console.error(err);}); // console.error any error if any
	}
}