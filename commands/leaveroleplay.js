module.exports = {
	name: "leaveroleplay",
	aliases: ['leaverp'],
	help: `\`!leaveroleplay\`

**Aliases:** \`!leaverp\`
**Usage:** No arguments are required.
**Details:** The command gives you the Roleplay role if you do not have it.
**Examples:**
\`!leaveroleplay\``,

	execute (msg, args) {
		const roleplayRole = TLAServer.roles.cache.find(role => role.name === "Roleplay");
		const guildMember = TLAServer.member(msg.author); // Guild member version of sender of message
		if (TLAServer.member(msg.author).roles.cache.find(role => role.name === "Roleplay")) { // Sender has Roleplay role
			guildMember.roles.remove(roleplayRole);
			msg.channel.send("Removed roleplay role!");
		} else { // Sender does not have Roleplay role
			msg.channel.send("You don't have the roleplay role!");
		}
	}
}