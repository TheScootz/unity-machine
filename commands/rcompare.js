module.exports = {
	name: "rcompare",
	help: `\`!rcompare [Census ID] [Region] [Region 2] [Region 3] [Region 4] [Region 5]\`

**Usage:** The specified Census ID must be an integer between 0 and 85. The specified region names must have the spaces replaced with underscores. The region names entered are case-insensitive. Between 2 to 5 regions can be entered at once. The Census IDs for each census can be found by using \`!censusnum\`.
**Details:** The command returns the region that performs the best in a given census out of all those compared. It also ranks the regions with each other and displays their scores in the given census.
**Examples:**
\`!rcompare 255 the_leftist_assembly democratic_socialist_assembly the_internationale the_communist_bloc north_korea\`
\`!rcompare 66 the_leftist_assembly democratic_socialist_assembly social_liberal_union the_versution_federation the_communist_bloc\``,
	
	async execute(msg, args) {
		if (args.length < 3) {
			msg.channel.send(`Error: At least 3 args are required with the !rcompare command. ${helpPrimaryCommand}`);
			return;
		}
		if (args.length > 6) {
			msg.channel.send(`Error: Over maximum number of 5 regions. Make sure you have replaced spaces with underscores. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + args.length - 1 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests += args.length - 1;

		let censusID = args[0];
		const regions = args.slice(1);
		if (! (Number.isInteger(Number(censusID)) && ((0 <= censusID && censusID <= 86) ||Number(censusID) === 255))) {
			msg.channel.send(`Error: Invalid Census ID "${censusID}". ${helpPrimaryCommand}`);
			return;
		}

		let regionScores = [];
		let regionNames = [];
		let region;
		for (let i = 0; i < regions.length; i ++) {
			region = regions[i];
			const link = `https://www.nationstates.net/cgi-bin/api.cgi?region=${region};q=name+census;scale=${censusID};mode=score`;
			try {
				var response = await getRequest(link)
			} catch (err) {
				msg.channel.send(err === "404 Not Found" ? `Error: Region ${region} does not exist.` : `An unexpected error occured: \`${err}\``);
				return;
			}

			regionName = response[0];
			score =  Number(response[1]);
			regionScores.push({region: regionName, score: score});
			regionNames.push(regionName);
		}

		regionScores.sort((a, b) => b.score - a.score); // Sort by order of score in scores array
		
		const regionsString = `${regionNames.slice(0, regionNames.length - 1).join(", ")} and ${regionNames[regionNames.length - 1]}`; // Join elements with ", ", then for the last element join with "and"
		const trophy = `https://www.nationstates.net/images/trophies/${trophies[censusID]}-100.png`;
		const censusName = censusNames[censusID];
		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(`Comparison of ${regionsString} in ${censusName}`, trophy)
			.setTitle(`${regionScores[0].region} wins!`)
			.setTimestamp()
		
		regionScores.forEach((element, index) => discordEmbed.addField(`${index + 1}. ${element.region}`, `Score: ${element.score}`));

		msg.channel.send(discordEmbed);
	}
}