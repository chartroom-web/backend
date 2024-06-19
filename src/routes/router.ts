import Route from "./route";
import AuthRoute from "./auth.route";
import MessageRoute from "./message.route";
import http from 'http';

export const create_router = function(server : http.Server) : Array<Route> {
    return [new AuthRoute(), new MessageRoute(server)]
}
