module.exports = {
	name: "ncensus",
	help: `\`!ncensus [Census ID] [Nation]\`

**Usage:** The specified Census ID must be an integer between 0 and 86. The nation name entered are case-insensitive. The Census IDs for each census can be found by using \`!censusnum\`. The specified nation name must have the spaces replaced with underscores.
**Details:** The command returns the score of the specified nation in the specified World Census. It will also display the rank and percentile of the nation in the region it resides in and the world as a whole.
**Examples:**
\`!ncensus 12 leftist_assembly_founder\`
\`!ncensus 71 Notinhaps\`
\`!ncensus 66 fedele\``,
	
	async execute(msg, args) {
		if (args.length > 2) {
			msg.channel.send(`Error: Too many arguments. Make sure you have replaced spaces with underscores. ${helpPrimaryCommand}`);
			return;
		}
		if (args.length < 1 || (args.length < 2 && ! TLAServer.member(msg.author).roles.cache.find(role => role.name === "Verified"))) {
			msg.channel.send(`Error: At least 2 args are required with the !ncensus command. ${helpPrimaryCommand}`);
			return;
		}

		let censusID = args[0];
		const nation = args.length === 1 ? await getNation(msg) : args[1];
		if (! (Number.isInteger(Number(censusID)) && 0 <= censusID && censusID <= 86)) { //Census ID is not integer, below 0 or over 85
			msg.channel.send(`Error: Invalid Census ID "${censusID}". ${helpPrimaryCommand}`);
			return;
		}

		if (numRequests + 1 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests ++; // 1 request

		censusID = Number(censusID);
		const link = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=name+region+flag+census;scale=${censusID};mode=score+rank+rrank+prank+prrank` // Link used to find information on nations
		try {
			var response = await getRequest(link);
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Nation does not exist.` : `An unexpected error occured: \`${err}\``);
		}

		const responseObject = {
			nation: response[0],
			region: response[1],
			flag: response[2],
			score: response[3],
			worldRank: response[4],
			worldRankPercentage: response[5],
			regionRank: response[6],
			regionRankPercentage: response[7],
			censusName: censusNames[censusID],
			censusDesc: censusDescriptions[censusID]
		};

		if (Number(responseObject.worldRankPercentage) <= 1) { // 1st percentile
			responseObject.trophy = `https://www.nationstates.net/images/trophies/${trophies[censusID]}-1.png`;
		} else if (Number(responseObject.worldRankPercentage) <= 5) { // 5th percentile
			responseObject.trophy = `https://www.nationstates.net/images/trophies/${trophies[censusID]}-5.png`;
		} else if (Number(responseObject.worldRankPercentage) <= 10) { // 10th percentile
			responseObject.trophy = `https://www.nationstates.net/images/trophies/${trophies[censusID]}-10.png`;
		} else {
			responseObject.trophy = `https://www.nationstates.net/images/trophies/${trophies[censusID]}-100.png`;
		}

		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(`${responseObject.nation}'s performance in ${responseObject.censusName}`, responseObject.trophy, `https://www.nationstates.net/nation=${nation}/detail=trend/censusid=${censusID}`)
			.setDescription(responseObject.censusDesc) // Description
			.setThumbnail(responseObject.flag)
			.addField(`Score in ${responseObject.censusName}`, responseObject.score, true)
			.addField(`Rank in the world`, `# ${responseObject.worldRank}`, true)
			.addField(`Percentile rank in the world`, `Top ${responseObject.worldRankPercentage}%`, true)
			.addField(`Rank in ${responseObject.region}`, `# ${responseObject.regionRank}`, true)
			.addField(`Percentile rank in ${responseObject.region}`, `Top ${responseObject.regionRankPercentage}%`, true)
			.setTimestamp() // Add timestamp

		msg.channel.send(discordEmbed);
	}
}