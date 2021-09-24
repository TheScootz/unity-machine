module.exports = {
	name: "nci",
	help: `\`!nci [Nation]\`
**Usage:** The specified nation name must have the spaces replaced with underscores. The nation name entered are case-insensitive.
**Details:** The command returns the Comrade Index of the specified nation, plus a breakdown of the score.
**Examples:**
\`!nci Socialist Columbia\`
\`!nci sonna\`
\`!nci caracasus\``,

	async execute(msg, args) {
		if (args.length === 0 && !(await TLAServer.members.fetch(msg.author)).roles.cache.find(role => role.name === "Verified")) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + 1 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests ++;

		const nation = args.length === 0 ? await getNation(msg) : args.join(' ');

		const link = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation};q=name+census;scale=6+7+27+28+29+51+57+71+73+75;mode=score`;

		try {
			var nationScores = await getRequest(link) // Get all census scores used in the Comrade Index
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Nation does not exist.` : `An unexpected error occured: \`${err}\``);
			return;
		}

		const nationName = nationScores[0];
		nationScores.shift();
		nationScores = nationScores.map(score => Number(score));
		nationScores[5] **= -0.5
		const item = await CICollections.findOne({'id': 'CI'});
		let maxTLA = item.maxTLA;

		let CIScores = [];
		for (let i = 0; i < 10; i ++) {
			CIScores.push(nationScores[i] * 10 / maxTLA[i]);
		}
		CIScore = CIScores.reduce((accumulator, score) => accumulator + score);
		listOfCensuses = ["Compassion", "Eco-Friendliness", "Government Size", "Welfare", "Public Healthcare", "Corruption", "Public Transport", "Inclusiveness", "Average Income of Poor", "Public Education"] // Names of censuses used
		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(`${nationName}'s total score on the Comrade Index: ${CIScore.toFixed(4)}`) // Rounded to 4 d.p.
			.setDescription("The Comrade Index, created by Unity Statistics, uses 10 factors to create a score ranging up to 100.")
			.setTimestamp()
	
		for (let i = 0; i < 10; i ++) {
			discordEmbed.addField(`Score in ${listOfCensuses[i]}`, CIScores[i].toFixed(5));
		}
		msg.channel.send({ embeds: [discordEmbed] });
	}
}