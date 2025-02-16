import { SafeAreaView, StyleSheet, View, Text, FlatList, TouchableHighlight, Pressable, } from 'react-native';
import React, { useEffect, useState } from 'react'
import BleManager, { BleState, Peripheral, BleDisconnectPeripheralEvent, BleManagerDidUpdateValueForCharacteristicEvent, PeripheralInfo } from 'react-native-ble-manager';
import { Colors } from 'react-native/Libraries/NewAppScreen';

// TODO: add try-catch error handling

const SECONDS_TO_SCAN = 6;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATE = false;

type connectStateType = "connected" | "connecting" | "disconnected";

declare module 'react-native-ble-manager' {
    // enrich local contract with custom state properties
    interface Peripheral {
        connectState?: connectStateType;
    }
}

export default function BluetoothHandler() {
    const [isScanning, setIsScanning] = useState(false);
    const [peripherals, setPeripherals] = useState(
        new Map<Peripheral['id'], Peripheral>()
    );

    const setPeripheralConnectState = (peripheralId: string, state: connectStateType) => {
        setPeripherals((map) => {
            let p = map.get(peripheralId);
            if (p) {
                p.connectState = state
                return new Map(map.set(peripheralId, p));
            }
            return map;
        });
    }

    const setPeripheralRssi = (peripheralId: string, rssi: number) => {
        setPeripherals((map) => {
            let p = map.get(peripheralId);
            if (p) {
                p.rssi = rssi;
                return new Map(map.set(p.id, p));
            }
            return map;
        });
    }

    const startScan = async () => {
        const blState = await BleManager.checkState();
        if (blState === BleState.On) {
            if (!isScanning) {

                // reset found peripherals before scan
                setPeripherals(new Map<Peripheral['id'], Peripheral>());

                console.debug('[startScan] starting scan...');
                await BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN, ALLOW_DUPLICATE);
                console.debug('[startScan] scan promise returned successfully.');
                setIsScanning(true);
            }
        } else {
            // TODO: ask user to enable bluetooth
            console.error('[startScan] bluetooth is off.');
        }
    };

    const handleStopScan = () => {
        setIsScanning(false);
        console.debug('[handleStopScan] scan is stopped.');
    };

    const handleDisconnectedPeripheral = (event: BleDisconnectPeripheralEvent) => {
        if (!event) return;

        console.debug(`[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`);
        setPeripheralConnectState(event.peripheral, "disconnected");
    };

    const handleConnectPeripheral = (event: any) => {
        if (!event) return;

        console.log(`[handleConnectPeripheral][${event.peripheral}] connected.`);
    };

    const handleUpdateValueForCharacteristic = (data: BleManagerDidUpdateValueForCharacteristicEvent) => {
        if (!data) return;

        console.debug(`[handleUpdateValueForCharacteristic] received data from '${data.peripheral}' with characteristic='${data.characteristic}' and value='${data.value}'`);
    };

    const handleDiscoverPeripheral = (peripheral: Peripheral) => {
        if (!peripheral) return;

        console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral.id, peripheral.name);
        if (!peripheral.name) { // only accept peripherals with name
            return;
        }
        peripheral.connectState = "disconnected"; // initial connection state
        setPeripherals((map) => {
            return new Map(map.set(peripheral.id, peripheral));
        });
    };

    const togglePeripheralConnection = async (peripheral: Peripheral) => {
        if (!peripheral) return;

        if (peripheral.connectState === "connected") {
            console.log('Disconnecting from peripheral...');
            await BleManager.disconnect(peripheral.id);
        } else if (peripheral.connectState === "disconnected") {
            await connectPeripheral(peripheral);
        } else { // otherwise
            console.error("unexpected peripheral connect state");
        }
    };

    const retrieveServices = async () => { // TODO: remove
        const peripheralInfos: PeripheralInfo[] = [];
        for (const [peripheralId, peripheral] of peripherals) {
            if (peripheral.connectState === "connected") {
                const newPeripheralInfo =
                    await BleManager.retrieveServices(peripheralId);
                peripheralInfos.push(newPeripheralInfo);
            }
        }
        return peripheralInfos;
    };

    const readCharacteristics = async () => { // TODO: remove
        const services = await retrieveServices();

        for (const peripheralInfo of services) {
            peripheralInfo.characteristics?.forEach(async (c) => {
                const value = await BleManager.read(
                    peripheralInfo.id,
                    c.service,
                    c.characteristic
                );
                console.log('[readCharacteristics]', 'peripheralId', peripheralInfo.id, 'service', c.service, 'char', c.characteristic, '\n\tvalue', value);
            });
        }
    };

    const connectPeripheral = async (peripheral: Peripheral) => {
        console.debug('connecting to peripheral...');
        if (!peripheral) return;
        setPeripheralConnectState(peripheral.id, "connecting");

        await BleManager.connect(peripheral.id);
        console.debug(`[connectPeripheral][${peripheral.id}] connected.`);

        setPeripheralConnectState(peripheral.id, "connected");

        // before retrieving services, it is often a good idea to let bonding & connection finish properly
        await sleep(900);

        // test read current RSSI value, retrieve services first
        const peripheralData = await BleManager.retrieveServices(peripheral.id);
        console.debug(`[connectPeripheral][${peripheral.id}] retrieved peripheral services`, peripheralData);

        const rssi = await BleManager.readRSSI(peripheral.id);
        console.debug(`[connectPeripheral][${peripheral.id}] retrieved current RSSI value: ${rssi}.`);
        setPeripheralRssi(peripheral.id, rssi);
    };

    function sleep(ms: number) {
        return new Promise<void>((resolve) => setTimeout(resolve, ms));
    }

    useEffect(() => {
        BleManager.start({ showAlert: false })
            .then(() => console.debug('BleManager started.'))
            .catch((error: any) => console.error('BeManager could not be started.', error));

        const listeners: any[] = [
            BleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
            BleManager.onStopScan(handleStopScan),
            BleManager.onConnectPeripheral(handleConnectPeripheral),
            BleManager.onDidUpdateValueForCharacteristic(handleUpdateValueForCharacteristic),
            BleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),
        ];

        return () => { // clean up
            console.debug('Component unmounting. Removing listeners...');
            for (const listener of listeners) {
                listener.remove();
            }
        };
    }, []);

    const renderItem = ({ item }: { item: Peripheral }) => {
        const backgroundColor = item.connectState === "connected" ? '#069400' : Colors.white;
        return (
            <TouchableHighlight
                underlayColor="#0082FC"
                onPress={() => togglePeripheralConnection(item)}
            >
                <View style={[styles.row, { backgroundColor }]}>
                    <Text style={styles.peripheralName}>
                        {/* completeLocalName (item.name) & shortAdvertisingName (advertising.localName) may not always be the same */}
                        {item.name} - {item?.advertising?.localName}
                        {item.connectState === "connecting" && ' - Connecting...'}
                    </Text>
                    <Text style={styles.rssi}>RSSI: {item.rssi}</Text>
                    <Text style={styles.peripheralId}>{item.id}</Text>
                </View>
            </TouchableHighlight>
        );
    };

    return (
        <>
            <SafeAreaView>
                <View>
                    <Pressable onPress={startScan}>
                        <Text>
                            {isScanning ? 'Scanning...' : 'Scan Bluetooth'}
                        </Text>
                    </Pressable>

                    <Pressable onPress={readCharacteristics}>
                        <Text>Read characteristics</Text>
                    </Pressable>
                </View>

                {Array.from(peripherals.values()).length === 0 && (
                    <View style={styles.row}>
                        <Text style={styles.noPeripherals}>
                            No Peripherals, press "Scan Bluetooth" above.
                        </Text>
                    </View>
                )}

                <FlatList
                    data={Array.from(peripherals.values())}
                    contentContainerStyle={{ rowGap: 12 }}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            </SafeAreaView>
        </>
    );
};

const boxShadow = {
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
};

const styles = StyleSheet.create({
    engine: {
        position: 'absolute',
        right: 10,
        bottom: 0,
        color: Colors.black,
    },
    buttonGroup: {
        flexDirection: 'row',
        width: '100%',
    },
    scanButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#0a398a',
        margin: 10,
        borderRadius: 12,
        flex: 1,
        ...boxShadow,
    },
    scanButtonText: {
        fontSize: 16,
        letterSpacing: 0.25,
        color: '#ffff'
    },
    body: {
        backgroundColor: '#0082FC',
        flex: 1,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
    peripheralName: {
        fontSize: 16,
        textAlign: 'center',
        padding: 10,
    },
    rssi: {
        fontSize: 12,
        textAlign: 'center',
        padding: 2,
    },
    peripheralId: {
        fontSize: 12,
        textAlign: 'center',
        padding: 2,
        paddingBottom: 20,
    },
    row: {
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 20,
        ...boxShadow,
    },
    noPeripherals: {
        margin: 10,
        textAlign: 'center',
        color: Colors.white,
    },
});
