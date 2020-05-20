module.exports = {
	name: "cat",
	aliases: ["meow"],
	help: `\`!cat\`

**Aliases:** \`!meow\`
**Usage:** No arguments are required
**Description:** Gets a random cat photo and sends it.`,
	async execute(msg, args) {
		let image = (await getRequest("https://api.thecatapi.com/v1/images/search"))[0];
		image = JSON.parse(image)[0].url;
		msg.channel.send({files: [image]});
	}
}