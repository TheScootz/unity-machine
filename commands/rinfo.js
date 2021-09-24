module.exports = {
	name: "rinfo",
	aliases: ['r'],
	help: `\`!rinfo [Region]\`

**Aliases:** \`!r\`
**Usage:** The region name entered is case-insensitive. If a region name is not specified, Unity Machine will find information about The Leftist Assembly.
**Details:** The command returns the flag, number of nations, the name of the current WA Delegate, the name of the founder, how long ago the region was founded, and the power of the specified region.
**Examples:**
\`!rinfo\`
\`!rinfo The Internationale\`
\`!rinfo The Communist Bloc\``,
	
	async execute(msg, args) {
		if (numRequests + 3 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests += 3;


		const region = args.length === 0 ? "The Leftist Assembly" : args.join(' ');
		const regionLink = `https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=name+numnations+delegate+founder+founded+foundedtime+power+flag`;
		
		try {
			var regionResponse = await getRequest(regionLink);
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Region does not exist.` : `An unexpected error occured: \`${err}\``);
			numRequests -= 2;
			return;
		}

		responseObject = {
			name: regionResponse[0],
			numnations: regionResponse[1],
			power: regionResponse[6],
			flag: regionResponse[7]
		};

		if (regionResponse[2] === "0"){ // No Delegate
			responseObject.delegate = "None";
			responseObject.delegateEndos = 0;
			numRequests --; // Overcounting number of requests
		} else {
			const delegateLink = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${regionResponse[2]}&q=name`;
			responseObject.delegate = (await getRequest(delegateLink))[0];
		}

		if (regionResponse[3] === "0") { // No founder
			responseObject.founder = "Game created region";
			numRequests --;
		} else {
			const founderLink = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${regionResponse[3]}&q=name`;
			try {
				var founder = await getRequest(founderLink);
				responseObject.founder = founder;
			} catch (err) {
				if (err === "404 Not Found") {
					responseObject.founder = regionResponse[3];
				} else {
					msg.channel.send(`An unexpected error occurred: \`${err}\``);
					return;
				}
			}
		}

		responseObject.foundedRelative = regionResponse[4] === '0' ? "in Antiquity" : regionResponse[4]; // Checks if region was founded in Antiquity
		responseObject.foundedTime = regionResponse[5] === '0' ? '\u200B' : moment.unix(regionResponse[5]).format('Do [of] MMMM, YYYY');
		
		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(responseObject.name, NSFavicon, `https://www.nationstates.net/region=${region.replace(/ /g, '_')}`)
			.setThumbnail(responseObject.flag)
			.addField("Number of nations", responseObject.numnations, true)
			.addField("WA Delegate", responseObject.delegate, true)
			.addField("Founder", responseObject.founder[0], true)
			.addField(`Founded ${responseObject.foundedRelative}`, responseObject.foundedTime, true)
			.setFooter(`Power: ${responseObject.power}`)
			.setTimestamp()
		
		msg.channel.send({ embeds: [discordEmbed] });
	}
}