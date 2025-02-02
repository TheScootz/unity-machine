module.exports = {
	name: "mv",
	help: `\`!mv [userid] [Nation]\`

**Usage:** Requires the ID of the discord user being verified (available with developer mode).
**Details:** The command associates a discord user with a nation, bypassing the verification process. If the nation is in The Leftist Assembly, they will be given the Assemblian role. Otherwise, they will be given the Visitor role. Admin command only.
**Examples:**
\`!mv 149994630564282368 new_arkados\``,
	
	async execute(msg, args) {
        const issuer = await TLAServer.members.fetch(msg.author.id);
        if (!issuer.roles.cache.find(r => r.id == IDS.roles.admin)) {
			msg.channel.send(`Error: Not an admin.`);
			return;
        }
        console.log(msg.author + " issues manual verification: " + msg.content);
		if (args.length > 2) {
			msg.channel.send(`Error: Too many arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (args.length < 2) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + 1 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests ++;

        const userid = args[0];
		const nation = args[1];
		const link = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=wa+name+region`;
		try {
			var response = await getRequest(link)
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Nation does not exist.` : `An unexpected error occured: \`${err}\``);
			return;
		}
		
		responseObject = {
			nation: response[0],
			wa: response[1],
			region: response[2]
		};
		
		const guildMember = await TLAServer.members.fetch(userid);
		if (guildMember.roles.cache.find(role => role.name === "Verified")) { // Sender has "Verified" role
			msg.channel.send(`Error: Member has already been verified.`);
            console.log(msg.author + " manually verified as " + nation);
			return;
		}

		// Roles
		const verifiedRole = await TLAServer.roles.fetch(IDS.roles.verified);
		const assemblianRole = await TLAServer.roles.fetch(IDS.roles.assemblian);
		const visitorRole = await TLAServer.roles.fetch(IDS.roles.visitor);
		const unverifiedRole = await TLAServer.roles.fetch(IDS.roles.unverified);
		const CTERole = await TLAServer.roles.fetch(IDS.roles.CTE);
		const WACitizenRole = await TLAServer.roles.fetch(IDS.roles.WACitizen);

		await guildMember.roles.add(verifiedRole);
		await guildMember.roles.add(responseObject.region === "The Leftist Assembly" ? assemblianRole : visitorRole);
		if (responseObject.region === "The Leftist Assembly" && responseObject.wa === "WA Member") {
			await guildMember.roles.add(WACitizenRole);
		}
		await guildMember.roles.remove(guildMember.roles.cache.find(role => role.name === "Unverified") ? unverifiedRole : CTERole); // If Unverified role is found, remove it, else remove CTE role
		try {
			if (responseObject.nation.length > 30) { // Nation name is too long to display in full
				await guildMember.setNickname(`${responseObject.nation.substring(0, 27)}... ✓`);
			} else {
				await guildMember.setNickname(`${responseObject.nation} ✓`);
			}
		} catch (err) {
			msg.channel.send("Could not change your nickname: " + err);
        }

		userCollections.updateOne({"id": guildMember.id}, {"$set": {"nation": responseObject.nation, "time": null}});

		msg.channel.send(`${userid} has been verified as ${responseObject.nation}.`);

		const foyer = client.channels.cache.find(channel => channel.name === "foyer");
		await foyer.send(`@here Welcome <@${userid}> to The Leftist Assembly Discord Server!`);
		await foyer.send(`<@${userid}>, please remember to check out our server rules at ${TLAServer.channels.cache.find(channel => channel.name === 'information').toString()}, add pronouns using \`!addpronoun\` and find available pronouns via \`!listpronouns\`.`);
	}
}