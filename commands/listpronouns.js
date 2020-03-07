module.exports = {
	name: "listpronouns",
	help: `\`!listpronouns\`

**Usage:** The command does not require arguments.
**Details:** The command returns all available pronoun roles.`,
	execute(msg, args) {
		let messageToSend = pronouns.slice(0); // Prevent messageToSend to reference the same thing as pronouns
		messageToSend.unshift("List of Pronouns:");
		msg.channel.send(messageToSend.join('\n'));
	}
}