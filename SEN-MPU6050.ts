/**
 * Enumeration of Axis (X, Y & Z)
 */
 enum axisXYZ {
    //% block="X"
    x,
    //% block="Y"
    y,
    //% block="Z"
    z
}

/**
 * Sensitivity of Accelerometer
 */
enum accelSen {
    //% block="2g"
    range_2_g,
    //% block="4g"
    range_4_g,
    //% block="8g"
    range_8_g,
    //% block="16g"
    range_16_g
}

/**
 * Sensitivity of Gyroscope
 */
enum gyroSen {
    //% block="250dps"
    range_250_dps,
    //% block="500dps"
    range_500_dps,
    //% block="1000dps"
    range_1000_dps,
    //% block="2000dps"
    range_2000_dps
}

enum unidadesGyro {
    //%block="°"
    uni_sexa,
    //%block="rad"
    uni_rad

}

enum RPY {
    //%block="Roll"
    roll,
    //%block="Pitch"
    pitch,
    //%block="Yaw"
    yaw

}
/**
  * SEN-MPU6050 Block
  */
//% color="#275C6B" icon="\uf21d" weight=95 block="MPU6050"
namespace SENMPU6050 {
    let i2cAddress = 0x68;
    let power_mgmt = 0x6b;
    let WHO_AM_I = 0x75
    let ACCEL_CONFIG = 0x1C;
    let GYRO_CONFIG = 0x1B;

    // Accelleration addresses
    let xAccelAddr = 0x3b;
    let yAccelAddr = 0x3d;
    let zAccelAddr = 0x3f;
    // Gyroscope addresses
    let xGyroAddr = 0x43;
    let yGyroAddr = 0x45;
    let zGyroAddr = 0x47;
    // Temperature address
    let tempAddr = 0x41;
    let accelRange = 0
    let gyroRange = 0

    // Initialize acceleration and gyroscope values
    let xAccel = 0;
    let yAccel = 0;
    let zAccel = 0;
    let xGyro = 0;
    let yGyro = 0;
    let zGyro = 0;
    
    let pi = Math.PI;
    let q: Array<number> = [1.0, 0.0, 0.0, 0.0];
    let Gxyz: Array<number> = [0.0, 0.0, 0.0]
    let Axyz: Array<number> = [0.0, 0.0, 0.0]
    let Gyerror: Array<number> =[0,0,0,0,0,0,0,0,0,0]
    let Kp = 5;
    let Ki = 0;
    const A_cal = [265.0, -80.0, -700.0, 0.994, 1.000, 1.014];
    const G_off = [-499.5, -17.7, -82.0];
    let gscale = 0;
    let now = 0;
    let last = 0;
    let ix = 0.0;
    let iy = 0.0;
    let iz = 0.0;

    function hex2float(num:number):number {
        let sign = (num & 0x80000000) ? -1 : 1;
        let exponent = ((num >> 23) & 0xff) - 127;
        let mantissa = 1 + ((num & 0x7fffff) / 0x7fffff);
        serial.writeNumber((sign * mantissa * Math.pow(2, exponent)))
        return sign * mantissa * Math.pow(2, exponent);
    }

