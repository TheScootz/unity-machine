module.exports = {
	name: "ninfo",
	aliases: ['n', 'nation'],
	help: `\`!ninfo [Nation]\`

**Aliases:** \`!n\`
**Usage:** The nation name entered is case-insensitive. If a nation argument is not given, the argument will be assumed to be the nation of the user who used the command (if there is one).
**Details:** The command returns the flag, full name, motto, population, what it is notable for, region, WA type, largest industry, influence, endorsements (both as a number and as a percentage of WA nations in their region), average income, average income of poor, and how long ago it was founded.
**Examples:**
\`!ninfo Testlandia\`
\`!ninfo Hecknamistan\`
\`!ninfo Kavagrad\``,
	
	async execute(msg, args) {
		if (args.length === 0 && !(await TLAServer.members.fetch(msg.author)).roles.cache.find(role => role.name === "Verified")) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + 3 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests += 3;

		const nation = args.length === 0 ? await getNation(msg) : args.join(' ');
		
		const link = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=majorindustry+notable+category+fullname+founded+flag+region+census+population+income+poorest+currency+influence+demonym2plural+motto;scale=66;mode=score`;
		try {
			var response = await getRequest(link)
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Nation does not exist.` : `An unexpected error occured: \`${err}\``);
			numRequests -= 2;
			return;
		}

		const responseObject = {
			fullName: response[0],
			motto: response[1],
			category: response[2],
			region: response[3],
			currency: response[5],
			flag: response[6],
			demonymPlural: response[7],
			income: response[8],
			poorIncome: response[9],
			majorIndustry: response[10],
			notable: response[11],
			influence: response[13],
			endorsements: parseInt(response[14]).toString()
		}
		if (Number(response[4]) < 1000) {
			responseObject.population = `${response[4]} million`;
		} else {
			responseObject.population = `${response[4] / 1000} billion`;
		}
		if (response[12] === "0") { // In antiquity
			responseObject.founded = "Founded in Antiquity";
		} else {
			responseObject.founded = `Founded ${response[12]}`;
		}

		const WAResponse = (await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=members"))[0].split(','); // All WA nations

		const regionLink = `https://www.nationstates.net/cgi-bin/api.cgi?region=${responseObject.region}&q=nations`;
		const regionResponse = (await getRequest(regionLink))[0].split(':') // All region nations

		const regionWANations = regionResponse.filter(nation => WAResponse.includes(nation)); // All nations inside list of WA nations
		responseObject.numWA = regionWANations.length; // Number of WA Nations

		// Description used in Message Embed
		const description = `${responseObject.fullName}, home to ${responseObject.population} ${responseObject.demonymPlural}, is notable for its ${responseObject.notable}. It currently resides in [${responseObject.region}](https://nationstates.net/region=${responseObject.region.replace(/ /g, '_')}).`;

		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(responseObject.fullName, NSFavicon, `https://www.nationstates.net/nation=${nation.replace(/ /g, '_')}`)
			.setTitle(`"${responseObject.motto}"`)
			.setDescription(description)
			.setThumbnail(responseObject.flag)
			.addField('Government Classification', responseObject.category, true)
			.addField("Largest Industry",  responseObject.majorIndustry, true)
			.addField("Influence", responseObject.influence, true)
			.addField("Average income", `${responseObject.income} ${responseObject.currency}s`, true)
			.addField("Average income of Poor", `${responseObject.poorIncome} ${responseObject.currency}s`, true)
			.setFooter(responseObject.founded)
			.setTimestamp();

		msg.channel.send({ embeds: [discordEmbed] });
	}
}