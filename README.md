# MakeCode Package for the Joy-IT SEN-MPU6050.

This library provides a Microsoft Makecode package for the Joy-IT SEN-MPU6050 gyroscope module.
See https://joy-it.net/products/SEN-MPU6050 for more details.

## Gyroscope values

You can retrieve the gyroscope value of each individual axis (X, Y and Z). This value indicates how fast an angle changes over time. The unit of the so-called angular velocity is given in rad/s.
To be able to track both fast and slow motions, the sensitivity can be chosen between 250 dps, 500 dps, 1000 dps and 2000 dps (degrees per second).

```typescript
// Retrieve gyroscope value of x axis with sensitiviy of 250dps
serial.writeLine("X Gyroscope: " + SENMPU6050.gyroscope(axisXYZ.x, gyroSen.range_250_dps) + " rad/s");
```

```typescript
// Retrieve gyroscope value of y axis with 500dps
serial.writeLine("Y Gyroscope: " + SENMPU6050.gyroscope(axisXYZ.y, gyroSen.range_500_dps) + " rad/s");
```

```typescript
// Retrieve gyroscope value of z axis with 1000 dps
serial.writeLine("Z Gyroscope: " + SENMPU6050.gyroscope(axisXYZ.z, gyroSen.range_1000_dps) + " rad/s");;
```

```typescript
// Retrieve gyroscope value of z axis with 2000 dps
serial.writeLine("Z Gyroscope: " + SENMPU6050.gyroscope(axisXYZ.z, gyroSen.range_2000_dps) + " rad/s");;
```

## Acceleration values

You can retrieve the acceleration value of each individual axis (X, Y and Z). This value indicates the force per mass and is given in the unit g. In order to be able to to measure as precisely as possible and to cover as large a range as possible, the span of the accelerometer can bet set in the ranges of +-2g, +-4g, +-8g and +-16g.

```typescript
// Retrieve acceleration value of x axis with a range of +-2g
serial.writeLine("X Acceleration: " + SENMPU6050.axisAcceleration(axisXYZ.x, accelSen.range_2_g) + " g");
```

```typescript
// Retrieve acceleration value of y axis with a range of +-4g
serial.writeLine("Y Acceleration: " + SENMPU6050.axisAcceleration(axisXYZ.y, accelSen.range_4_g) + " g");
```

```typescript
// Retrieve acceleration value of z axis with a range of +-8g
serial.writeLine("Z Acceleration: " + SENMPU6050.axisAcceleration(axisXYZ.z, accelSen.range_8_g) + " g");
```

```typescript
// Retrieve acceleration value of z axis with a range of +-16g
serial.writeLine("Z Acceleration: " + SENMPU6050.axisAcceleration(axisXYZ.z, accelSen.range_16_g) + " g");
```

## Angle values

You can retrieve the angle value of each individual axis (X, Y and Z). This value indicates the tilt of the device. The unit is given in degrees. Since the value is caluclated via the accelerometer, the measuring range can also be set here in the values of +-2g, +-4g, +-8g and +-16g.

```typescript
// Retrieve angle value of x axis with a range of +-2g
serial.writeLine("X Angle: " + SENMPU6050.axisRotation(axisXYZ.x, accelSen.range_2_g) + " Degree");
```

```typescript
// Retrieve angle value of y axis with a range of +-4g
serial.writeLine("Y Angle: " + SENMPU6050.axisRotation(axisXYZ.y, accelSen.range_4_g) + " Degree");
```

```typescript
// Retrieve angle value of z axis with a range of +-8g
serial.writeLine("X Angle: " + SENMPU6050.axisRotation(axisXYZ.z, accelSen.range_8_g) + " Degree");
```

```typescript
// Retrieve angle value of z axis with a range of +-16g
serial.writeLine("X Angle: " + SENMPU6050.axisRotation(axisXYZ.z, accelSen.range_16_g) + " Degree");
```

## Temperature

The sensor also features a temperature sensor. The unit is specified in degrees Celsisus.

```typescript
// Retrieve angle value of z axis with a range of +-16g
serial.writeLine("Temperature: " + SENMPU6050.readTemperature() + " C");
```

## Supported targets

* for PXT/microbit

## License

MIT
