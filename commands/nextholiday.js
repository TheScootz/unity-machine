module.exports = {
	name: "nextholiday",
	help: `\`!nextholiday\`

**Usage:** No args are required.
**Details:** The command returns the name of the next holiday and the number of days until the holiday, where "holiday" is defined under the Holiday Act. The number of days is calculated using UTC time (e.g. if it is 23:00 28/8 UTC time, then to bot will say that it is 1 day from August Farce Day, even though it is August Farce Day elsewhere).
**Examples:**
\`!nextholiday\``,
	
	execute(msg, args) {
		let holidays = openFile("holidays.txt");
		const today = moment().utc().startOf("day"); // UTC date, with time set to 00:00
		const year = today.year(); // This year
		holidays = holidays.map(holiday => {
			let temparray = holiday.split(': ');
			object = {
				name: temparray[0],
				date: moment.utc(`${year}${temparray[1]}`)
			};
			return object;
		});
		for (let i = 0; i < holidays.length; i ++) {
			if (today.diff(holidays[i].date, 'day') > 0) {
				holidays[i].date.add(1, "year");
			} else {
				break
			}
		}
		holidays.sort((a, b) => a.date.diff(b.date)); // Sort by oldest to newest
		
		const nextHoliday = holidays[0];
		difference = nextHoliday.date.diff(today, "day");

		if (difference === 0) {
			msg.channel.send(`Today is ${nextHoliday.name}! \u{1f389}`)
		} else if (difference === 1) {
			msg.channel.send(`${nextHoliday.name} is only 1 day away!`)
		} else {
			msg.channel.send(`${nextHoliday.name} is only ${difference} days away!`)
		}
	}
}