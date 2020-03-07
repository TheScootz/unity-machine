module.exports = {
	name: "hot",
	help: `\`!hot [Subreddit] [Number of posts] [Stickied posts included]\`

**Usage:** The subreddit entered must have the "\r" portion removed. All NSFW subreddits are **banned**. The number of posts argument entered must be an integer over 0 and equal to or below 20, and defaults to 5. The stickied posts argument must be "True" or "False", and defaults to False.
**Details:** The command takes a random post from the hottest (usually hottest 5) posts of a given subreddit. Then, the post title, a link to the post, and the number of upvotes will be returned. If applicable, the posts link, image, and text content will also be returned.
**Examples:**
\`!hot aww\`
\`!hot socialism 10\`
\`!hot LateStageCapitalism 5 True\``,
	
	async execute(msg, args) {
		if (args.length < 3) { // Less than 3 args
			if (args.length < 2) { // Less than 2 args
				if (args.length === 0) { // No args
					msg.channel.send(`Error: This command requires at least one command. ${helpPrimaryCommand}`);
					return;
	
				}
				args[1] = "5";
			}
			args[2] = "False";
		} else if (args.length > 3) {
			msg.channel.send(`Error: Too many arguments. ${helpPrimaryCommand}`);
			return;
		}

		if (! (Number.isInteger(Number(args[1])) && Number(args[1]) > 0 && Number(args[1]) <= 20)) { // "Number of posts" argument not an integer or less than 1
			msg.channel.send(`Error: "Number of Posts" argument is not an integer. ${helpPrimaryCommand}`);
			return;
		}
		if (! (args[2] === "False" || args[2] === "True")) { // "Stickied posts included" argument
			msg.channel.send(`Error: The "Sticky posts included" argument must be either "True" or "False". ${helpPrimaryCommand}`);
			return;
		}

		const data = await executePythonFile(path.join(__dirname, "..", "py-exec", "reddit.py"), [args[0], args[1], args[2], redditClientID, redditClientSecret]);

		if (data.startsWith("Error Message:")) { // Is error message
			if (data === "Error Message: received 404 HTTP response\n") { // Not found
				msg.channel.send("Error: subreddit does not exist.");
			} else if (data === "Error Message: No NSFW subreddits allowed.\n" || data === "Error Message: Subreddit is private.\n") {
				msg.channel.send(data);
			} else {
				msg.channel.send(`An unexpected error occured. Error code: ${data}`);
			}
			return;
		}

		let submissionInfo = JSON.parse(data);
		let aboutJSON = await getRequest(`https://www.reddit.com/r/${args[0]}/about.json`); // about.json of subreddit
		aboutJSON = JSON.parse(aboutJSON);
		let discordEmbed = new Discord.MessageEmbed()
			.setColor('#ce0001')
			.setFooter(`Upvotes: ${submissionInfo.score}`)
			
		if (aboutJSON === 403) { // Forbidden (Quarantined) subreddit
			discordEmbed.setAuthor(submissionInfo.title, "", submissionInfo.url)
		} else {
			discordEmbed.setAuthor(submissionInfo.title, aboutJSON.data.icon_img, submissionInfo.url)
		}

		if (submissionInfo.type === "Image") {
			discordEmbed.setImage(submissionInfo.content);
		} else if (submissionInfo.type === "Link") {
			discordEmbed.setDescription(`[Link](${submissionInfo.content})`);
		} else if (submissionInfo.type === "Post") {
			discordEmbed.setDescription(he.decode(submissionInfo.content));
		}
		msg.channel.send(discordEmbed);
	}
}