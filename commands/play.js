module.exports = {
	name: "play",
	help: `\`!play [Search Term]\`

**Usage:** The Search Term can be a Youtube link and can contain spaces.
**Details:** The command searches on Youtube for the search term and puts the first video in the search result into a music queue.
**Examples:**
\`!play The Internationale\`
\`!play https://www.youtube.com/watch?v=w0AOGeqOnFY\``,
	async execute(msg, args) {
		// Play music and music queued after
		async function playAndQueue(stream) {
			dispatcher = await voiceConnection.play(stream, {volume: 0.3}); // Decrease volume to prevent clipping

			// When music stops
			dispatcher.on("finish", async reason => {
				if (musicQueue[0]) { // Still have music queued
					const nextVideoLink = musicQueue[0]; // Next video to play
					const stream = ytdl(nextVideoLink, {filter: 'audioonly'});
	
					playAndQueue(stream);
					dispatcherInfo = await ytdl.getInfo(nextVideoLink);
					musicQueue.shift();
				} else { // No music to play
					dispatcher = null;
					dispatcherInfo = null;
				}
			});

			dispatcher.on("error", console.log);
			dispatcher.on("debug", console.log);
		
		}

		if (msg.channel.type === "dm") { // Do not allow usage in DMs
			msg.channel.send(`Error: \`!play\` does not work in direct messages. ${helpPrimaryCommand}`);
			return;
		}

		// Search Youtube using args
		const youtubeSearchResult = await youtube.search.list({
			part: 'snippet',
			type: 'video', // We do not want channels or playlists
			q: args.join(' '),
			maxResults: 1 // We only need first search result
		});
		const youtubeVideo = youtubeSearchResult.data.items[0];
		if (! youtubeVideo) {
			msg.channel.send("Error: Could not find any music matching search.");
			return;
		}

		const videoLink = `https://www.youtube.com/watch?v=${youtubeVideo.id.videoId}`; // Link to video

		const stream = ytdl(videoLink, {filter: 'audioonly'});
		const videoInfo = await ytdl.getInfo(videoLink);

		
		if (dispatcher) { // Currently playing music
			musicQueue.push(videoLink);
			msg.channel.send(`**${videoInfo.title}** has been added into the queue!`);
		} else {
			playAndQueue(stream);
			dispatcherInfo = videoInfo;
			msg.channel.send(`Currently playing **${videoInfo.title}**!`);
		}
	}
}