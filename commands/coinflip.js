module.exports = {
	name: "coinflip",
	help: `\`!coinflip\`

**Usage:** No args are required.
**Details:** The command simulates a fair coin toss and returns the result.
**Examples:**
\`!coinflip\``,
	
	execute(msg, args) {
		msg.channel.send(Math.random() < 0.5 ? `${nickname} got Heads.` : `${nickname} got Tails.`);
	}
}