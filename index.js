const axios = require('axios');  // Asegúrate de haber instalado axios: npm install axios
const { Service, Characteristic } = require('homebridge');

module.exports = (homebridge) => {
    homebridge.registerAccessory('homebridge-spvpump', 'SPVPump', SPVPump);
};

class SPVPump {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.name = config.name;
        this.url = config.url || 'http://192.168.1.66/cgi-bin/EpvCgi';  // URL base de la bomba

        this.service = new Service.Fanv2(this.name);  // Usamos Fanv2 para manejar las velocidades de la bomba

        // Configura la característica Active (marcha/paro)
        this.service.getCharacteristic(Characteristic.Active)
            .on('set', this.setOn.bind(this))
            .on('get', this.getOn.bind(this));

        // Configura la característica RotationSpeed para controlar las velocidades
        this.service.getCharacteristic(Characteristic.RotationSpeed)
            .setProps({
                minValue: 1,
                maxValue: 3,
                minStep: 1
            })
            .on('set', this.setSpeed.bind(this))
            .on('get', this.getSpeed.bind(this));

        this.currentSpeed = 1;  // Velocidad inicial (1, 2, 3)
        this.isOn = false;  // Estado inicial apagado
    }

    // Método para obtener el estado actual de la bomba (marcha/paro)
    getOn(callback) {
        callback(null, this.isOn);
    }

    // Método para manejar el encendido/apagado de la bomba
    async setOn(value, callback) {
        try {
            const timestamp = Date.now();
            const command = value ? 'RunStop&val=1' : 'RunStop&val=2';
            const url = `${this.url}?name=${command}&type=set&time=${timestamp}`;

            this.log(`Sending command: ${command} to ${url}`);
            await axios.get(url);

            this.isOn = value;  // Actualiza el estado interno
            callback(null);
        } catch (error) {
            this.log('Error setting pump state:', error);
            callback(error);
        }
    }

    // Método para obtener la velocidad actual de la bomba
    getSpeed(callback) {
        callback(null, this.currentSpeed);
    }

    // Método para manejar el cambio de velocidad
    async setSpeed(value, callback) {
        try {
            const timestamp = Date.now();
            const command = `SetSpeedSelected&val=${value}`;
            const url = `${this.url}?name=${command}&type=set&time=${timestamp}`;

            this.log(`Sending speed command: ${command} to ${url}`);
            await axios.get(url);

            this.currentSpeed = value;  // Actualiza la velocidad interna
            callback(null);
        } catch (error) {
            this.log('Error setting pump speed:', error);
            callback(error);
        }
    }

    // Método requerido por Homebridge para registrar los servicios
    getServices() {
        return [this.service];
    }
}

