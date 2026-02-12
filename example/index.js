/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import App from './App';
import { name as appName } from './app.json';

const Root = () => (
  <RootSiblingParent>
    <App />
  </RootSiblingParent>
);

AppRegistry.registerComponent(appName, () => Root);
