import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface TabIconProps {
  name: 'search' | 'lexicon' | 'saved' | 'history';
  color: string;
  focused: boolean;
}

export const TabIcon: React.FC<TabIconProps> = ({ name, color, focused }) => {
  const getGlyph = () => {
    switch (name) {
      case 'search':
        return '⌕';
      case 'lexicon':
        return '📖';
      case 'saved':
        return focused ? '★' : '☆';
      case 'history':
        return '◷';
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.icon,
          { color },
          name === 'search' && styles.searchIcon,
          name === 'saved' && styles.savedIcon,
          name === 'history' && styles.historyIcon,
        ]}
        aria-hidden
      >
        {getGlyph()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  searchIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
  savedIcon: {
    fontSize: 18,
  },
  historyIcon: {
    fontSize: 20,
  },
});