    function i2cRead(reg: number): number {


        pins.i2cWriteNumber(i2cAddress, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(i2cAddress, NumberFormat.UInt8BE);
    }

    function i2cChangevalue(reg: number, value: number): void {
        let buffer = pins.createBuffer(2);
        buffer[0] = reg;
        buffer[1] = value;
        pins.i2cWriteBuffer(i2cAddress, buffer);

    }

    function readData(reg: number) {
        let h = i2cRead(reg);
        let l = i2cRead(reg + 1);
        let value = h<<8 | l
        
        //let value = (h << 8) + l;

        if (value >= 0x8000) {
            return -((65535 - value) + 1);
        }
        else {
            return value;
        }
        


        
    }

    function dist(a: number, b: number): number {
        return Math.sqrt((a * a) + (b * b));
    }

    function rad2deg(num: number): number { return num * (180 / pi); }

    // Update acceleration data via I2C


    function setupAccel(sensitivity: number) {

        if (sensitivity == accelSen.range_2_g) {
            // +- 2g
            accelRange = 16384;

            i2cChangevalue(ACCEL_CONFIG, 0 << 3);
        }
        else if (sensitivity == accelSen.range_4_g) {
            // +- 4g
            accelRange = 8192;

            i2cChangevalue(ACCEL_CONFIG, 1 << 3);
        }
        else if (sensitivity == accelSen.range_8_g) {
            // +- 8g
            accelRange = 4096;

            i2cChangevalue(ACCEL_CONFIG, 2 << 3);
        }
        else if (sensitivity == accelSen.range_16_g) {
            // +- 16g
            accelRange = 2048;

            i2cChangevalue(ACCEL_CONFIG, 3 << 3);
        }


    }




    function updateAcceleration() {
        // Set sensitivity of acceleration range, according to selection and datasheet value

        let ax1 = readData(xAccelAddr)
        let ay1 = readData(yAccelAddr)
        let az1 = readData(zAccelAddr)
        
        /*serial.writeValue('ax1', ax1);
        serial.writeValue('ay1', ay1);
        serial.writeValue('az1', az1);*/
        
        Axyz[0] = ax1;
        Axyz[1] = ay1;
        Axyz[2] = az1;



        //apply offsets and scale factors from Magneto
        for (let i = 0; i < 3; i++) { Axyz[i] = (Axyz[i] - A_cal[i]) * A_cal[i + 3]; }

        /*serial.writeValue('ax1', Axyz[0]);
        serial.writeValue('ay1', Axyz[1]);
        serial.writeValue('az1', Axyz[2]);*/

        xAccel = ax1 / accelRange;
        yAccel = ay1 / accelRange;
        zAccel = az1 / accelRange;

        /*serial.writeValue('ax1', xAccel);
        serial.writeValue('ay1', yAccel);
        serial.writeValue('az1', zAccel);*/

    }
 
    function setupGyro(sensitivity: number) {


        if (sensitivity == gyroSen.range_250_dps) {
            // +- 250dps
            gyroRange = 131;
            gscale = (250 / 32768.0) * (Math.PI / 180.0);
            i2cChangevalue(GYRO_CONFIG, 0 << 3);
        }
        else if (sensitivity == gyroSen.range_500_dps) {
            // +- 500dps
            gyroRange = 65.5;
            gscale = (500 / 32768.0) * (Math.PI / 180.0);
            i2cChangevalue(GYRO_CONFIG, 1 << 3);
        }
        else if (sensitivity == gyroSen.range_1000_dps) {
            // +- 1000dps
            gyroRange = 32.8;
            gscale = (1000 / 32768.0) * (Math.PI / 180.0);
            i2cChangevalue(GYRO_CONFIG, 2 << 3);
        }
        else if (sensitivity == gyroSen.range_2000_dps) {
            // +- 2000dps
            gyroRange = 16.4;
            gscale = (2000 / 32768.0) * (Math.PI / 180.0);
            i2cChangevalue(GYRO_CONFIG, 3 << 3);
        }
    }
    function mederro(llega: Array<number>, valor: number): number {
        
        let suma = 0
        let med= 0
        //serial.writeNumbers(llega)
        for (let i = 0; i < 10; i++) { suma += llega[i]; }
        med = suma / 10
        let dif = Math.abs(valor) - Math.abs(med)

        if (dif > 0.002 && dif < 0.005) {
            valor = med;
        

        }
        return valor

    }

    // Update gyroscope data via I2C
    function updateGyroscope() {
        // Set sensitivity of gyroscope range, according to selection and datasheet value
        let gx1=0 
        let gy1= 0 
        let gz1 = 0
        let gxx=0
        let gyy=0  
        let gzz = 0
        let med:number
       /* for (let i= 0 ; i<10; i++) {
            gx1 = readData(xGyroAddr);
            gy1 = readData(yGyroAddr);
            gz1 = readData(zGyroAddr);
        gxx += gx1
        gyy += gy1
        gzz += gz1

        basic.pause(100)
        }
        gx1 = gxx / 10
        gy1 = gyy / 10
        gz1 = gzz / 10*/
        gx1 = readData(xGyroAddr);
        gy1 = readData(yGyroAddr);
        gz1 = readData(zGyroAddr);

        //serial.writeValue('gx1', gx1);
        //serial.writeValue('gy1', gy1);
        //serial.writeValue('gz1', gz1);


        xGyro = gx1 / gyroRange;
        yGyro = gy1 / gyroRange;
        zGyro = gz1 / gyroRange;

        Gxyz[0] = (gx1 - G_off[0]) * gscale; //250 LSB(d/s) default to radians/s
        Gxyz[1] = (gy1 - G_off[1]) * gscale;
        Gxyz[2] = (gz1 - G_off[2]) * gscale;
        
        let suma = 0
        Gxyz[1] = mederro(Gyerror, Gxyz[1])
        //serial.writeNumbers(llega)
        for (let i = 0; i < 10; i++) { suma += Gyerror[i];  }
       /*- med = suma/10
        let dif=Math.abs( Gxyz[1])- Math.abs (med)
       
        if (dif > 0.002 &&  dif<0.005) {
            Gxyz[1]=med ; 

        }*/
        
        Gyerror.pop()
        Gyerror.unshift(Gxyz[1]);
        
        //serial.writeValue('gx1', Gxyz[0]);
        //serial.writeValue('med', med);
        //serial.writeValue('gz1', Gxyz[2]);


    }

    function Mahony_update(ax: number, ay: number, az: number, gx: number, gy: number, gz: number, deltat: number): void {
        


        if (Math.abs (gx) > 0.01 || Math.abs (gy) > 0.01|| Math.abs (gz) > 0.01){
        let recipNorm;
        let vx, vy, vz;
        let ex, ey, ez;  //error terms
        let qa, qb, qc;
          //integral feedback terms
        let tmp;

        // Compute feedback only if accelerometer measurement valid (avoids NaN in accelerometer normalisation)
        tmp = ax * ax + ay * ay + az * az;
        
        if (tmp > 0.0 ) {

            // Normalise accelerometer (assumed to measure the direction of gravity in body frame)
            recipNorm = 1.0 / Math.sqrt(tmp);
            ax *= recipNorm;
            ay *= recipNorm;
            az *= recipNorm;
            
            // Estimated direction of gravity in the body frame (factor of two divided out)
            vx = q[1] * q[3] - q[0] * q[2];
            vy = q[0] * q[1] + q[2] * q[3];
            vz = q[0] * q[0] - 0.5 + q[3] * q[3];

            // Error is cross product between estimated and measured direction of gravity in body frame
            // (half the actual magnitude)
            ex = (ay * vz - az * vy);
            ey = (az * vx - ax * vz);
            ez = (ax * vy - ay * vx);
            
           /* serial.writeValue('ex', ex);
            serial.writeValue('ey', ey);
            serial.writeValue('ez', ez);*/

            // Compute and apply to gyro term the integral feedback, if enabled
            if (Ki > 0.0) {
                ix += Ki * ex * deltat;  // integral error scaled by Ki
                iy += Ki * ey * deltat;
                iz += Ki * ez * deltat;
                gx += ix;  // apply integral feedback
                gy += iy;
                gz += iz;
            }

            // Apply proportional feedback to gyro term
            gx = gx + (Kp * ex);
            gy = gy + (Kp * ey);
            gz = gz + (Kp * ez);
            
            
            /*serial.writeValue('gx', gx);
            serial.writeValue('gy', gy);
            serial.writeValue('gz', gz);*/
        }

        // Integrate rate of change of quaternion, q cross gyro term
        deltat = 0.5 * deltat;
        gx *= deltat;   // pre-multiply common factors
        gy *= deltat;
        gz *= deltat;
        qa = q[0];
        qb = q[1];
        qc = q[2];
        q[0] += (-qb * gx - qc * gy - q[3] * gz);
        q[1] += (qa * gx + qc * gz - q[3] * gy);
        q[2] += (qa * gy - qb * gz + q[3] * gx);
        q[3] += (qa * gz + qb * gy - qc * gx);

        // renormalise quaternion
        recipNorm = 1.0 / Math.sqrt(Math.pow (q[0] ,2) + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
        q[0] = q[0] * recipNorm;
        q[1] = q[1] * recipNorm;
        q[2] = q[2] * recipNorm;
        q[3] = q[3] * recipNorm;
        
        //serial.writeNumbers(q)
        }

    }

    /**
     * Initialize SEN-MPU6050
     */
    //% block="Initialize MPU6050 Girosen %gyroSen Acelsen %accelSen"
    //% weight=100
    export function initMPU6050(acel: accelSen, gyro: gyroSen) {

        let buffer = pins.createBuffer(2);
        buffer[0] = power_mgmt;
        buffer[1] = 0;
        pins.i2cWriteBuffer(i2cAddress, buffer);
        setupAccel(acel);
        setupGyro(gyro);
        


    }

    /**
    * its avaliable -MPU6050
    */
    //% block="Calibrar "
    //% weight=100
    export function Calibration (): void {
        let sum : Array<number> = [0,0,0];
        for (let i = 0; i <500 ; i++) {

            updateGyroscope();
            sum[0] += Gxyz[0];
            sum[1] += Gxyz[1];
            sum[2] += Gxyz[2];

            basic.pause(100)

        }
        G_off[0] = sum[0] / 500;
        G_off[1] = sum[1] / 500;
        G_off[2] = sum[2] / 500;
       // serial.writeNumbers(G_off)

    }
    /**
     * its avaliable -MPU6050
     */
    //% block="Hay movimiento? "
    //% weight=100
    export function HayMov():boolean {

        return false;

    }
    /**
     * its avaliable -MPU6050
     */
    //% block="its avaliable? "
    //% weight=100
    export function itsAvaliable (): boolean {

        
            let a =  (i2cRead (WHO_AM_I))
            if (a==0) {
                        return false
                    }
                    else 
                    {
                        return true
                    }
            
    
    return true
    }
    
    /**
      * Get gyroscope values
      */
    //% block="Gyroscope value of %axisXYZ axis  (Unit: rad/s)"
    //%weight=95
    export function gyroscope(axis: axisXYZ) {
        updateGyroscope();
        if (axis == axisXYZ.x) {
            return Gxyz[0];
        }
        else if (axis == axisXYZ.y) {
            return Gxyz[1];
        }
        else {
            return Gxyz[2];
        }
    }


    /**
     * Get acceleration of the corresponding Axis
     */
    //% block="Acceleration of %xaxisXYZ axis sensitivity (Unit: g)"
    //% weight=85
    export function axisAcceleration(axis: axisXYZ): number {
        updateAcceleration();
        // Return acceleration of specific axis
        if (axis == axisXYZ.x) {
            return xAccel;
        }
        else if (axis == axisXYZ.y) {
            return yAccel;
        }
        else {
            return zAccel;
        }
    }

    /**
     * Get temperature
     */
    //% block="Temperature (Unit: Celsius)"
    //% weight=80
    export function readTemperature(): number {
        let rawTemp = readData(tempAddr);
        return 36.53 + rawTemp / 340;
    }




    /**
    * Get rotation of the corresponding Axis
    */
    //% block="Angulo eje %RPY  Uni: %unidadesGyro"
    //% weight=90
    export function Rotacion(axis: RPY, unidades: unidadesGyro): number {
        updateGyroscope();
        updateAcceleration()

        now = control.micros();
        let delta = (now - last) * 1.0e-6; //seconds since last update
        last = now;

        Mahony_update(Axyz[0], Axyz[1], Axyz[2], Gxyz[0], Gxyz[1], Gxyz[2], delta)



        if (axis == RPY.roll) {
            let roll = Math.atan2((q[0] * q[1] + q[2] * q[3]), 0.5 - (q[1] * q[1] + q[2] * q[2]));
            if (unidades == unidadesGyro.uni_sexa) { roll = rad2deg(roll); }
            return roll;


        }
        else if (axis == RPY.pitch) {
            let pitch = Math.asin(2.0 * (q[0] * q[2] - q[1] * q[3]));
            if (unidades == unidadesGyro.uni_sexa) { pitch = rad2deg(pitch); }
            return pitch;
        }
        else {

            let yaw = -Math.atan2((q[1] * q[2] + q[0] * q[3]), 0.5 - (q[2] * q[2] + q[3] * q[3]));
            if (unidades == unidadesGyro.uni_sexa) { yaw = rad2deg(yaw); }
            serial.writeValue('yaw', yaw);
            return yaw;
        }

        // Convert radian to degrees and return



    }



}

