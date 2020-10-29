module.exports = {
	name: "zstatus",
	help: `\`!zstatus\`

**Usage:** No arguments are required.
**Details:** The command returns the number of Survivors, Infected and Dead in The Leftist Assembly, as well as the proportion of citizens that are Survivors, Infected and Dead.
**Examples:**
\`!zstatus\``,
	
	async execute(msg, args) {
		if (numRequests + 1 > 50) {
			tooManyRequests(receivedMessage);
			return;
		}
		let currentStatus = await getRequest("https://www.nationstates.net/cgi-bin/api.cgi?region=the_leftist_assembly&q=zombie");
		currentStatus = currentStatus.map(item => Number(item));
		let totalPop = currentStatus.reduce((accumulator, pop) => accumulator + pop);
		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor("Current Z-Day Status of TLA", NSFavicon)
			.addField(`Number of survivors: ${currentStatus[0]} million`, `${(currentStatus[0] / totalPop * 100).toFixed(2)}% of TLA Population`)
			.addField(`Number of infected: ${currentStatus[1]} million`, `${(currentStatus[1] / totalPop * 100).toFixed(2)}% of TLA Population`)
			.addField(`Number of dead: ${currentStatus[2]} million`, `${(currentStatus[2] / totalPop * 100).toFixed(2)}% of TLA Population`)
			.setTimestamp()
		msg.channel.send(discordEmbed);
	}
}