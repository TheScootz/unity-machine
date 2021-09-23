module.exports = {
	name: "removepronoun",
	aliases: ['rpronoun'],
	help: `\`!removepronoun [Pronoun(s)]\`

**Aliases:** \`!rpronoun\`
**Usage:**  The available pronouns can be found via \`!listpronouns\`. Pronouns are seperated by a space.
**Details:** The command gives you pronoun roles.
**Examples:**
\`!addpronoun he/him\`
*Gives you he/him role*
\`!addpronoun she/her\`
*Gives you she/her and they/them roles*`,
	async execute(msg, args) {
		if (args.length === 0) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		const pronounRoles = TLAServer.roles.cache.filter(role => pronouns.includes(role.name)); // Valid pronouns

		const guildMember = await TLAServer.members.fetch(msg.author);
		const memberRoles = guildMember.roles.cache;
		
		args.forEach(rolename => {
			if (! pronounRoles.find(role => role.name === rolename)) { // Pronoun Role name does not exist
				msg.channel.send(`Error: "${rolename}" is not a valid pronoun.`);
			} else if (! memberRoles.find(role => role.name == rolename)) { // Member already has role
				msg.channel.send(`Error: You do not have the ${rolename} role.`);
			}
		});

 		// Any pronoun role does not exist or the user does not have role
		if (args.some(rolename => (! pronounRoles.find(role => role.name === rolename)) || (! memberRoles.find(role => role.name == rolename)))) {
			return;
		}

		args.forEach(rolename => {
			guildMember.roles.remove(pronounRoles.find(role => role.name === rolename));
		});

		const argsString = args.join(" and ");
		if (args.length === 1) {
			msg.channel.send(`Removed ${argsString} role!`);
		} else {
			msg.channel.send(`Removed ${argsString} roles!`);
		}
	}
}