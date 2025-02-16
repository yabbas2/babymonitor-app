import { View, Text, StyleSheet } from 'react-native';

export default function Video() {
    return (
        <View style={styles.container}>
            <Text>Tab Video</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

