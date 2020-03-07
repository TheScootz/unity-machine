module.exports = {
	name: "nec",
	aliases: ["nendorsementcount"],
	help: `\`!nec [Nation]\`

	**Usage:** The nation name entered is case-insensitive. If a nation argument is not given, the argument will be assumed to be the nation of the user who used the command (if there is one).
	**Details:** The command finds all nations in a region that are not endorsing the specified nation.
	**Examples:**
	\`!nec Llorens\`
	\`!nec New Arkados\``,
	async execute(msg, args) {
		if (args.length === 0 && ! TLAServer.member(msg.author).roles.cache.find(role => role.name === "Verified")) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + 3 > 50) { // Too many requests to NS
			tooManyRequests(msg);
			return;
		}
		numRequests += 3;

		const nation = args.length === 0 ? await getNation(msg) : args.join(' ');
		
		const WALink = "https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=members";
		const WAResponse = (await getRequest(WALink))[0].split(','); // All WA nations

		if (! WAResponse.includes(nation.replace(/ /g, '_').toLowerCase())) { // Nation not in WA
			msg.channel.send(`${nation} is not in the World Assembly.`);
			return;
		}

		const endorsementsLink = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=name+endorsements+region`;
		try {
			var data = await getRequest(endorsementsLink);
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Nation does not exist.` : `An unexpected error occured: \`${err}\``);
			numRequests --;
			return;
		}

		const endorsements = data[1].split(',');
		const region = data[2];

		const regionLink = `https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=name+nations`;
		const regionInfo = await getRequest(regionLink);
		regionMembers = regionInfo[1].split(':');
		const waRegionMembers = regionMembers.filter(nation => WAResponse.includes(nation)); //Filter nations not part of WA

		msg.channel.send(`${data[0]} has ${endorsements.length} endorsements (${(endorsements.length / waRegionMembers.length * 100).toFixed(2)}% of WA Nations in ${regionInfo[0]}).`);
	}
}