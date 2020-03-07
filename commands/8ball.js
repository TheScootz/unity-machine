module.exports = {
	name: "8ball",
	help: `\`!8ball\`
**Usage:** No args are required. However, a question can be appended at the end of the command.
**Details:** The command returns a random answer to a yes-or-no question. It can return one of 20 possible answers.
**Examples:** 
\`!8ball\`
\`!8ball Am I lucky today?\``,
	
	execute(msg, args) {
		let eightBallResponses = openFile("8ball.txt");
		let randomResponse = getRandomObject(eightBallResponses);
		msg.channel.send(`\u{1f3b1} ${randomResponse}, ${nickname}.`);
	}
}