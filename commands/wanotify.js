module.exports = {
	name: "wanotify",
	help: `\`!wanotify\`

**Usage:**  No arguments are required
**Details:**  Opts you into notifications about World Assembly resolutions. Use it again to opt back out.
**Examples:**
\`!wanotify\``,
	async execute(msg, args) {
		const guildMember = await TLAServer.members.fetch(msg.author);

		if (guildMember.roles.cache.has(IDS.roles.WANotify)) { // Member already has role
			guildMember.roles.remove(IDS.roles.WANotify);
			msg.channel.send(`You have opted out of World Assembly notifications.`);
		}
		else {
			guildMember.roles.add(IDS.roles.WANotify);
			msg.channel.send(`You have opted into World Assembly notifications.`);
        }
	}
}