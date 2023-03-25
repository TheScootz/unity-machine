const { assuredworkloads } = require("googleapis/build/src/apis/assuredworkloads")

module.exports = {
	name: "ooc",
	help: `\`!ooc\`

**Usage:** The command requires no args.
**Details:** The command gets all messages sent in #out-of-context. Then, it filters out images and returns a random one.
**Examples:**
\`!ooc\``,
	
	async execute(msg, args) {
		messageId = await redisClient.sRandMember("messageIds") // Get random image from cache
		imageUrl = await redisClient.hGet(messageId, "imageUrl") // Get that image's URL
		msg.channel.send({files: [imageUrl]}); // Send that image
	}
}