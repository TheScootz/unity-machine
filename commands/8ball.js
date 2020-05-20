module.exports = {
	name: "8ball",
	help: `\`!8ball\`

**Usage:** No arguments are required.
**Details:** The command returns a random answer to a yes-or-no question. It can return one of 20 possible answers.
**Examples:** 
\`!8ball\`
\`!8ball Am I lucky today?\``,
	
	async execute(msg, args) {
		const eightBallResponses = await openFile("8ball.txt");
		const randomResponse = getRandomObject(eightBallResponses);
		msg.channel.send(`\u{1f3b1} ${randomResponse}, ${nickname}.`);
	}
}