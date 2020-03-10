module.exports = {
	name: "pronoun",
	help: `\`!pronoun [Pronouns]\`

**Usage:** The available pronouns can be found by looking at all tags that Unity Machine has been assigned. Pronouns are seperated by a space.
**Details:** The command removes all pronoun roles you already have, and assigns you the specified pronoun(s).
**Examples:**
\`!pronoun he/him\`
	*Assigns you he/him role*
\`!pronoun they/them she/her\`
	*Assigns you they/them and she/her roles*
\`!pronoun\`
	*Remove all pronoun roles*`,
	
	execute(msg, args) {
		const pronounRoles = TLAServer.roles.cache.filter(role => pronouns.includes(role.name));
		args.forEach(rolename => {
			if (! pronounRoles.find(role => role.name === rolename)) { // Pronoun Role name does not exist
				msg.channel.send(`Error: "${rolename}" is currently not a valid pronoun. Contact admin if you want this to be your pronoun.`);
			}
		});
		if (! args.every(rolename => pronounRoles.find(role => role.name === rolename))) {
			return;
		}

		const guildMember = TLAServer.member(msg.author);
		pronounRoles.forEach(prole => {
			if (guildMember.roles.cache.find(role => role === prole) && ! args.includes(prole.name)) { // Member has pronoun role and not included in args
				guildMember.roles.remove(prole);
			}
		});

		args.forEach(rolename => {
			if (! guildMember.roles.cache.find(role => role.name === rolename)) { // If user does not already have role
				guildMember.roles.add(pronounRoles.find(role => role.name === rolename));
			}
		});

		const argsString = args.join(" and ");
		if (args.length === 0) {
			msg.channel.send("Removed all pronoun roles!");
		} else if (args.length === 1) {
			msg.channel.send(`Added ${argsString} role!`);
		} else {
			msg.channel.send(`Added ${argsString} roles!`);
		}
	}
}