# BabyMonitor IOS App

## Development

   ```bash
   npm install
   npx pod-install
   npx expo prebuild -p ios
   npx expo run:ios --device
   ```
## TODOs

* [ ] When bluetooth or location permissions are denied, the app should raise error ble scan ui
* [ ] When bluetooth is off, use `Linking.openURL('App-Prefs:Bluetooth')`
