module.exports = {
	name: "ne",
	help: `\`!ne [Nation]\`

**Usage:** The nation name entered is case-insensitive. If a nation argument is not given, the argument will be assumed to be the nation of the user who used the command (if there is one).
**Details:** The command finds all nations that are endorsing the given nation.
**Examples:**
\`!ne Llorens\`
\`!ne New Arkados\``,
	async execute(msg, args) {
		if (args.length === 0 && !(await TLAServer.members.fetch(msg.author)).roles.cache.find(role => role.name === "Verified")) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + 2 > 50) { // Too many requests to NS
			tooManyRequests(msg);
			return;
		}
		numRequests += 2;

		const nation = args.length === 0 ? await getNation(msg) : args.join(' ');

		const WALink = "https://www.nationstates.net/cgi-bin/api.cgi?wa=1&q=members";

		const WAResponse = (await getRequest(WALink))[0].split(','); // All WA nations

		if (! WAResponse.includes(nation.replace(/ /g, '_').toLowerCase())) { // Nation not in WA
			msg.channel.send(`${nation} is not in the World Assembly.`);
			return;
		}

		const endorsementsLink = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=endorsements`;
		
		const data = await getRequest(endorsementsLink);

		const filename = `Nations endorsing ${nation}.txt`;
		writeAndSend(msg, filename, data);
	}
}