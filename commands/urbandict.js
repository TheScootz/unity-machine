module.exports = {
	name: "urbandict",
	aliases: ['ud', 'urbandictionary'],
	help: `\`!urbandict [Search Term]\`
**Usage:** The search term can contain spaces and is case-sensitive.
**Details:** The command searches a search term on Urban Dictionary.
**Examples:**
\`!urbandict Discord\`
\`!urbandict Noam Chomsky\`
\`!urbandict Dictionary\``,
	async execute(msg, args) {
		if (args.length === 0) {
			msg.channel.send(`Error: Too few arguments. ${helpPrimaryCommand}`);
			return;
		}
		try {
			var searchResults = JSON.parse(await getRequest(`http://urbanscraper.herokuapp.com/define/${args.join(' ')}`));
		} catch (err) {
			msg.channel.send(err === "404 Not Found " ? `No definitions were found for ${args.join(' ')}.` : `An unexpected error occured: \`${err}\``);
			return;
		}
		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(args.join(' '), "https://s2.googleusercontent.com/s2/favicons?domain_url=http://urbandictionary.com", searchResults.url.replace(/ /g, "%20"))
			.setDescription(searchResults.definition)
			.addField("Example", searchResults.example)
			.setFooter(`Author: ${searchResults.author}`)
		
		msg.channel.send({ embeds: [discordEmbed] });
	}
}