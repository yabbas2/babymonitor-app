import React, { useEffect } from 'react'
import { PERMISSIONS, RESULTS, request, requestMultiple } from 'react-native-permissions';

export default function Permission() {
    useEffect(() => {
        const HandlePermissions = async () => {
            const perm_1 = await request(PERMISSIONS.IOS.BLUETOOTH);
            console.debug('request BLUETOOTH', perm_1);
            let perm_1_state: boolean = (perm_1 === RESULTS.GRANTED);

            const perm_2 = await requestMultiple([PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, PERMISSIONS.IOS.LOCATION_ALWAYS]);
            console.debug('request LOCATION_WHEN_IN_USE', perm_2[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]);
            console.debug('request LOCATION_ALWAYS', perm_2[PERMISSIONS.IOS.LOCATION_ALWAYS]);
            let perm_2_state: boolean = (Object.values(perm_2).includes(RESULTS.GRANTED));

            return perm_1_state && perm_2_state
        };
        HandlePermissions();
    }, []);
    return (<></>);
}
