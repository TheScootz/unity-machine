module.exports = {
	name: "version",
	aliases: ['v'],
	help: `\`!version \`

**Usage:** The command requires no args.
**Details:** The command returns information about Unity Machine.
**Examples:**
\`!version\``,

	async execute(msg, args) {
		const unityMachineInfo = JSON.parse(await getRequest("https://api.github.com/repos/0-beep/unity-machine/commits/master"));

		const timeSinceCommit = moment(unityMachineInfo.commit.committer.date, moment.ISO_8601);
		const commitMessage = unityMachineInfo.commit.message.split('\n\n');

		const unityMachineAvatar = "https://cdn.discordapp.com/avatars/608277858745450497/6d9e3528bd0f715686171442a703ecd0.png";
		const DiscordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(commitMessage[0], unityMachineAvatar, "https://github.com/0-beep/unity-machine")
			.setDescription(commitMessage[1])
			.setFooter(timeSinceCommit.fromNow())
		msg.channel.send(DiscordEmbed);
	}
}