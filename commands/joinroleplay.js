module.exports = {
	name: "joinroleplay",
	aliases: ['joinrp'],
	help: `\`!joinroleplay\`

**Aliases:** \`!joinrp\`
**Usage:** No arguments are required.
**Details:** The command gives you the Roleplay role if you do not have it.
**Examples:**
\`!roleplay\``,

	execute (msg, args) {
		const roleplayRole = TLAServer.roles.cache.find(role => role.name === "Roleplay");
		const guildMember = TLAServer.member(msg.author); // Guild member version of sender of message
		if (! TLAServer.member(msg.author).roles.cache.find(role => role.name === "Roleplay")) { // Sender does not have Roleplay role
			guildMember.roles.add(roleplayRole);
			msg.channel.send("Added Roleplay Role!");
		} else { // Sender has Roleplay role
			guildMember.roles.remove(roleplayRole);
			msg.channel.send("Removed Roleplay Role!");
		}
	}
}