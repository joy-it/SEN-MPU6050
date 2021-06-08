// Initialize sensor for usage
SENMPU6050.initMPU6050()

while(true) {
    // Output gyroscope values
    serial.writeLine("X Gyroscope: " + SENMPU6050.gyroscope(axisXYZ.x, gyroSen.RANGE_250_DPS) + " rad/s");
    serial.writeLine("Y Gyroscope: " + SENMPU6050.gyroscope(axisXYZ.y, gyroSen.RANGE_250_DPS) + " rad/s");
    serial.writeLine("Z Gyroscope: " + SENMPU6050.gyroscope(axisXYZ.z, gyroSen.RANGE_250_DPS) + " rad/s");
    serial.writeLine("-----------------------------------------------------------------------------");

    // Output angle values
    serial.writeLine("X Angle: " + SENMPU6050.axisRotation(axisXYZ.x, accelSen.RANGE_2_G) + " Degree");
    serial.writeLine("Y Angle: " + SENMPU6050.axisRotation(axisXYZ.y, accelSen.RANGE_2_G) + " Degree");
    serial.writeLine("Z Angle: " + SENMPU6050.axisRotation(axisXYZ.z, accelSen.RANGE_2_G) + " Degree");
    serial.writeLine("-----------------------------------------------------------------------------");

    // Output acceleration values
    serial.writeLine("X Acceleration: " + SENMPU6050.axisAcceleration(axisXYZ.x, accelSen.RANGE_2_G) + " g");
    serial.writeLine("Y Acceleration: " + SENMPU6050.axisAcceleration(axisXYZ.y, accelSen.RANGE_2_G) + " g");
    serial.writeLine("Z Acceleration: " + SENMPU6050.axisAcceleration(axisXYZ.z, accelSen.RANGE_2_G) + " g");
    serial.writeLine("-----------------------------------------------------------------------------");

    // Output temperature value
    serial.writeLine("Temperature: " + SENMPU6050.readTemperature() + " C");
    serial.writeLine("-----------------------------------------------------------------------------");
    pause(500)
}
