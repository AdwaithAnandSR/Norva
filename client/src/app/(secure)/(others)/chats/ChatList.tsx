import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatList = () => {
  return (
    <View style={styles.container}>
      <Text>ChatList</Text>
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

export default ChatList;