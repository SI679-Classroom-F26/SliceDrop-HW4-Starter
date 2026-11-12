import { app } from "./app";
import { DB_NAME, MONGO_URI, PORT } from "./constants";
import { connect } from "./db/db";
import { seedDemoCustomerIfEmpty, seedMenuIfEmpty, seedStaffIfEmpty } from "./seed/seed";

// The order here matters: connect, seed, THEN listen. A server that
// accepts requests before its database is ready answers them with errors.
// Note that app.ts never connects -- the tests connect to an in-memory
// Mongo instead, and the app neither knows nor cares.
async function main(): Promise<void> {
  await connect(MONGO_URI, DB_NAME);
  await seedMenuIfEmpty();
  await seedStaffIfEmpty();
  await seedDemoCustomerIfEmpty();

  // TODO: sockets -- app.listen makes an HTTP server you never see, so
  // there's nothing to hand socket.io. Make it yourself instead (createServer
  // from "node:http", with app), pass it to initSockets (sockets/sockets.ts),
  // and call listen on IT. One server for both: Express answers ordinary
  // requests; socket.io takes the connections that ask to become sockets.
  app.listen(PORT, () => {
    console.log(`SliceDrop listening on http://localhost:${PORT}`);
  });
}

main();
