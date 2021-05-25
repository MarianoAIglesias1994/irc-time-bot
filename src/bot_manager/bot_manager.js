require("dotenv").config();
const irc = require("irc");
const messageParser = require("./message_parser");

exports.start = function () {
  var client = new irc.Client(process.env.IRC_SERVER, process.env.IRC_BOTNICK, {
    port: process.env.IRC_PORT,
    debug: process.env.IRC_DEBUG,
    secure: process.env.SECURE,
    channels: [process.env.IRC_CHANNEL],
  });

  client.addListener("message", messageParser.parseMessage);

  client.addListener("error", function (message) {
    console.error("ERROR: %s: %s", message.command, message.args.join(" "));
  });

  client.addListener("pm", function (nick, message) {
    console.log("Got private message from %s: %s", nick, message);
  });

  client.addListener("join", function (channel, who) {
    console.log("%s has joined %s", who, channel);
  });

  client.addListener("part", function (channel, who, reason) {
    console.log("%s has left %s: %s", who, channel, reason);
  });

  client.addListener("kick", function (channel, who, by, reason) {
    console.log("%s was kicked from %s by %s: %s", who, channel, by, reason);
  });
};
