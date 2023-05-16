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

    enum RPY{
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
//% color="#275C6B" icon="\uf21d" weight=95 block="SEN-MPU6050"
namespace SENMPU6050 {
    let i2cAddress = 0x68;
    let power_mgmt = 0x6b;
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

    // Initialize acceleration and gyroscope values
    let xAccel = 0;
    let yAccel = 0;
    let zAccel = 0;
    let xGyro = 0;
    let yGyro = 0;
    let zGyro = 0;
    let deltat = 0;
    let time_pre =0;
    let Xgyro_tot=0;
    let Ygyro_tot=0;
    let Zgyro_tot=0;
    let pi = Math.PI;
    let q: Array<number> 
    let Gxyz: Array<number> = [0.0,0.0,0.0]
    let Axyz: Array<number> = [0.0,0.0,0.0]
    q = [1.0, 0.0, 0.0, 0.0];
    let Kp = 30.0;
    let Ki = 0.0;
    const A_cal = [265.0, -80.0, -700, 0.994, 1.000, 1.014]; // 0..2 offset xyz, 3..5 scale xyz
    const G_off = [ -499.5,-17.7,-82.0];
    let gscale=0
    let now= 0
    let last = 0
   

    function i2cRead(reg: number): number {
        pins.i2cWriteNumber(i2cAddress, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(i2cAddress, NumberFormat.UInt8BE);
    }

    function readData(reg: number) {
        let h = i2cRead(reg);
        let l = i2cRead(reg+1);
        let value = (h << 8) + l;

        if (value >= 0x8000) {
            return -((65535 - value) + 1);
        }
        else {
            return value;
        }
    }

    function dist(a: number, b: number): number {
        return Math.sqrt((a*a)+(b*b));
    }
    function rad2deg (num:number): number {return num * (180/pi);}

    // Update acceleration data via I2C
    function updateAcceleration(sensitivity: number) {
        // Set sensitivity of acceleration range, according to selection and datasheet value
        let accelRange = 0;
        if(sensitivity == accelSen.range_2_g) {
            // +- 2g
            accelRange = 16384;
        }
        else if(sensitivity == accelSen.range_4_g) {
            // +- 4g
            accelRange = 8192;
        }
        else if(sensitivity == accelSen.range_8_g) {
            // +- 8g
            accelRange = 4096;
        }
        else if(sensitivity == accelSen.range_16_g) {
            // +- 16g
            accelRange = 2048;
        }

        let ax=readData(xAccelAddr)
        let ay=readData(yAccelAddr)
        let az=readData(zAccelAddr)
        
        Axyz[0] = ax;
        Axyz[1] = ay;
        Axyz[2] = az;

  //apply offsets and scale factors from Magneto
        for (let i = 0; i < 3; i++) { Axyz[i] = (Axyz[i] - A_cal[i]) * A_cal[i + 3];}

        xAccel = ax / accelRange;
        yAccel = ay / accelRange;
        zAccel = az / accelRange;
    }

    // Update gyroscope data via I2C
    function updateGyroscope(sensitivity: gyroSen) {
        // Set sensitivity of gyroscope range, according to selection and datasheet value
        let gyroRange = 0;
        if(sensitivity == gyroSen.range_250_dps) {
            // +- 250dps
            gyroRange = 131;
            let gscale = (250/32768.0)*(Math.PI/180.0);
        }
        else if(sensitivity == gyroSen.range_500_dps) {
            // +- 500dps
            gyroRange = 65.5;
            let gscale = (500/32768.0)*(Math.PI/180.0);
        }
        else if(sensitivity == gyroSen.range_1000_dps) {
            // +- 1000dps
            gyroRange = 32.8;
            let gscale = (1000/32768.0)*(Math.PI/180.0);
        }
        else if(sensitivity == gyroSen.range_2000_dps) {
            // +- 2000dps
            gyroRange = 16.4;
            let gscale = (2000/32768.0)*(Math.PI/180.0);
        }
        let gx=readData(xGyroAddr)
        let gy=readData(yGyroAddr)
        let gz=readData(zGyroAddr)

        xGyro = gx / gyroRange;
        yGyro = gy / gyroRange;
        zGyro = gz / gyroRange;
       
        Gxyz[0] = (gx - G_off[0]) * gscale; //250 LSB(d/s) default to radians/s
        Gxyz[1] = ( gy - G_off[1]) * gscale;
        Gxyz[2] = ( gz - G_off[2]) * gscale;
        
    }

    /**
     * Initialize SEN-MPU6050
     */
    //% block="Initialize SEN-MPU6050"
    //% weight=100
    export function initMPU6050() {
        let buffer = pins.createBuffer(2);
        buffer[0] = power_mgmt;
        buffer[1] = 0;
        pins.i2cWriteBuffer(i2cAddress, buffer);
    }

    /**
      * Get gyroscope values
      */
    //% block="Gyroscope value of %axisXYZ axis with %gyroSen sensitivity (Unit: rad/s)"
    //%weight=95
    export function gyroscope(axis: axisXYZ, sensitivity: gyroSen) {
        updateGyroscope(sensitivity);
        if(axis == axisXYZ.x) {
            return xGyro;
        }
        else if(axis == axisXYZ.y) {
            return yGyro;
        }
        else {
            return zGyro;
        }
    }

    /**
     * Get rotation of the corresponding Axis
     */
    //% block="Angle of %xaxisXYZ axis with %accelSen sensitivity (Unit: Degrees)"
    //% weight=90
    export function axisRotation(axis: axisXYZ, sensitivity: accelSen):number {
        updateAcceleration(sensitivity);

        let radians;
        if(axis == axisXYZ.x) {
            radians = Math.atan2(yAccel, dist(xAccel,zAccel));
        }
        else if(axis == axisXYZ.y) {
            radians = -Math.atan2(xAccel, dist(yAccel,zAccel));
        }
        else  {
            radians = Math.atan2(zAccel, dist(xAccel, yAccel));
        }

        // Convert radian to degrees and return
        
        let degrees = radians * (180/pi);
        return degrees;
    }

    /**
     * Get acceleration of the corresponding Axis
     */
    //% block="Acceleration of %xaxisXYZ axis with %accelSen sensitivity (Unit: g)"
    //% weight=85
    export function axisAcceleration(axis: axisXYZ, sensitivity: gyroSen): number {
        updateAcceleration(sensitivity);
        // Return acceleration of specific axis
        if(axis == axisXYZ.x) {
            return xAccel;
        }
        else if(axis == axisXYZ.y) {
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

    export function  Mahony_update(ax:number, ay:number, az:number,  gx:number, gy:number,  gz:number, deltat:number):Array<number> {
        let recipNorm;
        let vx, vy, vz;
        let ex, ey, ez;  //error terms
        let qa, qb, qc;
        let ix = 0.0, iy = 0.0, iz = 0.0;  //integral feedback terms
        let tmp;
      
        // Compute feedback only if accelerometer measurement valid (avoids NaN in accelerometer normalisation)
        tmp = ax * ax + ay * ay + az * az;
        if (tmp > 0.0)
        
    // Normalise accelerometer (assumed to measure the direction of gravity in body frame)
            recipNorm = 1.0 / Math.sqrt(tmp);
            ax *= recipNorm;
            ay *= recipNorm;
            ay *= recipNorm;

            // Estimated direction of gravity in the body frame (factor of two divided out)
            vx = q[1] * q[3] - q[0] * q[2];
            vy = q[0] * q[1] + q[2] * q[3];
            vz = q[0] * q[0] - 0.5 + q[3] * q[3];

            // Error is cross product between estimated and measured direction of gravity in body frame
            // (half the actual magnitude)
            ex = (ay * vz - az * vy);
            ey = (az * vx - ax * vz);
            ez = (ax * vy - ay * vx);

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
            gx += Kp * ex;
            gy += Kp * ey;
            gz += Kp * ez;

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
            recipNorm = 1.0 / Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
            q[0] = q[0] * recipNorm;
            q[1] = q[1] * recipNorm;
            q[2] = q[2] * recipNorm;
            q[3] = q[3] * recipNorm;
            serial.writeValue("q", q);

            return q;
            
        }
  

    /**
    * Get rotation of the corresponding Axis
    */
    //% block="Angulo eje %xaxisXYZ  Girosen %gyroSen Acelsen %accelSen Uni: %unidadesGyro"
    //% weight=90
    export function Rotacion(axis: RPY, sensitivity: gyroSen, sensitivity2: accelSen, unidades:unidadesGyro ): number {
        updateGyroscope(sensitivity);
        updateAcceleration (sensitivity2)
       
        now =control.micros();
        deltat = (now - last) * 1.0e-6; //seconds since last update
        last = now;

        let quaternion = Mahony_update (Axyz[0], Axyz[1], Axyz[2], Gxyz[0], Gxyz[1], Gxyz[2], deltat)

        if(axis == RPY.roll) {
            let roll  = Math.atan2((q[0] * quaternion[1] + quaternion[2] * quaternion[3]), 0.5 - (quaternion[1] * quaternion[1] + quaternion[2] * quaternion[2]));
            //Xgyro_tot = (Xgyro_tot + ( xGyro * delta / 1000.0 ) ) * (180/pi);
            if (unidades==unidadesGyro.uni_sexa) {roll= rad2deg(roll);}
            return roll;
           

        }
        else if(axis == RPY.pitch) {
            let pitch = Math.asin(2.0 * (quaternion[0] * quaternion[2] - quaternion[1] * quaternion[3]));
            //Ygyro_tot = (Ygyro_tot + ( yGyro * delta / 1000) ) * (180/pi);
            if (unidades==unidadesGyro.uni_sexa) {pitch= rad2deg(pitch);}
            return pitch;
        }
        else {
            //Zgyro_tot = (Zgyro_tot + ( zGyro * delta/ 1000) ) * (180/pi);

            //Zgyro_tot = 0.98* (Zgyro_tot + zGyro * delta) + 0.02*zAccel;
            let yaw   = -Math.atan2((quaternion[1] * quaternion[2] + quaternion[0] * quaternion[3]), 0.5 - (quaternion[2] * quaternion[2] + quaternion[3] * quaternion[3]));
            if (unidades==unidadesGyro.uni_sexa) {yaw= rad2deg(yaw);}
            return yaw;
        }

        // Convert radian to degrees and return
        
       
        
    }



}
