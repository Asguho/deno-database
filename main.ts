import { serveDir } from 'jsr:@std/http/file-server';
import { Database } from 'jsr:@db/sqlite';

const db = new Database(':memory:');

db.exec(
  'CREATE TABLE IF NOT EXISTS people (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT not null, sirName TEXT not null,age INTEGER not null)'
);

Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;

  if (pathname == '/api/people') {
    return new Response(JSON.stringify(db.prepare('select * from people').all()));
  }

  if (pathname == '/api/addPeople') {
    const formdata = await req.formData();

    if (!(formdata.get('name') && formdata.get('sirName') && formdata.get('age'))) {
      return new Response('Please fill all the fields');
    }

    db.exec(
      'INSERT INTO people (name, sirName, age) VALUES (?,?, ?)',
      formdata.get('name')?.toString(),
      formdata.get('sirName')?.toString(),
      formdata.get('age')?.toString()
    );

    return new Response(null, {
      status: 303,
      headers: {
        Location: '/',
      },
    });
  }

  return serveDir(req, {
    fsRoot: 'public',
    showIndex: true,
  });
});
