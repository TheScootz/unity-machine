module.exports = {
	name: "npolicy",
	help: `\`!npolicy [Nation]\`

**Usage:** The nation name entered is case-insensitive. If a nation argument is not given, the argument will be assumed to be the nation of the user who used the command (if there is one).
**Details:** The command returns a text file, with the title, banner URL, and description of each policy the nation has.
**Examples:**
\`!npolicy caracasus\`
\`!npolicy south_miruva\`
\`!npolicy ransium\``,
	
	async execute(msg, args) {
		if (args.length < 1 && ! TLAServer.member(msg.author).roles.cache.find(role => role.name === "Verified")) {
			msg.channel.send(`Error: 1 argument is required with the !npolicy command. ${helpPrimaryCommand}`);
			return;
		}
		if (numRequests + 1 > 50) {
			tooManyRequests(msg);
			return;
		}
		numRequests ++;

		const nation = args.length === 0 ? await getNation(msg) : args.join(' ');;
		const link = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=policies`;
		try {
			var response = await getRequest(link)
		} catch (err) {
			msg.channel.send(err === "404 Not Found" ? `Error: Nation does not exist.` : `An unexpected error occured: \`${err}\``);
			return;
		}
		
		let dataArray = [];
		let j = response.length;
		for (let i = 0; i < j; i += 4) {
			let temparray = response.slice(i, i + 4);
			temparray.splice(2, 1); // Remove 3rd element of temparray
			temparray[0] = `policyname: ${temparray[0]}`;
			temparray[1] = `image-url: https://www.nationstates.net/images/banners/samples/${temparray[1]}.jpg`;
			temparray[2] = `description: ${temparray[2]}`;
			dataArray.push(temparray);
		}

		dataArray = dataArray.map(array => array.join('\n'));
		const data = dataArray.join("\n\n");
		const filename = `${nation}_banner.txt`
		writeAndSend(msg, filename, data);
	}
}