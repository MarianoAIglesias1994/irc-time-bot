require("dotenv").config();
const constants = require("./constants");
const time_api = require("../time_api/time_api");
const storage = require("../storage/storage");

const commands = {
  TIME_AT: "timeat",
  TIME_POPULARITY: "timepopularity",
};

exports.handleCommand = function (command, timezone, from, ircClient) {
  switch (command) {
    case commands.TIME_AT:
      handleTimeAtCommand(timezone, from, ircClient);
      break;
    case commands.TIME_POPULARITY:
      handleTimePopularityCommand(timezone, from, ircClient);
      break;
    default:
      ircClient.say(
        process.env.IRC_CHANNEL,
        from +
          ": " +
          "Sorry, I'm just a bot! I couldn't understand that.\nThe message should be in the format of ‘.timeat <tzinfo>’\n or ‘!timepopularity <tzinfo_or_prefix>’ to work properly."
      );
      break;
  }
};

async function handleTimeAtCommand(timezone, from, ircClient) {
  if (timezone == "Vancouver") {
    // Particular case
    timezone = "America/Vancouver";
  }
  const response = await time_api.getTimeAt(timezone);
  switch (response.status) {
    case constants.OK:
      storage.addOperationByTimezone(timezone);
      ircClient.say(
        process.env.IRC_CHANNEL,
        from + ": " + response.formattedApiResponse
      );
      break;
    case constants.UNKNOWN_TIMEZONE:
      ircClient.say(process.env.IRC_CHANNEL, from + ": " + "Unknown timezone.");
      break;
    case constants.SERVICE_UNAVAILABLE:
      ircClient.say(
        process.env.IRC_CHANNEL,
        from + ": " + "Time service unavailable, please try again."
      );
      break;
    default:
      ircClient.say(
        process.env.IRC_CHANNEL,
        from + ": " + "Unknown error, please try again."
      );
      break;
  }
}

function handleTimePopularityCommand(timezone, from, ircClient) {
  const account = storage.getAccountByTimezone(timezone);
  ircClient.say(process.env.IRC_CHANNEL, from + ": " + account);
}
