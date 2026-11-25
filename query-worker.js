importScripts('vendor/sql-wasm.js');
self.onmessage = async ({data: query}) => {
  try {
    if (!/^\s*select\b/i.test(query) || query.trim().replace(/;$/, '').includes(';')) throw Error('Enter one SELECT statement.');
    const SQL = await initSqlJs({locateFile: file => 'vendor/' + file});
    const db = new SQL.Database();
    db.run("CREATE TABLE transfers(sender TEXT, recipient TEXT, units INTEGER); INSERT INTO transfers VALUES ('A','B',4800),('B','C',4750)");
    function value() {
      const result = db.exec(query)[0];
      if (result?.values.length !== 1 || result.columns.length !== 1) throw Error('Return a single total in one row and one column.');
      return result.values[0][0];
    }
    const actual = value();
    db.run("INSERT INTO transfers VALUES ('B','D',30),('D','B',120)");
    const second = value();
    db.close();
    postMessage({actual, passed: actual === 4750 && second === 4780});
  } catch (error) { postMessage({error: error.message}); }
};
