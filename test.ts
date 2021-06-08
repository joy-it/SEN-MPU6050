// Initialize sensor for usage
SENMPU6050.initMPU6050()

while(true) {
    // Output gyroscope values
    serial.writeLine("X Gyroscope: " + SENMPU6050.gyroscope(axisXYZ.x, gyroSen.range_250_dps) + " rad/s");
    serial.writeLine("Y Gyroscope: " + SENMPU6050.gyroscope(axisXYZ.y, gyroSen.range_250_dps) + " rad/s");
    serial.writeLine("Z Gyroscope: " + SENMPU6050.gyroscope(axisXYZ.z, gyroSen.range_250_dps) + " rad/s");
    serial.writeLine("-----------------------------------------------------------------------------");

    // Output angle values
    serial.writeLine("X Angle: " + SENMPU6050.axisRotation(axisXYZ.x, accelSen.range_2_g) + " Degree");
    serial.writeLine("Y Angle: " + SENMPU6050.axisRotation(axisXYZ.y, accelSen.range_2_g) + " Degree");
    serial.writeLine("Z Angle: " + SENMPU6050.axisRotation(axisXYZ.z, accelSen.range_2_g) + " Degree");
    serial.writeLine("-----------------------------------------------------------------------------");

    // Output acceleration values
    serial.writeLine("X Acceleration: " + SENMPU6050.axisAcceleration(axisXYZ.x, accelSen.range_2_g) + " g");
    serial.writeLine("Y Acceleration: " + SENMPU6050.axisAcceleration(axisXYZ.y, accelSen.range_2_g) + " g");
    serial.writeLine("Z Acceleration: " + SENMPU6050.axisAcceleration(axisXYZ.z, accelSen.range_2_g) + " g");
    serial.writeLine("-----------------------------------------------------------------------------");

    // Output temperature value
    serial.writeLine("Temperature: " + SENMPU6050.readTemperature() + " C");
    serial.writeLine("-----------------------------------------------------------------------------");
    pause(500)
}
