module.exports = {
	name: "addpronoun",
	aliases: ['apronoun'],
	help: `\`!addpronoun [Pronoun(s)]\`

**Aliases:** \`!apronoun\`
**Usage:**  The available pronouns can be found via \`!listpronouns\`. Pronouns are seperated by a space.
**Details:** The command gives you pronoun roles.
**Examples:**
\`!addpronoun he/him\`
*Gives you he/him role*
\`!addpronoun she/her they/them\`
*Gives you she/her and they/them roles*`,
	execute(msg, args) {
		if (args.length === 0) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		const pronounRoles = TLAServer.roles.cache.filter(role => pronouns.includes(role.name)); // Valid pronouns

		const guildMember = TLAServer.member(msg.author);
		const memberRoles = guildMember.roles.cache;
		
		args.forEach(rolename => {
			if (! pronounRoles.find(role => role.name === rolename)) { // Pronoun Role name does not exist
				msg.channel.send(`Error: "${rolename}" is currently not a valid pronoun. Contact admin if you want this to be your pronoun.`);
			} else if (memberRoles.find(role => role.name == rolename)) { // Member already has role
				msg.channel.send(`Error: You already have the ${rolename} role.`);
			}
		});

 		// Any pronoun role does not exist or the user already has role
		if (args.some(rolename => (! pronounRoles.find(role => role.name === rolename)) || memberRoles.find(role => role.name == rolename))) {
			return;
		}

		args.forEach(rolename => {
			guildMember.roles.add(pronounRoles.find(role => role.name === rolename));
		});

		const argsString = args.join(" and ");
		if (args.length === 1) {
			msg.channel.send(`Added ${argsString} role!`);
		} else {
			msg.channel.send(`Added ${argsString} roles!`);
		}
	}
}