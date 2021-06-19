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
            
			// Join voice channel
			voiceChannel = client.channels.cache.find(channel => channel.type === "voice" && channel.name === "lofi-hiphop-radio");
			voiceConnection = await voiceChannel.join();

			dispatcher = await voiceConnection.play(stream, {volume: false});

			// When music stops
			dispatcher.on("finish", async reason => {
				if (musicQueue[0]) { // Still have music queued
					const nextVideoLink = musicQueue[0]; // Next video to play
					const stream = ytdl(nextVideoLink, {filter: 'audioonly'});
	
					playAndQueue(stream);
					streamInfo = await ytdl.getInfo(nextVideoLink);
					musicQueue.shift();
				} else { // No music to play
					dispatcher = null;
					streamInfo = null;
					voiceChannel.leave();
				}
			});

			dispatcher.on("error", console.error);
		
		}

		if (msg.channel.type === "dm") { // Do not allow usage in DMs
			msg.channel.send(`Error: \`!play\` does not work in direct messages. ${helpPrimaryCommand}`);
			return;
		}

		const youtubeRegex = /http(s?):\/\/(www\.|m\.)?youtu(?:be\.com\/(?:watch\?v=|embed\/)|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?=]*)?/;

		if (youtubeRegex.test(args.join(' '))) { // Arguments entered is a link to Youtube video
			var videoLink = args.join(' ');
		} else {
            
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

			var videoLink = `https://www.youtube.com/watch?v=${youtubeVideo.id.videoId}`; // Link to video
		}
        console.log(`Attemping to play video: ${videoLink}`);
        try {
            var stream = ytdl(videoLink);
        } catch (err) {
            console.log(`Issue initializing stream: ${err}`)
        }
		var videoInfo = await ytdl.getInfo(videoLink);

		
		if (dispatcher) { // Currently playing music
			musicQueue.push(videoLink);
			msg.channel.send(`**${videoInfo.videoDetails.title}** has been added into the queue!`);
		} else {
			playAndQueue(stream);
			streamInfo = videoInfo;
			msg.channel.send(`Currently playing **${videoInfo.videoDetails.title}**!`);
		}
	}
}