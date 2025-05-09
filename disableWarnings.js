// disableWarnings.js
import { LogBox } from 'react-native';

// Ignore all log notifications for demo purposes
LogBox.ignoreAllLogs();

// Uncomment below for more granular control if needed
/*
LogBox.ignoreLogs([
  'Network request failed',
  'Possible Unhandled Promise Rejection',
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  // Add other specific messages to ignore
]);
*/
