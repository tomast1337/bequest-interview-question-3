import createApp from "./app";

const PORT = 8080;
const database = { data: "Hello World" };
const app = createApp(database);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
