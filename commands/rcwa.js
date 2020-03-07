module.exports = {
	name: "rcwa",
	help: `\`!rcwa Region] [Region 2] [Region 3] [Region 4] [Region 5]\`
**Usage:** The specified region names must have the spaces replaced with underscores. The region names entered are case-insensitive. Between 2 to 5 regions can be entered at once. 
**Details:** This command returns the region that has the most WA nations out of all those specified. It also ranks the regions with each other and displays the number of WA Nations they have.
**Examples:**
\`!rcwa forest the_leftist_assembly\`
\`!rcwa libertarian_socialist_confederation north_korea\``,
	
	async execute(msg, args) {
		if (args.length < 2) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		} else if (args.length > 5) {
			msg.channel.send(`Error: Too many arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + args.length + 1 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests += args.length + 1;

		const WALink = "https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=members";
		var WAResponse = (await getRequest(WALink))[0].split(','); // All WA nations

		let regionInfo = [];
		let regionNames = [];
		let region;
		for (let i = 0; i < args.length; i ++) {
			region = args[i];
			try { 
				var regionResponse = await getRequest(`https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=nations+name`);
			} catch (err) {
				msg.channel.send(err === "404 Not Found" ? `Error: Region does not exist.` : `An unexpected error occured: \`${err}\``);
				return;
			}

			regionResponse[1] = regionResponse[1].split(':');
			regionResponse[1] = regionResponse[1].filter(nation => WAResponse.includes(nation));
			regionNames.push(regionResponse[0]);
			regionInfo.push({"region": regionResponse[0], "WA Nations": regionResponse[1].length});
		}

		regionInfo.sort((a, b) => b["WA Nations"] - a["WA Nations"]);
		const regionsString = `${regionNames.slice(0, regionNames.length - 1).join(", ")} and ${regionNames[regionNames.length - 1]}`;
		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(`Comparison of ${regionsString} in number of WA Nations`, "https://www.nationstates.net/images/world_assembly.jpg")
			.setTitle(`${regionInfo[0].region} wins!`)
			.setTimestamp()

		for (let i = 0; i < regionInfo.length; i ++) {
			discordEmbed.addField(`${i + 1}. ${regionInfo[i].region}`, `Number of WA Nations: ${regionInfo[i]["WA Nations"]}`);
		}
		msg.channel.send(discordEmbed);
	}
}