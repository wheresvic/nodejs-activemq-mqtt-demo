const mqtt = require("mqtt");

const configuration = require("./config");

function main() {
  configuration.init().then(function(ic) {
    const client = mqtt.connect("mqtt://localhost:1883", {
      clientId: "nodejs-activemq-mqtt-demo",
      clean: false,
      username: ic.mqttUsername,
      password: ic.mqttPassword
    });

    client.on("connect", () => {
      client.subscribe({ "home/test": { qos: 2 } }, function(err, granted) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(granted);
      });
    });

    client.on("message", (topic, message) => {
      console.log("received message %s %s", topic, message);
    });
  });
}

/**
 * Handle the different ways the application can shutdown
 */
function handleAppExit(options, err) {
  if (err) {
    console.error(err);
  }

  if (options.cleanup) {
    console.log("cleaning up");
  }

  if (options.exit) {
    process.exit();
  }
}

/*
process.on(
  "exit",
  handleAppExit.bind(null, {
    cleanup: true
  })
);
*/

process.on(
  "SIGINT",
  handleAppExit.bind(null, {
    cleanup: true,
    exit: true
  })
);

process.on(
  "SIGTERM",
  handleAppExit.bind(null, {
    cleanup: true,
    exit: true
  })
);

process.on(
  "uncaughtException",
  handleAppExit.bind(null, {
    exit: true
  })
);

Promise.resolve(main());
