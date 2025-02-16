import { View  } from 'react-native'
import React from 'react'
import Permission from '@/components/Permission'
import BluetoothHandler from '@/components/BluetoothHandler'

export default function BluetoothScan() {
    return (
        <View>
            <Permission />
            <BluetoothHandler />
        </View>
    )
}
