module.exports = {
	name: "dog",
	aliases: ["woof"],
	help: `\`!dog\`
**Aliases:** \`!woof\`
**Usage:** No arguments are required
**Description:** Gets a random dog photo and sends it.`,
	async execute(msg, args) {
		let image = (await getRequest("https://api.thedogapi.com/v1/images/search"))[0];
		image = JSON.parse(image)[0].url;
		msg.channel.send({files: [image]});
	}
}