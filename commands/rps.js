module.exports = {
	name: "rps",
	help: `\`!rps\`

**Aliases:** \`!rockpaperscissors\`
**Usage:** No arguments are required.
**Details:** The Command allows users to play Rock-Paper-Scissors against Unity Machine.
**Examples:**
\`!rps\``,
	aliases: ["rockpaperscissors"],
	async execute(msg, args) {
		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor("Rock, Paper, Scissors!")
			.setDescription("React below to play!")

		let sentMessage = await msg.channel.send(discordEmbed);
		await sentMessage.react("\u{1f311}");
		await sentMessage.react("\u{1f4f0}");
		await sentMessage.react("\u2702");

		// Auto delete message and information about it after 60 seconds
		rpsDeleteJobs.set(sentMessage.id, schedule.scheduleJob(new Date(new Date().getTime() + 60000), () => {
			sentMessage.delete();
			rpsDeleteJobs.delete(sentMessage.id);
		}));
	}
}