module.exports = {
	name: "verifyme",
	help: `\`!verifyme [Nation] [Token]\`

**Usage:** The specified nation name must have the spaces replaced with underscores. The token can be found here: https://www.nationstates.net/page=verify_login
**Details:** The command verifies that a Discord User owns a nation, and allows them to read and send messages. If the nation is in The Leftist Assembly, they will be given the Assemblian role. Otherwise, they will be given the Visitor role. If you are marked as "Verified", this command will not work.
**Examples:**
\`!verifyme nottinhaps XsOIoNxQWtAlZfIeRgx8obMgJWwOA6znSDmA9xJQKBA\``,
	
	async execute(msg, args) {
		if (args.length > 2) {
			msg.channel.send(`Error: Too many arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (args.length < 2) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (msg.channel.type !== "dm") { // Only allow verification in DMs
			msg.channel.send(`Error: \`!verifyme\` only works in direct messages. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + 1 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests ++;


		const nation = args[0];
		const link = `https://www.nationstates.net/cgi-bin/api.cgi?a=verify&nation=${nation}&checksum=${args[1]}&q=wa+name+region`; // Return if verification is successful and region of nation
		try {
			var response = await getRequest(link)
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Nation does not exist.` : `An unexpected error occured: \`${err}\``);
			return;
		}
		
		responseObject = {
			nation: response[0],
			wa: response[1],
			region: response[2],
			verification: response[3]
		};

		if (responseObject.verification === "0") { // Unsuccessful verification
			msg.channel.send("Error: Unsuccessful verification. Make sure you have not performed any in-game actions after generating the verification code, and entered your verification code and nation properly.");
			return;
		}
		
		const guildMember = TLAServer.member(msg.author);
		if (guildMember.roles.cache.find(role => role.name === "Verified")) { // Sender has "Verified" role
			msg.channel.send(`Error: You have already been verified. If you wish to change your nation name, leave and rejoin the server. ${helpPrimaryCommand}`);
			return;
		}

		const TLARoles = TLAServer.roles.cache;

		// Roles
		const verifiedRole = TLARoles.find(role => role.name === "Verified");
		const assemblianRole = TLARoles.find(role => role.name === "Assemblian");
		const visitorRole = TLARoles.find(role => role.name === "Visitor");
		const unverifiedRole = TLARoles.find(role => role.name === "Unverified");
		const CTERole = TLARoles.find(role => role.name === "CTE");
		const electoralCitizenRole = TLARoles.find(role => role.name === "Electoral Citizen");

		await guildMember.roles.add(verifiedRole);
		await guildMember.roles.add(responseObject.region === "The Leftist Assembly" ? assemblianRole : visitorRole);
		if (responseObject.region === "The Leftist Assembly" && responseObject.wa === "WA Member") {
			await guildMember.roles.add(electoralCitizenRole);
		}
		await guildMember.roles.remove(guildMember.roles.cache.find(role => role.name === "Unverified") ? unverifiedRole : CTERole); // If Unverified role is found, remove it, else remove CTE role
		if (responseObject.nation.length > 30) { // Nation name is too long to display in full
			await guildMember.setNickname(`${responseObject.nation.substring(0, 27)}... ✓`);
		} else {
			await guildMember.setNickname(`${responseObject.nation} ✓`);
		}

		userCollections.updateOne({"id": guildMember.id}, {"$set": {"nation": responseObject.nation, "time": "None"}});

		msg.channel.send(`Verification as ${responseObject.nation} successful! You should now be able to access The Leftist Assembly server.`);

		const foyer = client.channels.cache.find(channel => channel.name === "foyer");
		await foyer.send(`@here Welcome ${msg.author.toString()} to The Leftist Assembly Discord Server!`);
		await foyer.send(`${msg.author.toString()}, please remember to check out our server rules at ${TLAServer.channels.cache.find(channel => channel.name === 'server-rules').toString()}, add pronouns using \`!addpronoun\` and find available pronouns via \`!listpronouns\`.`);
	}
}