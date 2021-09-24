module.exports = {
	name: "rcensus",
	help: `\`!rcensus [Census ID] [Region]\`

**Usage:** The specified Census ID must be an integer between 0 and 86 or 255. The specified region name must have the spaces replaced with underscores. The region name entered is case-insensitive. If a region name is not specified, Unity Machine will find information about The Leftist Assembly. The Census IDs for each census can be found by using \`!censusnum\`.
**Details:** The command returns the average score of all nation in the specified region in the specified World Census. It will also display the rank and percentile of the region in the world as a whole.
**Examples:**
\`!rcensus 255\`
\`!rcensus 0 democratic_socialist_assembly\`
\`!recensus 66 forest\``,
	
	async execute(msg, args) {
		if (args.length > 2) {
			msg.channel.send(`Error: Too many arguments. Make sure you have replaced spaces with underscores. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + 1 > 50) {
			tooManyRequests(msg);
			return;
		}

		numRequests ++;
		let censusID = args[0]
		const region = args.length === 1 ? "the_leftist_assembly" : args[1];
		
		if (! (Number.isInteger(Number(censusID)) && ((0 <= censusID && censusID <= 86) ||Number(censusID) === 255))) { // Census ID 255 refers to number of nations in a region
			msg.channel.send(`Error: Invalid Census ID "${censusID}". ${helpPrimaryCommand}`);
			return;
		}

		censusID = Number(censusID);
		const link = `https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=name+flag+census;scale=${censusID};mode=score+rank+prank` // Link used to find information on nations
		try {
			var response = await getRequest(link)
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Region does not exist.` : `An unexpected error occured: \`${err}\``);
			return;
		}

		const responseObject = {
			regionName: response[0],
			flag: response[1],
			score: response[2],
			worldRank: response[3],
			worldRankPercentage: response[4],
			censusName: censusNames[censusID],
			censusDesc: censusDescriptions[censusID]
		};

		if (Number(responseObject.worldRankPercentage) <= 1) { // 1st percentile
			responseObject.trophy = `https://www.nationstates.net/images/trophies/${trophies[censusID]}-1.png`
		} else if (Number(responseObject.worldRankPercentage) <= 5) { // 5th percentile
			responseObject.trophy = `https://www.nationstates.net/images/trophies/${trophies[censusID]}-5.png`
		} else if (Number(responseObject.worldRankPercentage) <= 10) { // 10th percentile
			responseObject.trophy = `https://www.nationstates.net/images/trophies/${trophies[censusID]}-10.png`
		} else {
			responseObject.trophy = `https://www.nationstates.net/images/trophies/${trophies[censusID]}-100.png`
		}

		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(`${responseObject.regionName}'s performance in ${responseObject.censusName}`, responseObject.trophy)
			.setDescription(responseObject.censusDesc)
			.setThumbnail(responseObject.flag)
			.addField(`Score in ${responseObject.censusName}`, responseObject.score, true)
			.addField(`Top ${responseObject.worldRankPercentage}% in the world`, `# ${responseObject.worldRank} in the world`, true)

		msg.channel.send({ embeds: [discordEmbed] });
	}
}