import { route, type Route } from "jsr:@std/http/unstable-route";
import { serveDir } from "jsr:@std/http/file-server";
import { Database } from "jsr:@db/sqlite";

const db = new Database(":memory:");
db.exec("CREATE TABLE IF NOT EXISTS people (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT not null,age INTEGER not null)");
db.exec("INSERT INTO people (name, age) VALUES (?,?)", "bob", 24);
const routes: Route[] = [
  {
    pattern: new URLPattern({ pathname: "/api/people" }),
    handler: (req: Request) => new Response(JSON.stringify(db.prepare("select * from people").all())),
  },
];

function defaultHandler(req: Request) {
   return serveDir(req, {
    fsRoot: "public",
    showIndex: true
  });
}

Deno.serve(route(routes, defaultHandler));