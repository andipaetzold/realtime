# Simple (naive) realtime "database"

This monorepo contains multiple packages (scoped under `@andipaetzold/`):

- [`realtime-common`](/packages/realtime-common): shared code between all packages
- [`realtime-react-hooks`](/packages/realtime-react-hooks): Library with react hooks to use `realtime-websocket-client` with React
- [`realtime-rest-client`](/packages/realtime-rest-client): Client to read and write data using REST. No realtime updates.
- [`realtime-server`](/packages/realtime-server): Server implementation
- [`realtime-server-docker`](/packages/realtime-server-docker): Docker container to run server
- [`realtime-websocket-client`](/packages/realtime-websocket-client): Cleint to read and receive realtime updates using websockets. No write.
