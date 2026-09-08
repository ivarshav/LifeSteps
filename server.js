import path from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import express from "express";
import helmet from "helmet";

const app = express();
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "out");
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  "/_next/static",
  express.static(path.join(OUT, "_next/static"), {
    immutable: true,
    maxAge: "1y",
  }),
);

app.use(
  express.static(OUT, {
    extensions: ["html"],
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    },
  }),
);

app.use((_req, res) => {
  res
    .status(404)
    .set("Cache-Control", "public, max-age=0, must-revalidate")
    .sendFile(path.join(OUT, "404.html"));
});

app.listen(PORT, () => {
  console.log(`Life Steps listening on ${PORT}`);
});
