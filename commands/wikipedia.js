module.exports = {
	name: "wikipedia",
	aliases: ["w", "wiki"],
	help: `\`!wikipedia [Search term]\`

**Aliases:** \`!w\`, \`!wiki\`
**Usage:** The search term can contain spaces.
**Details:** The command finds the Wikipedia page with the given search term. A summary will then be sent. If there is ambiguity, a Disambiguation List will be sent.
**Examples:**
\`!wikipedia Council Communism\`
\`!wikipedia Ocalan\``,

	async execute(msg, args) {
		const pageRequest = args.join(' ');
		const data = JSON.parse(await executePythonFile(path.join(__dirname, "..", "py-exec", "wiki.py"), [pageRequest]));

		if (data.type === "Error") {
			msg.channel.send(`An unexpected error occured: ${data.data}`);
			return;
		}

		const discordEmbed =  new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(`Wikipedia: ${pageRequest}`, "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1920px-Wikipedia-logo-v2.svg.png", `https://en.wikipedia.org/wiki/${pageRequest.replace(/ /g, '_')}`)
			.setDescription(data.data)

		msg.channel.send({ embeds: [discordEmbed] });
	}
}