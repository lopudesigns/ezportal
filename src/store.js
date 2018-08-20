import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import ezira from 'ezhelp.js';
import rootSaga from './sagas';
import app from './reducers/app';
import user from './reducers/user';
import tracking from './reducers/tracking';

const reducers = combineReducers({
    app,
    user,
    tracking,
});

if (window.config.EZAPI_URL) {
    ezhelp.js.api.setOptions({ url: window.config.EZAPI_URL });
}

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducers,
    window.devToolsExtension && window.devToolsExtension(),
    applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(rootSaga);

export default store;
