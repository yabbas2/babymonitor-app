import React from 'react'
import { Stack } from 'expo-router'

export default function _layout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerTitle: 'Home' }} />
            <Stack.Screen name="bluetooth-scan" options={{ headerTitle: 'Bluetooth Scan' }} />
        </Stack>
    )
}
