module.exports = {
	name: "skip",
	help: `\`!skip\`

**Usage:** No arguments are required.
**Details:** The command skips the song that is currently being played and plays the next song in the queue if there is one.
**Examples:**
\`!skip\``,
	async execute(msg, args) {
		if (msg.channel.type === "dm") { // Do not allow usage in DMs
			msg.channel.send(`Error: \`!skip\` does not work in direct messages. ${helpPrimaryCommand}`);
		} else if (! dispatcher) { // Not currently playing music
			msg.channel.send("Error: No music is currently being played.");
		} else {
			if (musicQueue[0]) {
				const nextVideoInfo = await ytdl.getInfo(musicQueue[0]);
				msg.channel.send(`**${nextVideoInfo.title}** is now playing!`);
			} else {
				msg.channel.send("Successfully skipped music!");
			}
			dispatcher.destroy();
		}
	}
}