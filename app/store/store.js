import { createStore, compose } from 'redux'
import { reduxFirestore } from 'redux-firestore'
import firebase from 'firebase'
import { firebase as fbConfig } from './config'
import 'firebase/firestore'
import { combineReducers } from 'redux'
import { reactReduxFirebase, firebaseReducer } from 'react-redux-firebase'
import { firestoreReducer as firestore } from 'redux-firestore'

const rootReducer = combineReducers({
  firebase: firebaseReducer,
  firestore: firestore,
});

const settings = {timestampsInSnapshots: true}

export function configureStore(initialState, history) {
  firebase.initializeApp(fbConfig)
  firebase.firestore().settings(settings)

  const rrfConfig = {
    userProfile: 'users',
    enableRedirectHandling: false,
    useFirestoreForProfile: true
  }

  const enhancers = []
  const devToolsExtension = window.devToolsExtension;
  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
  const createStoreWithMiddleware = compose(
    reactReduxFirebase(firebase, rrfConfig),
    reduxFirestore(firebase, rrfConfig),
    ...enhancers
  )(createStore)
  const store = createStoreWithMiddleware(rootReducer)

  return store
}
