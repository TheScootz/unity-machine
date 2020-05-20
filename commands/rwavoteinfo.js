module.exports = {
	name: "rwavoteinfo",
	help: `\`!rwavoteinfo [Region]\`

**Usage:** The region name entered is case-insensitive. If a region name is not specified, Unity Machine will find information about The Leftist Assembly.
**Details:** The command returns the number of nations that have voted for and against proposals in the World Assembly in the specified region, as well as the region delegate's voting stances.
**Examples:**
\`!rwavoteinfo\`
\`!rwavoteinfo The Communist Bloc`,
	async execute(msg, args) {
		if (numRequests + 8 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests += 8;

		let region = args.length === 0 ? "The Leftist Assembly" : args.join(' ');
		try {
			var delegate = (await getRequest(`https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=delegate`))[0];
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? "Error: Region does not exist" : `An unexpected error occurred: \`${err}\``);
			return;
		}

		if (delegate !== "0") { // There is a delegate
			delegate = (await getRequest(`https://www.nationstates.net/cgi-bin/api.cgi?nation=${delegate}&q=name`))[0];
		} else {
			numRequests --;
		}

		const GAVoteInfo = await getRequest(`https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=gavote`);
		if (GAVoteInfo.length > 1) { // GA at vote
			if (delegate !== "0") {
				var delegateInfo = await getRequest(`https://www.nationstates.net/cgi-bin/api.cgi?nation=${delegate}&q=name+gavote`);
			
				// Decide what emoji to represent Delegate GA vote
				var delegateGAVoteEmoji;
				switch (delegateInfo[1]) {
					case "FOR":
						delegateGAVoteEmoji = "\u2705";
						break;
					case "AGAINST":
						delegateGAVoteEmoji = "\u274c";
						break;
					case "UNDECIDED":
						delegateGAVoteEmoji = "\u2753";
				}
			}
			const GAResolutionName = (await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=resolution"))[3];

			const discordEmbed = new Discord.MessageEmbed()
				.setColor('#ce0001')
				.setAuthor(`GA Resolution - ${GAResolutionName}`, NSFavicon, "https://www.nationstates.net/page=ga")
				.setThumbnail("https://www.nationstates.net/images/ga.jpg")
				.addField("Nations For", GAVoteInfo[0], true)
				.addField("Nations Against", GAVoteInfo[1], true)

			if (delegate !== "0") {
				discordEmbed.addField("Delegate vote", `[${delegateInfo[0]}](https://nationstates.net/nation=${delegateInfo[0]}) - ${delegateGAVoteEmoji}`);
			}

			msg.channel.send(discordEmbed);
		
		} else {
		numRequests -= 2;
		}



		const SCVoteInfo = await getRequest(`https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=scvote`);
		if (SCVoteInfo.length > 1) { // SC at vote
			if (delegate !== "0") {
				var delegateInfo = await getRequest(`https://www.nationstates.net/cgi-bin/api.cgi?nation=${delegate}&q=name+scvote`);
			
				// Decide what emoji to represent Delegate SC vote
				var delegateSCVoteEmoji;
				switch (delegateInfo[1]) {
					case "FOR":
						delegateSCVoteEmoji = "\u2705";
						break;
					case "AGAINST":
						delegateSCVoteEmoji = "\u274c";
						break;
					case "UNDECIDED":
						delegateSCVoteEmoji = "\u2753";
				}
			}
			const SCResolutionName = (await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?wa=2&q=resolution"))[3];

			const discordEmbed = new Discord.MessageEmbed()
				.setColor('#ce0001')
				.setAuthor(`SC Resolution - ${SCResolutionName}`, NSFavicon, "https://www.nationstates.net/page=sc")
				.setThumbnail("https://www.nationstates.net/images/sc.jpg")
				.addField("Nations For", SCVoteInfo[0], true)
				.addField("Nations Against", SCVoteInfo[1], true)

			if (delegate !== "0") {
				discordEmbed.addField("Delegate vote", `[${delegateInfo[0]}](https://nationstates.net/nation=${delegateInfo[0]}) - ${delegateSCVoteEmoji}`);
			}

			msg.channel.send(discordEmbed);
		
		} else {
		numRequests -= 2;
		}

		if (GAVoteInfo.length === 0 && SCVoteInfo.length === 0) { // No WA resolutions being voted on
			msg.channel.send("There are no resolutions at vote.");
		}
	}
}