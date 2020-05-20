module.exports = {
	name: "rembassies",
	help: `\`!rembassies [Region]\`

**Usage:** The region name entered is case-insensitive. If a region name is not specified, Unity Machine will find information about The Leftist Assembly.
**Details:** The command returns all embassies that are not being constructed or removed in a specified region.
**Examples:**
\`!embassies\`
\`!embassies Forest\`
\`!embassies Europeia\``,
	async execute(msg, args) {
		if (numRequests + 1 > 50) {
			tooManyRequests();
			return;
		}
		numRequests ++;

		const region = args.length === 0 ? "The Leftist Assembly" : args.join(' ');

		const link = `https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=embassies`;
		try {
			var embassies = await getRequest(link, true);
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Region does not exist.` : `An unexpected Error occurred: ${err}`);
		}
		let confirmedEmbassies = embassies.REGION.EMBASSIES.EMBASSY.filter(embassy => typeof(embassy) === "string"); // Embassies that are not rejected/denied/being constructed/closing
		writeAndSend(msg, `Embassies of ${region}`, confirmedEmbassies.join('\n'));
	}
}