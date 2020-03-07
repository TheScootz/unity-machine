module.exports = {
	name: "pause",
	help: `\`!pause\`

**Usage:** No arguments are required.
**Details:** The command pauses the song that is currently being played.
**Examples:**
\`!pause\``,
	execute(msg, args) {
		if (msg.channel.type === "dm") { // Do not allow usage in DMs
			msg.channel.send(`Error: \`!pause\` does not work in direct messages. ${helpPrimaryCommand}`);
		} else if (! dispatcher) { // Not currently playing music
			msg.channel.send("Error: No music is currently being played.");
		} else if (dispatcher.paused) { // Music already paused
			msg.channel.send("Error: Music is already paused.");
		} else {
			dispatcher.pause();
			msg.channel.send("Music Paused.");
		}
	}
}