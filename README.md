# nodejs-activemq-mqtt-demo

## Setting up mosquitto on ubuntu

Reference: [https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-the-mosquitto-mqtt-messaging-broker-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-the-mosquitto-mqtt-messaging-broker-on-ubuntu-16-04)

### Install

```bash
sudo apt-get install mosquitto mosquitto-clients
```

### Test publish and subscribe

```bash
mosquitto_pub -h localhost -t test -m "hello world"
mosquitto_sub -h localhost -t test -m "hello world"
```

Alternatively install the mqtt.fx client: [http://www.jensd.de/apps/mqttfx/1.7.1/](http://www.jensd.de/apps/mqttfx/1.7.1/)

### Configure passwords

```bash
$ sudo mosquitto_passwd -c /etc/mosquitto/passwd snoop
$ sudo nano /etc/mosquitto/conf.d/default.conf

allow_anonymous false
password_file /etc/mosquitto/passwd

$ sudo service mosquitto restart
$ mosquitto_pub -h localhost -t "test" -m "hello world"

Connection Refused: not authorised.
Error: The connection was refused.

$ mosquitto_sub -h localhost -t test -u "snoop" -P "password"
```

### Enable SSL using free certificates from letsencrypt

```bash
$ sudo certbot certonly --standalone --standalone-supported-challenges http-01 -d mqtt.example.com
$ sudo crontab -e

15 3 * * * certbot renew --noninteractive --post-hook "systemctl restart mosquitto"
```

```bash
$ sudo nano /etc/mosquitto/conf.d/default.conf

. . .
listener 1883 localhost

listener 8883
certfile /etc/letsencrypt/live/mqtt.example.com/cert.pem
cafile /etc/letsencrypt/live/mqtt.example.com/chain.pem
keyfile /etc/letsencrypt/live/mqtt.example.com/privkey.pem
```

We're adding two separate `listener` blocks to the config. The first, `listener 1883 localhost`, updates the default MQTT listener on port `1883`, which is what we've been connecting to so far. 1883 is the standard unencrypted MQTT port. The `localhost` portion of the line instructs Mosquitto to only bind this port to the localhost interface, so it's not accessible externally. External requests would have been blocked by our firewall anyway, but it's good to be explicit.

`listener 8883` sets up an encrypted listener on port `8883`. This is the standard port for MQTT + SSL, often referred to as MQTTS. The next three lines, `certfile`, `cafile`, and `keyfile`, all point Mosquitto to the appropriate Let's Encrypt files to set up the encrypted connections.

```bash
sudo service mosquitto restart
sudo ufw allow 8883
```
