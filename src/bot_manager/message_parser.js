const commandHandler = require("./command_handler");

exports.parseMessage = function (from, to, message) {
  if (process.env.IRC_DEBUG) {
    console.log(from + ": " + message);
  }

  message = message.trim();
  if (message.charAt(0) != "!") {
    return; // Not a command
  } else {
      const arguments = message.split(' ');
      const command = arguments[0].substring(1);
      const timezone = arguments[1];
      commandHandler.handleCommand(command, timezone, from, this);
  }
};
