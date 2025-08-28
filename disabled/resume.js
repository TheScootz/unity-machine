module.exports = {
	name: "resume",
	help: `\`!resume\`

**Usage:** No arguments are required.
**Details:** The command resumes playing the cureent song.
**Examples:**
\`!resume\``,
	execute(msg, args) {
		if (msg.channel.type === "dm") { // Do not allow usage in DMs
			msg.channel.send(`Error: \`!play\` does not work in direct messages. ${helpPrimaryCommand}`);
		} else if (! dispatcher) { // Not currently playing music
			msg.channel.send("Error: No music is currently being played.");
		} else if (! dispatcher.paused) { // Music not paused
			msg.channel.send("Error: Music is already playing.");
		} else {
			dispatcher.resume();
			msg.channel.send("Music resumed.");
		}
	}
}