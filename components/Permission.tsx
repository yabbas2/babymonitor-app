import React, { useEffect, useState } from 'react'
import { PERMISSIONS, RESULTS, request, requestMultiple } from 'react-native-permissions';
import { View, Text } from 'react-native'

export default function Permission() {
    const [bluetoothAccess, setBluetoothAccess] = useState(false)
    const [locationAccess, setLocationAccess] = useState(false)
    useEffect(() => {
        const HandlePermissions = async () => {
            const perm_1 = await request(PERMISSIONS.IOS.BLUETOOTH);
            console.log('request BLUETOOTH', perm_1);
            let perm_1_state: boolean = (perm_1 === RESULTS.GRANTED);
            setBluetoothAccess(perm_1_state);

            const perm_2 = await requestMultiple([PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, PERMISSIONS.IOS.LOCATION_ALWAYS]);
            console.log('request LOCATION_WHEN_IN_USE', perm_2[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]);
            console.log('request LOCATION_ALWAYS', perm_2[PERMISSIONS.IOS.LOCATION_ALWAYS]);
            let perm_2_state: boolean = (Object.values(perm_2).includes(RESULTS.GRANTED));
            setLocationAccess(perm_2_state);

            return perm_1_state && perm_2_state
        };
        HandlePermissions();
    }, []);
    return (
        <View>
            <Text>BLuetooth Permission = {bluetoothAccess ? 'Allowed' : 'Disallowed'}</Text>
            <Text>Location Permission = {locationAccess ? 'Allowed' : 'Disallowed'}</Text>
        </View>
    )
}
