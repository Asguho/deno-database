import { serveDir } from 'jsr:@std/http/file-server';
import { Database } from 'jsr:@db/sqlite';

const db = new Database(':memory:');

db.exec(
  'CREATE TABLE IF NOT EXISTS people (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT not null, sirName TEXT not null,age INTEGER not null)'
);

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;

  if (pathname == '/api/people') {
    return Response.json(db.prepare('select * from people').all());
  }

  if (pathname == '/api/addPeople') {
    const formData = await req.formData();
    const [name, sirName, age] = [formData.get('name'), formData.get('sirName'), formData.get('age')];

    if (!(name && sirName && age)) return new Response('Please fill all fields', { status: 400 });

    db.exec('INSERT INTO people (name, sirName, age) VALUES (?, ?, ?)', name.toString(), sirName.toString(), age.toString());

    return Response.redirect(new URL("/", req.url), 303);
  }

  return serveDir(req, {
    fsRoot: 'public',
    showIndex: true,
  });
});
