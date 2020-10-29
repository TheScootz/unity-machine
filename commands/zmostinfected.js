module.exports = {
	name: "zmostinfected",
	help: `\`!zmostzombified\`

**Usage:** No arguments are required.
**Details:** The command returns the 20 nations in The Leftist Assembly with the highest number of zombies, with a link to each nation's home page.
**Examples:**
\`!zmostinfected\``,
	
	async execute(msg, args) {
		if (numRequests + 1 > 50) {
			tooManyRequests(receivedMessage);
			return;
		}
		let infectedLeaderboard = await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=censusranks&scale=82");
		let fieldHeaders = [];
		let links = [];
		for (let i = 0; i < 60; i += 3) {
			let temparray = infectedLeaderboard.slice(i, i + 3);
			fieldHeaders.push(`${temparray[1]}. ${temparray[0]} (${Number(temparray[2]) / 1000000} million infected)`);
			links.push(`[Click here to cure](https://www.nationstates.net/nation=${temparray[0]})`);
		}

		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor("Most Infected in TLA", NSFavicon, "https://www.nationstates.net/page=list_nations/mode=g/region=the_leftist_assembly/censusid=82")
			.setTimestamp()
		for (let i = 0; i < 20; i ++) {
			discordEmbed.addField(fieldHeaders[i], links[i]);
		}

		msg.channel.send(discordEmbed);
	}
}