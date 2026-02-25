import { combineReducers } from "redux";

import storage from "redux-persist/lib/storage";
import settingReducer from './slice/setting';
import gameReducer from './slice/game';

const rootPersistConfig = {
    key:'root',
    storage,
    keyPrefix:'redux-',
    whitelist:[],
}

const rootReducer = combineReducers({
    setting:settingReducer,
    game:gameReducer,
});
export {rootPersistConfig, rootReducer};