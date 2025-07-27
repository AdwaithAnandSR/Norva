import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Signin = () => {
  return (
    <View style={styles.container}>
      <Text>Signin</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Signin;