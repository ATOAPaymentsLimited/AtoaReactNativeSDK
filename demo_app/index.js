/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';
import { name as appName } from './app.json';

const Root = () => (
  <RootSiblingParent>
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  </RootSiblingParent>
);

AppRegistry.registerComponent(appName, () => Root);
