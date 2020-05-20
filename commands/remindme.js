module.exports = {
	name: "remindme",
	help: `\`!remindme [Time after now] [String]\`
**Usage:** The "Time after now" argument must be a ISO 8601 Duration String. The string following the "Time after now" argument can contain spaces.
**Details:** This command allows a user to send a message to themself after a specified period of time. This period can be anywhere between 1 minute and 365 days. Should a user leave the server at any point, all scheduled messages will be deleted.
**Examples:**
\`!remindme PT1H30M Do homework\`
\`!remindme P13DT8H0M Create poll for elections\``,

	async execute(msg, args) {
		if (args.length < 2) {
			msg.channel.send(`Error: Too little arguments. ${helpPrimaryCommand}`);
			return;
		}
		let duration = args[0].match(/^P(?!$)(?!T$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/i); // Match ISO 8601 duration format
		let reminderMessage = args.splice(1).join(' ');
		if (! duration) {
			msg.channel.send(`Error: Invalid duration format. ${helpPrimaryCommand}`);
			return;
		}

		duration = moment.duration(duration[0]);
		if (duration.asYears() > 1) { // Duration is over 1 year
			msg.channel.send(`Error: Duration too long. ${helpPrimaryCommand}`);
			return;
		}
		if (duration.asMinutes() < 1) { // Duration is under 1 minute
			msg.channel.send(`Error: Duration too Short.`)
			return;
		}

		const dueTime = new Date().getTime() + duration.asMilliseconds();
		const item = await scheduledReminders.insertOne({"time": dueTime, "id": msg.author.id, "message": reminderMessage});
		const result = JSON.parse(item.toString()); // Get what is returned after inserting item
		const assignedID = new mongo.ObjectID(result.ops[0]._id); // Get _id of item

		schedule.scheduleJob(new Date(dueTime), async () => {
			const object = await scheduledReminders.findOne({"_id": assignedID});
			if (object) { // If object with _id exists
				msg.author.send(`Reminder: ${reminderMessage}`);
				scheduledReminders.deleteOne(object);
			}
		});

		msg.channel.send("Your reminder request has been logged.");
	}
}