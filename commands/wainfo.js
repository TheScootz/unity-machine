module.exports = {
	name: "wainfo",
	help: `\`!wainfo\`

**Usage:** No arguments are required.
**Details:** The command returns the number of WA Nations, Number of WA Delegates, and the current Secretary-General of the WA, as well as information regarding current WA resolutions.
**Examples:**
\`!wainfo\``,
	async execute(msg, args) {
		if (numRequests + 6 > 50) { // Too many requests to NS
			tooManyRequests(msg);
			return;
		}
		numRequests += 5;
		const numWANations = (await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=numnations"))[0];
		const numDelegates = (await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=numdelegates"))[0];

		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor("The World Assembly", NSFavicon, "https://www.nationstates.net/page=un")
			.setDescription("The WA is the world's governing body. Membership is voluntary, but all member nations must abide by legislation it passes.")
			.setThumbnail("https://www.nationstates.net/images/world_assembly.jpg")
			.addField("Number of WA Nations", numWANations, true)
			.addField("Number of WA Delegates", numDelegates, true)
			.addField("Current Secretary-General", "[Caelapes](https://www.nationstates.net/nation=caelapes)")
			.setTimestamp()
		
		await msg.channel.send(discordEmbed);
		message = await msg.channel.send("Current Resolutions at vote:");

		const GAInfo = await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=resolution");

		if (GAInfo.length > 1) { // There is a GA resolution at vote
			const SCResolutionAuthor = await getRequest(`https://www.nationstates.net/cgi-bin/api.cgi?nation=${GAInfo[6]}&q=name`);
			const discordEmbed = new Discord.MessageEmbed()
				.setColor('#ce0001')
				.setAuthor(GAInfo[3], NSFavicon, "https://www.nationstates.net/page=ga")
				.setThumbnail("https://www.nationstates.net/images/ga.jpg")
				.addField("Category", GAInfo[0], true)
				.addField("Proposed by", `[${SCResolutionAuthor}](https://www.nationstates.net/${GAInfo[6]})`, true)
				.addField("Total Votes For", GAInfo[10], true)
				.addField("Total Votes Against", GAInfo[9], true)
				.setFooter("Improving the World One Resolution at a Time")

			await msg.channel.send(discordEmbed);
		} else {
			numRequests --;
		}


		const SCInfo = await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?wa=2&q=resolution");
		
		if (SCInfo.length > 1) { // There is a SC resolution at vote
			const SCResolutionAuthor = await getRequest(`https://www.nationstates.net/cgi-bin/api.cgi?nation=${SCInfo[6]}&q=name`);

			const discordEmbed = new Discord.MessageEmbed()
				.setColor('#ce0001')
				.setAuthor(SCInfo[3], NSFavicon, "https://www.nationstates.net/page=sc")
				.setThumbnail("https://www.nationstates.net/images/sc.jpg")
				.addField("Category", SCInfo[0], true)
				.addField("Proposed by", `[${SCResolutionAuthor}](https://www.nationstates.net/${SCInfo[6]})`, true)
				.addField("Total Votes For", SCInfo[10], true)
				.addField("Total Votes Against", SCInfo[9], true)
				.setFooter("Spreading interregional peace and goodwill, via force if necessary")

			await msg.channel.send(discordEmbed);
		} else {
			numRequests --;
		}

		if (SCInfo.length === 0 && GAInfo.length === 0) {
			message.edit("There are no resolutions at vote.");
		}
	}
}