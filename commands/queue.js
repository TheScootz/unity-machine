module.exports = {
	name: "queue",
	help: `\`!queue\`

**Usage:** No arguments are required.
**Details:** The command shows the song that is being played and songs inside the queue. It also displays the length of each song.
**Examples:**
\`!queue\``,
	async execute(msg, args) {
		// Convert seconds to hh:mm:ss format
		function hhmmssFormat(sec) {
			const hours = Math.floor(sec / 3600).toString();
			const minutes = (Math.floor(sec / 60) % 60).toString();
			const seconds = (sec % 60).toString();
			return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
		}

		if (! dispatcher) { // No music playing
			msg.channel.send("No music is currently being played! Use `!play` to play music.");
			return;
		}
		let message = `Currently playing **${streamInfo.title}** - ${hhmmssFormat(Number(streamInfo.length_seconds))}`; // Message to send
		if (musicQueue[0]) { // Still have music to play
			message += "\n\nNext up:"
			for (let i = 0; i < musicQueue.length; i ++) {
				message += `\n${i + 1}. **${(await ytdl.getInfo(musicQueue[i])).videoDetails.title}** - ${hhmmssFormat(Number((await ytdl.getInfo(musicQueue[i])).videoInfo.videoDetails.length_seconds))}`
			}
		}
		msg.channel.send(message);
	}
}