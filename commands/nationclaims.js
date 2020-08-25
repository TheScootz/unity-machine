module.exports = {
	name: "nationclaims",
	help: `\`!nationclaims [Nation]\`

**Usage:** The specified nation is case-sensitive.
**Detials:** The command enters the tags of all users that are verified with the specified nation.
**Examples:**
\`!nationclaims Nott#4859\``,

	async execute(msg, args) {
		const nation = args.join(' ');
		nationClaims = await userCollections.find({"nation": nation}).toArrayAsync();
		nationClaims = nationClaims.map(item => client.users.cache.find(u => u.id === item.id)); // Convert IDs to User objects
		nationClaims = nationClaims.filter(user => TLAServer.member(user).roles.cache.find(role => role.name === "Verified")); // Filter out users that are not verified
		if (nationClaims.length === 0) { // No users claim nation
			msg.channel.send(`No users claim ${nation}.`);
			return;
		}
		nationClaims = nationClaims.map(user => user.tag); // Convert User objects to Tags
		if (nationClaims.length === 1) {
			msg.channel.send(`${nation} is claimed by **${nationClaims[0]}**.`);
		} else {
			msg.channel.send(`${nation} is claimed by ${nationClaims.splice(0, nationClaims.length - 1)} and ${nationClaims[nationClaims.length - 1]}.`);
		}
	}
}