module.exports = {
	name: "version",
	aliases: ['v'],
	help: `\`!version \`

**Usage:** The command requires no args.
**Details:** The command returns information about Unity Machine.
**Examples:**
\`!version\``,

	async execute(msg, args) {
		const unityMachineInfo = JSON.parse(await getRequest("https://api.github.com/repos/0-beep/unity-machine/commits/main"));
		
		const timeSinceCommit = moment(unityMachineInfo.commit.committer.date, moment.ISO_8601);
		const commitMessage = unityMachineInfo.commit.message.split('\n\n');
		
		const unityMachineAvatar = "https://cdn.discordapp.com/avatars/608277858745450497/d99056fe49addd31227515f50e226841.png";
		const discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setAuthor(commitMessage[0], unityMachineAvatar, "https://github.com/TheScootz/unity-machine")
			.setDescription(commitMessage[1] ?? "*No description*")
			.setFooter(timeSinceCommit.fromNow())
		msg.channel.send({ embeds: [discordEmbed] });
	}
}