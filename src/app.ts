import express from "express";
import mongoose from "mongoose";

import usersRouter from "./routes/users";
import cardsRouter from "./routes/cards";

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());

// Роуты
app.use("/users", usersRouter);
app.use("/cards", cardsRouter);

// 404 на всё остальное
app.use((req, res) => {
  res.status(404).send({ message: "Ресурс не найден" });
});

// Простой обработчик ошибок
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).send({ message: "На сервере произошла ошибка" });
});

mongoose
  .connect("mongodb://localhost:27017/mestodb")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(Number(PORT), "0.0.0.0", () =>
      console.log(`Server listening on port ${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));