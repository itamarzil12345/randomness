import { SERVER_PORT } from "./constants.js";
import { app } from "./app.js";

const port = Number(process.env.PORT) || SERVER_PORT;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
