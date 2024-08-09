const { Service, Characteristic } = require('homebridge');

module.exports = (homebridge) => {
    homebridge.registerAccessory('homebridge-spvpump', 'SPVPump', SPVPump);
};

class SPVPump {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.name = config.name;

        this.service = new Service.Switch(this.name);
        this.service.getCharacteristic(Characteristic.On)
            .on('set', this.setOn.bind(this));
    }

    setOn(value, callback) {
        this.log(`Setting pump state to ${value}`);
        callback(null);
    }

    getServices() {
        return [this.service];
    }
}
