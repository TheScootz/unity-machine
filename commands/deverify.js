module.exports = {
	name: "deverify",
	help: `\`!deverify\`

**Usage:** No arguments are required. If you are marked as "Unverified", this command will not work.
**Details:** The command allows you to be de-verified and be marked as Unverified, thus allowing you to verify as another nation.
**Examples:**
\`!deverify\``,

	execute(msg, args) {
		if (msg.channel.type !== "dm") { // Only allow deverification in DMs
			msg.channel.send(`Error: \`!deverify\` only works in direct messages. ${helpPrimaryCommand}`);
			return;
		}

		const guildMember = TLAServer.member(msg.author);
		if (guildMember.roles.cache.find(role => role.name === "Unverified")) { // Only allow deverification to people that have been verified
			msg.channel.send(`Error: You are not verified yet, so you cannot use \`!deverify\`. ${helpPrimaryCommand}`);
			return;
		}
		guildMember.roles.add(TLAServer.roles.cache.find(role => role.name === "Unverified"));

		if (guildMember.roles.cache.find(role => role.name === "CTE")) { // User has CTEd
			guildMember.roles.remove(guildMember.roles.cache.find(role => role.name === "CTE"));
			userCollections.updateOne({"id": guildMember.id}, {"$set": {"nation": null}});

		} else { // Either the member is Assemblian or Visitor, either way they have the Verified role
			guildMember.roles.remove(guildMember.roles.cache.find(role => role.name === "Verified"));

			userCollections.updateOne({"id": guildMember.id}, {"$set": {"nation": null, "time": new Date().getTime()}});

			if (guildMember.roles.cache.find(role => role.name === "Assemblian")) {
				guildMember.roles.remove(guildMember.roles.cache.find(role => role.name === "Assemblian"));
			} else {
				guildMember.roles.remove(guildMember.roles.cache.find(role => role.name === "Visitor"));
			}
		}
		msg.channel.send("Deverification successful!");
	}
}