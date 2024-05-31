import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import connection from './db';

const MySQLStoreConstructor = MySQLStore(session as any);

const sessionStore = new MySQLStoreConstructor({}, connection);

export default sessionStore;
