import { View  } from 'react-native'
import React from 'react'
import Permission from '@/components/Permission'
import BluetoothStatus from '@/components/BluetoothStatus'

export default function BleScan() {
    return (
        <View>
            <Permission  />
            <BluetoothStatus />
        </View>
    )
}
