module.exports = {
	name: "usernation",
	help: `\`!usernation [Username and Tag]\`

**Usage:** You can find the username and tag of a Discord User by clicking on their name on the right of the Discord Client in The Leftist Assembly server.
**Details:** The command returns the nation a given user is registered as.
**Examples:**
\`!usernation Nott#4859\`
\`!usernation Kyara#3761\``,

	async execute(msg, args) {
		tag = args.join(' ');
		const user = client.users.cache.find(u => u.tag === tag);
		if (! user) {
			msg.channel.send(`Error: ${tag} is not part of The Leftitst Assembly Server.`);
			return;
		}
		if ((await TLAServer.members.fetch(user)).roles.cache.get(IDS.roles.unverified)) { // Not yet verified
			msg.channel.send(`Error: ${tag} is not verified yet.`)
			return;
		}
		const item = await userCollections.findOne({"id": user.id});
		msg.channel.send(`${tag} is verified as **${item.nation}**.`);
	}
}