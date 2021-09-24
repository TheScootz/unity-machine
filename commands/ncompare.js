module.exports = {
	name: "ncompare",
	help: `\`!ncompare [Census ID] [Nation] [Nation 2] [Nation 3] [Nation 4] [Nation 5]\`

**Usage:** The specified Census ID must be an integer between 0 and 86. Between 2 to 5 nations can be entered at once. The Census IDs for each census can be found by using \`!censusnum\`. The specified nation names must have the spaces replaced with underscores. The nation names entered are case-insensitive.
**Details:** The command returns the nation that performs the best in a given census out of all those compared. It also ranks the nations with each other and displays their scores in the given census.
**Examples:**
\`!ncompare 71 the_final_horseman argentigrad\`
\`!ncompare 80 cedoria llorens libertasnia auven new_lonopolian_empire\``,
	
	async execute(msg, args) {
		if (args.length < 3) {
			msg.channel.send(`Error: At least 3 arguments are required with the !ncompare command. ${helpPrimaryCommand}`);
			return;
		}
		if (args.length > 6) {
			msg.channel.send(`Error: Over maximum number of 5 nations. Make sure you have replaced spaces with underscores. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + args.length - 1 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests += args.length - 1;

		let censusID = args[0];
		const nations = args.slice(1);
		if (! (Number.isInteger(Number(censusID)) && 0 <= censusID && censusID <= 86)) {
			msg.channel.send(`Error: Invalid Census ID "${censusID}". ${helpPrimaryCommand}`);
			return;
		}
		let nationScores = []; // Array containing objects of nation and score
		let nationNames = []; // Array of all nation "proper" names

		let nationName;
		let score;
		for (let i = 0; i < nations.length; i ++) {
			const link = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nations[i]};q=name+census;scale=${censusID};mode=score`;
			try {
				var response = await getRequest(link)
			} catch (err) {
				msg.channel.send(err === "404 Not Found" ? `Error: Nation does not exist.` : `An unexpected error occured: \`${err}\``);
				return;
			}

			nationName = response[0];
			score =  Number(response[1]);
			nationScores.push({nation: nationName, score: score});
			nationNames.push(nationName);
		}

		nationScores.sort((a, b) => b.score - a.score); // Sort by order of score in scores array
		
		const nationsRawString = nations.join("+")
		const nationsString = `${nationNames.slice(0, nationNames.length - 1).join(", ")} and ${nationNames[nationNames.length - 1]}`; // Join elements with ", ", then for the last element join with ", and"
		const trophy = `https://www.nationstates.net/images/trophies/${trophies[censusID]}-100.png`;
		const censusName = censusNames[censusID];
		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(`Comparison of ${nationsString} in ${censusName}`, trophy, `https://www.nationstates.net/page=compare/nations=${nationsRawString}/censusid=${censusID}`)
			.setTitle(`${nationScores[0].nation} wins!`)
			.setTimestamp()
		
		nationScores.forEach((element, index) => discordEmbed.addField(`${index + 1}. ${element.nation}`, `Score: ${element.score}`));

		msg.channel.send({ embeds: [discordEmbed] })
	}
}