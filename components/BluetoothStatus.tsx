import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import BleManager, { BleState } from 'react-native-ble-manager';

BleManager.start({ showAlert: false });

export default function BluetoothStatus() {
    const [bluetoothState, setBluetoothState] = useState(false);
    useEffect(() => {
        const checkBluetoothStatus = async () => {
            const state = await BleManager.checkState();
            console.log('BL state: ', state);
            setBluetoothState(state === BleState.On);
        }
        checkBluetoothStatus();
    }, []);
    return (
        <View>
            <Text>Bluetooth Status = {bluetoothState ? 'ON' : 'OFF'}</Text>
        </View>
    )
}
